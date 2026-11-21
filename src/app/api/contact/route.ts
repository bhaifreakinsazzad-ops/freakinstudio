import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createPrivilegedClient } from "@/lib/supabase/privileged";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Please provide your full name.").max(120),
  workEmail: z
    .string()
    .trim()
    .email("Please enter a valid work email address.")
    .max(180),
  organization: z.string().trim().max(160).optional().default(""),
  timeline: z.string().trim().min(2, "Please select a target timeline.").max(120),
  discipline: z.string().trim().min(1, "Please select a creative discipline.").max(120),
  brief: z
    .string()
    .trim()
    .min(
      10,
      "Please share at least 10 characters describing your project scope."
    )
    .max(4000),
});

const OFFICIAL_CONTACTS = {
  whatsapp: "+8801778307704",
  email: "bhaifreakinstudio@gmail.com",
  website: "freakinstudio.space",
} as const;

const recentInquiriesByIp = new Map<string, number[]>();

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "local-client";
    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex")
      .slice(0, 16);

    const now = Date.now();
    const windowMs = 60_000;
    const prevTimestamps = (recentInquiriesByIp.get(ipHash) || []).filter(
      (ts) => now - ts < windowMs
    );

    if (prevTimestamps.length >= 10) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error:
            "Too many consultation requests from this connection. Please wait 1 minute or message WhatsApp +8801778307704.",
          officialContacts: OFFICIAL_CONTACTS,
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
        { ok: false, persisted: false, error: firstIssue },
        { status: 400 }
      );
    }

    // Fail closed if Supabase service-role persistence is not configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY)
    ) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error:
            "Durable inquiry database is not configured in this environment. Please contact Freakin's Studio directly on WhatsApp +8801778307704 or bhaifreakinstudio@gmail.com.",
          officialContacts: OFFICIAL_CONTACTS,
        },
        { status: 503 }
      );
    }

    const referenceId = `FS-INQ-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;
    const receivedAt = new Date().toISOString();

    const adminClient = createPrivilegedClient();
    const { error: dbError } = await adminClient.from("inquiries").insert({
      reference_id: referenceId,
      full_name: parsed.data.fullName,
      work_email: parsed.data.workEmail,
      organization: parsed.data.organization,
      timeline: parsed.data.timeline,
      discipline: parsed.data.discipline,
      brief: parsed.data.brief,
      status: "new",
      source_ip_hash: ipHash,
    });

    if (dbError) {
      console.error("Durable inquiry insert failed:", dbError.message);
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error:
            "Unable to save your consultation inquiry to Studio Operations storage right now. Please contact WhatsApp +8801778307704 or bhaifreakinstudio@gmail.com.",
          officialContacts: OFFICIAL_CONTACTS,
        },
        { status: 503 }
      );
    }

    recentInquiriesByIp.set(ipHash, [...prevTimestamps, now]);

    return NextResponse.json({
      ok: true,
      persisted: true,
      referenceId,
      receivedAt,
      persistedTo: "supabase_inquiries",
      officialContacts: OFFICIAL_CONTACTS,
      message: "Consultation request durably saved to Studio Operations.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Unable to process request payload." },
      { status: 400 }
    );
  }
}
