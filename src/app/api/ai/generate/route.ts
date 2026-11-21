import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { tryPrivilegedClient } from "@/lib/supabase/privileged";
import {
  ASSISTANT_DEFINITIONS,
  getAiProvider,
  sanitizePromptInput,
} from "@/lib/ai/provider";
import {
  buildGuestSessionSetCookieHeader,
  getClientIpHash,
  getMemoryUsageToday,
  recordMemoryUsageToday,
  resolveGuestSession,
} from "@/lib/ai/session";

const aiRequestSchema = z.object({
  assistantId: z.enum([
    "brief_assistant",
    "ad_hook_generator",
    "caption_generator",
    "product_description",
    "brand_concept",
  ]),
  prompt: z
    .string()
    .trim()
    .min(3, "Please enter at least 3 characters describing your product or goal.")
    .max(1200, "Prompt exceeds maximum length (1200 characters)."),
  locale: z.enum(["en", "bn"]).optional().default("en"),
});

async function loadGatewayPolicy() {
  const envKillSwitch =
    process.env.STUDIO_AI_KILL_SWITCH === "true" ||
    process.env.STUDIO_AI_KILL_SWITCH === "1";
  let dbKillSwitch = false;
  let dailyBudgetCapBdt = Number(process.env.STUDIO_AI_DAILY_BUDGET_BDT || 500);
  let guestDailyQuota = Number(process.env.STUDIO_AI_GUEST_DAILY_QUOTA || 3);

  const privileged = tryPrivilegedClient();
  if (privileged) {
    const { data } = await privileged
      .from("ai_gateway_config")
      .select("kill_switch_active, daily_budget_cap_bdt, guest_daily_quota")
      .eq("id", "default")
      .maybeSingle();

    if (data) {
      dbKillSwitch = Boolean(data.kill_switch_active);
      dailyBudgetCapBdt = Number(data.daily_budget_cap_bdt);
      guestDailyQuota = Number(data.guest_daily_quota);
    }
  }

  return {
    killSwitchActive: envKillSwitch || dbKillSwitch,
    dailyBudgetCapBdt: Number.isFinite(dailyBudgetCapBdt) ? dailyBudgetCapBdt : 500,
    guestDailyQuota: Number.isFinite(guestDailyQuota) ? guestDailyQuota : 3,
    privileged,
  };
}

