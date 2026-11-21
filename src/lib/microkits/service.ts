import { randomUUID } from "node:crypto";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { CANONICAL_AI_MICRO_KITS } from "@/lib/catalog";
import { ASSISTANT_DEFINITIONS, getAiProvider } from "@/lib/ai/provider";
import type { Json } from "@/types/database.types";

export type MicroKitSku = "SKU-SHOP-49" | "SKU-CAMP-99" | "SKU-BRAND-199";

const SKU_CREDIT_COST: Record<MicroKitSku, number> = {
  "SKU-SHOP-49": 1,
  "SKU-CAMP-99": 2,
  "SKU-BRAND-199": 3,
};

const SKU_ASSISTANT_MAP: Record<MicroKitSku, keyof typeof ASSISTANT_DEFINITIONS> = {
  "SKU-SHOP-49": "product_description",
  "SKU-CAMP-99": "ad_hook_generator",
  "SKU-BRAND-199": "brand_concept",
};

function tryPrivilegedClient() {
  try {
    return createPrivilegedClient();
  } catch {
    return null;
  }
}

export async function getCreditBalance(userId: string): Promise<number> {
  const privileged = tryPrivilegedClient();
  if (!privileged) return 0;

  const { data, error } = await privileged
    .from("credit_ledger")
    .select("delta_credits")
    .eq("user_id", userId);

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + Number(row.delta_credits || 0), 0);
}

export async function createMicroKitOrder(params: {
  userId: string;
  sku: MicroKitSku;
  promptInput: string;
  currency: "BDT" | "USD";
}) {
  const kit = CANONICAL_AI_MICRO_KITS.find((k) => k.sku === params.sku);
  if (!kit) {
    return { ok: false as const, error: `Unknown micro-kit SKU: ${params.sku}` };
  }

  if (!kit.checkoutEnabled) {
    return {
      ok: false as const,
      error:
        "AI Micro-Product self-serve checkout is locked until production payment webhook verification is activated.",
    };
  }

  const privileged = tryPrivilegedClient();
  if (!privileged) {
    return {
      ok: false as const,
      error: "Database credentials unavailable for micro-kit order creation.",
    };
  }

  const cleanPrompt = params.promptInput.trim();
  if (cleanPrompt.length < 5) {
    return {
      ok: false as const,
      error: "Please describe your business or campaign in at least 5 characters.",
    };
  }

  const orderRef = `KIT-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const amount = params.currency === "USD" ? kit.priceUsd : kit.priceBdt;

  const { data, error } = await privileged
    .from("microkit_orders")
    .insert({
      order_ref: orderRef,
      user_id: params.userId,
      sku: params.sku,
      currency: params.currency,
      amount,
      payment_status: "pending",
      prompt_input: cleanPrompt,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false as const,
      error: error?.message || "Failed to record micro-kit order.",
    };
  }

  return { ok: true as const, order: data };
}

export async function reserveAndFulfillMicroKit(orderId: string) {
  const privileged = tryPrivilegedClient();
  if (!privileged) {
    return { ok: false as const, error: "Privileged database unavailable." };
  }

  const { data: order, error: fetchErr } = await privileged
    .from("microkit_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return { ok: false as const, error: "Micro-kit order not found." };
  }

  if (order.payment_status !== "paid") {
    return {
      ok: false as const,
      error: `Cannot fulfill order in status "${order.payment_status}". Verified payment is required first.`,
    };
  }

  const sku = order.sku as MicroKitSku;
  const creditCost = SKU_CREDIT_COST[sku];

  // 1. Mint purchased credits & place reservation hold atomically in ledger
  await privileged.from("credit_ledger").insert([
    {
      user_id: order.user_id,
      entry_type: "purchase_mint",
      delta_credits: creditCost,
      reference_id: order.order_ref,
      notes: `Minted ${creditCost} credits from verified payment for ${sku}`,
    },
    {
      user_id: order.user_id,
      entry_type: "reservation_hold",
      delta_credits: -creditCost,
      reference_id: order.order_ref,
      notes: `Reserved ${creditCost} credits during artifact generation`,
    },
  ]);

  // 2. Generate Artifact
  try {
    const { provider } = getAiProvider();
    const assistantDef = ASSISTANT_DEFINITIONS[SKU_ASSISTANT_MAP[sku]];
    const aiResult = await provider.generate({
      assistant: assistantDef,
      userPrompt: order.prompt_input,
      locale: "en",
    });

    if (!aiResult.isRealAi) {
      throw new Error(
        "Live AI generation provider unavailable; paid micro-kit order cannot fulfill with demo template."
      );
    }

    const artifactPayload: Json = {
      sku,
      orderRef: order.order_ref,
      model: aiResult.model,
      lines: aiResult.lines,
      generatedAt: new Date().toISOString(),
    };

    await privileged
      .from("microkit_orders")
      .update({
        payment_status: "fulfilled",
        artifact_payload: artifactPayload,
        fulfilled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await privileged.from("credit_ledger").insert({
      user_id: order.user_id,
      entry_type: "settlement_commit",
      delta_credits: 0,
      reference_id: order.order_ref,
      notes: `Committed ${creditCost} credits upon successful delivery of ${sku}`,
    });

    return { ok: true as const, artifact: artifactPayload };
  } catch (err: unknown) {
    // Release held credit and record refund
    await privileged.from("credit_ledger").insert([
      {
        user_id: order.user_id,
        entry_type: "reservation_release",
        delta_credits: creditCost,
        reference_id: order.order_ref,
        notes: "Released held credits due to generation failure",
      },
      {
        user_id: order.user_id,
        entry_type: "refund",
        delta_credits: -creditCost,
        reference_id: order.order_ref,
        notes: "Reversed minted credits on automated order refund",
      },
    ]);

    await privileged
      .from("microkit_orders")
      .update({
        payment_status: "refunded",
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return {
      ok: false as const,
      error:
        err instanceof Error
          ? err.message
          : "Generation failed; credits released and order marked refunded.",
    };
  }
}
