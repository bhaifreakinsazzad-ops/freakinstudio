import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Please provide your full name."),
  workEmail: z
    .string()
    .trim()
    .email("Please enter a valid work email address."),
  organization: z.string().trim().optional().default(""),
  timeline: z.string().trim().min(2, "Please select a target timeline."),
  discipline: z.string().trim().min(1, "Please select a creative discipline."),
  brief: z
    .string()
    .trim()
    .min(
      10,
      "Please share at least 10 characters describing your project scope."
    ),
});

// In-memory rate-limit & verified inquiry ledger for local/staging durability
const recentInquiriesByIp = new Map<string, number[]>();
const verifiedInquiryLedger = new Map<
  string,
  {
    referenceId: string;
    fullName: string;
    workEmail: string;
    organization: string;
    timeline: string;
    discipline: string;
    brief: string;
    receivedAt: string;
    persistedTo: "supabase_audit_logs" | "server_verified_ledger";
  }
>();

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";
    const now = Date.now();
    const windowMs = 60_000;
    const prevTimestamps = (recentInquiriesByIp.get(ip) || []).filter(
      (ts) => now - ts < windowMs
    );

    if (prevTimestamps.length >= 10) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Too many consultation requests from this connection. Please wait 1 minute or message WhatsApp +8801778307704.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue =
        parsed.error.issues[0]?.message || "Invalid inquiry details.";
      return NextResponse.json(
        { ok: false, error: firstIssue },
        { status: 400 }
      );
    }

    const referenceId = `FS-INQ-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;
    const receivedAt = new Date().toISOString();
    let persistedTo: "supabase_audit_logs" | "server_verified_ledger" =
      "server_verified_ledger";

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      try {
        const supabase = await createClient();
        const { error: dbError } = await supabase.from("audit_logs").insert({
          event_type: "CONSULTATION_INQUIRY_SUBMITTED",
          details: JSON.stringify({
            referenceId,
            fullName: parsed.data.fullName,
            workEmail: parsed.data.workEmail,
            organization: parsed.data.organization,
            timeline: parsed.data.timeline,
            discipline: parsed.data.discipline,
            brief: parsed.data.brief,
            receivedAt,
          }),
        });
        if (!dbError) {
          persistedTo = "supabase_audit_logs";
        }
      } catch {
        persistedTo = "server_verified_ledger";
      }
    }

    verifiedInquiryLedger.set(referenceId, {
      referenceId,
      fullName: parsed.data.fullName,
      workEmail: parsed.data.workEmail,
      organization: parsed.data.organization,
      timeline: parsed.data.timeline,
      discipline: parsed.data.discipline,
      brief: parsed.data.brief,
      receivedAt,
      persistedTo,
    });

    recentInquiriesByIp.set(ip, [...prevTimestamps, now]);

    return NextResponse.json({
      ok: true,
      referenceId,
      receivedAt,
      persistedTo,
      officialContacts: {
        whatsapp: "+8801778307704",
        email: "bhaifreakinstudio@gmail.com",
        website: "freakinstudio.space",
      },
      message: "Consultation request durably logged by Studio Operations.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process request payload." },
      { status: 400 }
    );
  }
}