async function logUsageEvent(params: {
  privileged: ReturnType<typeof tryPrivilegedClient>;
  requestId: string;
  sessionId: string;
  userId: string | null;
  assistantId: string;
  provider: "puter_sponsored" | "demo_template" | "blocked";
  model: string;
  status:
    | "completed"
    | "quota_blocked"
    | "budget_blocked"
    | "kill_switch_blocked"
    | "failed";
  inputChars: number;
  outputChars: number;
  estimatedCostBdt: number;
  latencyMs: number;
  ipHash: string;
}) {
  if (!params.privileged) return;
  try {
    await params.privileged.from("ai_usage_events").insert({
      request_id: params.requestId,
      session_id: params.sessionId,
      user_id: params.userId,
      assistant_id: params.assistantId,
      provider: params.provider,
      model: params.model,
      status: params.status,
      input_chars: params.inputChars,
      output_chars: params.outputChars,
      estimated_cost_bdt: params.estimatedCostBdt,
      latency_ms: params.latencyMs,
      ip_hash: params.ipHash,
    });
  } catch {
    // Non-fatal telemetry failure must not crash request handling
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = `ai-${randomUUID()}`;
  const guest = resolveGuestSession(request);
  const ipHash = getClientIpHash(request);

  const attachCookie = (res: NextResponse) => {
    if (guest.isNew) {
      res.headers.append(
        "Set-Cookie",
        buildGuestSessionSetCookieHeader(guest.signedCookieValue)
      );
    }
    return res;
  };

  try {
    let userId: string | null = null;
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    const body = await request.json();
    const parsed = aiRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue =
        parsed.error.issues[0]?.message || "Invalid AI assistant payload.";
      return attachCookie(
        NextResponse.json({ ok: false, error: firstIssue }, { status: 400 })
      );
    }

    const assistant = ASSISTANT_DEFINITIONS[parsed.data.assistantId];
    const cleanPrompt = sanitizePromptInput(parsed.data.prompt);
    const policy = await loadGatewayPolicy();

    // 1. Server-authoritative Emergency Kill Switch (ignores any client body flag)
    if (policy.killSwitchActive) {
      await logUsageEvent({
        privileged: policy.privileged,
        requestId,
        sessionId: guest.sessionId,
        userId,
        assistantId: assistant.id,
        provider: "blocked",
        model: "none",
        status: "kill_switch_blocked",
        inputChars: cleanPrompt.length,
        outputChars: 0,
        estimatedCostBdt: 0,
        latencyMs: Date.now() - startedAt,
        ipHash,
      });

      return attachCookie(
        NextResponse.json(
          {
            ok: false,
            code: "AI_KILL_SWITCH_ACTIVE",
            error:
              "Studio AI Gateway is paused by Studio Pulse Administration. All 6 browser-native Free Tools and 13 Human Services remain active.",
          },
          { status: 503 }
        )
      );
    }

    // 2. Enforce Daily Guest Trial Quota & Studio Daily Budget Cap
    let sessionUsedCount = 0;
    let studioDailySpendBdt = 0;

    if (policy.privileged) {
      const todayIso = new Date();
      todayIso.setUTCHours(0, 0, 0, 0);

      const [{ count: guestCount }, { data: spendRows }] = await Promise.all([
        policy.privileged
          .from("ai_usage_events")
          .select("id", { count: "exact", head: true })
          .eq("session_id", guest.sessionId)
          .eq("status", "completed")
          .gte("created_at", todayIso.toISOString()),
        policy.privileged
          .from("ai_usage_events")
          .select("estimated_cost_bdt")
          .eq("status", "completed")
          .gte("created_at", todayIso.toISOString()),
      ]);

      sessionUsedCount = guestCount ?? 0;
      studioDailySpendBdt = (spendRows || []).reduce(
        (sum, r) => sum + Number(r.estimated_cost_bdt || 0),
        0
      );
    } else {
      const mem = getMemoryUsageToday(guest.sessionId);
      sessionUsedCount = mem.count;
      studioDailySpendBdt = mem.globalSpendBdt;
    }

    if (sessionUsedCount >= policy.guestDailyQuota) {
      await logUsageEvent({
        privileged: policy.privileged,
        requestId,
        sessionId: guest.sessionId,
        userId,
        assistantId: assistant.id,
        provider: "blocked",
        model: "none",
        status: "quota_blocked",
        inputChars: cleanPrompt.length,
        outputChars: 0,
        estimatedCostBdt: 0,
        latencyMs: Date.now() - startedAt,
        ipHash,
      });

      return attachCookie(
        NextResponse.json(
          {
            ok: false,
            code: "GUEST_DAILY_QUOTA_REACHED",
            quota: {
              used: sessionUsedCount,
              limit: policy.guestDailyQuota,
              remaining: 0,
            },
            error: `Daily sponsored AI trial quota (${policy.guestDailyQuota}/${policy.guestDailyQuota}) reached for this session. Continue using our 6 unlimited Free Tools or submit a Smart Brief.`,
          },
          { status: 429 }
        )
      );
    }

    if (
      studioDailySpendBdt + assistant.estimatedCostBdt >
      policy.dailyBudgetCapBdt
    ) {
      await logUsageEvent({
        privileged: policy.privileged,
        requestId,
        sessionId: guest.sessionId,
        userId,
        assistantId: assistant.id,
        provider: "blocked",
        model: "none",
        status: "budget_blocked",
        inputChars: cleanPrompt.length,
        outputChars: 0,
        estimatedCostBdt: 0,
        latencyMs: Date.now() - startedAt,
        ipHash,
      });

      return attachCookie(
        NextResponse.json(
          {
            ok: false,
            code: "STUDIO_DAILY_BUDGET_CAP_REACHED",
            error:
              "Studio daily AI sponsorship budget has been reached for today. Browser-native Free Tools remain unlimited.",
          },
          { status: 503 }
        )
      );
    }

    // 3. Execute AI Provider (Real Puter Sponsored vs explicit Demo Template Fallback)
    const { provider } = getAiProvider();
    let result;
    try {
      result = await provider.generate({
        assistant,
        userPrompt: cleanPrompt,
        locale: parsed.data.locale,
      });
    } catch (providerErr: unknown) {
      await logUsageEvent({
        privileged: policy.privileged,
        requestId,
        sessionId: guest.sessionId,
        userId,
        assistantId: assistant.id,
        provider: "puter_sponsored",
        model: process.env.PUTER_AI_MODEL || "gpt-4o-mini",
        status: "failed",
        inputChars: cleanPrompt.length,
        outputChars: 0,
        estimatedCostBdt: 0,
        latencyMs: Date.now() - startedAt,
        ipHash,
      });

      const msg =
        providerErr instanceof Error
          ? providerErr.message
          : "Upstream AI provider request failed.";
      return attachCookie(
        NextResponse.json(
          {
            ok: false,
            isRealAi: false,
            code: "AI_PROVIDER_UPSTREAM_ERROR",
            error: `Sponsored Puter AI request failed: ${msg}`,
          },
          { status: 502 }
        )
      );
    }

    const billedCostBdt = result.isRealAi ? assistant.estimatedCostBdt : 0;
    const outputChars = result.lines.join("\n").length;

    if (!policy.privileged) {
      recordMemoryUsageToday(guest.sessionId, billedCostBdt);
    }

    await logUsageEvent({
      privileged: policy.privileged,
      requestId,
      sessionId: guest.sessionId,
      userId,
      assistantId: assistant.id,
      provider: result.provider,
      model: result.model,
      status: "completed",
      inputChars: cleanPrompt.length,
      outputChars,
      estimatedCostBdt: billedCostBdt,
      latencyMs: Date.now() - startedAt,
      ipHash,
    });

    const newUsed = sessionUsedCount + 1;

    return attachCookie(
      NextResponse.json({
        ok: true,
        isRealAi: result.isRealAi,
        gatewayMode: result.gatewayMode,
        model: result.model,
        disclaimer: result.disclaimer,
        assistantId: assistant.id,
        assistantTitle: assistant.title,
        recommendedServiceId: assistant.recommendedServiceId,
        recommendedKitSku: assistant.recommendedKitSku,
        estimatedCostBdt: billedCostBdt,
        puterLoginRequired: false,
        quota: {
          used: newUsed,
          limit: policy.guestDailyQuota,
          remaining: Math.max(0, policy.guestDailyQuota - newUsed),
        },
        lines: result.lines,
        generatedAt: new Date().toISOString(),
      })
    );
  } catch {
    return attachCookie(
      NextResponse.json(
        { ok: false, error: "Unable to process Studio AI request." },
        { status: 400 }
      )
    );
  }
}
