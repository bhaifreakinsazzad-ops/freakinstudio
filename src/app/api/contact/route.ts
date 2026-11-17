import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Please provide your full name."),
  workEmail: z.string().trim().email("Please enter a valid work email address."),
  organization: z.string().trim().optional().default(""),
  timeline: z.string().trim().min(2, "Please select a target timeline."),
  discipline: z.string().trim().min(1, "Please select a creative discipline."),
  brief: z
    .string()
    .trim()
    .min(10, "Please share at least 10 characters describing your project scope."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid inquiry details.";
      return NextResponse.json({ ok: false, error: firstIssue }, { status: 400 });
    }

    const referenceId = `FS-INQ-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const receivedAt = new Date().toISOString();

    // Record in audit_logs when Supabase is configured (best-effort)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = await createClient();
        await supabase.from("audit_logs").insert({
          event_type: "CONSULTATION_INQUIRY_SUBMITTED",
          details: JSON.stringify({
            referenceId,
            fullName: parsed.data.fullName,
            workEmail: parsed.data.workEmail,
            organization: parsed.data.organization,
            timeline: parsed.data.timeline,
            discipline: parsed.data.discipline,
          }),
        });
      } catch {
        // Inquiry confirmation proceeds cleanly even in guest/unconfigured mode
      }
    }

    return NextResponse.json({
      ok: true,
      referenceId,
      receivedAt,
      message: "Consultation request received by Studio Operations.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process request payload." },
      { status: 400 }
    );
  }
}
