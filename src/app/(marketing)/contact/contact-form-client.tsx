"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InquirySubmission {
  referenceId: string;
  receivedAt: string;
  workEmail: string;
  persistedTo?: string;
}

export function ContactFormClient() {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [timeline, setTimeline] = useState("Standard Turnaround (2–5 Days)");
  const [discipline, setDiscipline] = useState(
    "DISC-01 · Brand & Visual Identity (SRV-01 to SRV-04)"
  );
  const [brief, setBrief] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<InquirySubmission | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !workEmail.trim() || brief.trim().length < 10) {
      const msg =
        "Please complete your name, work email, and a short project brief (min. 10 characters).";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          workEmail,
          organization,
          timeline,
          discipline,
          brief,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const err = data.error || "Unable to submit consultation request.";
        setErrorMsg(err);
        toast.error(err);
        return;
      }

      setSubmitted({
        referenceId: data.referenceId,
        receivedAt: data.receivedAt,
        workEmail,
        persistedTo: data.persistedTo,
      });
      toast.success(`Consultation logged (${data.referenceId})`);
    } catch {
      const err =
        "Network error while sending consultation request. Please try again.";
      setErrorMsg(err);
      toast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 py-4 text-xs font-mono">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-[#F6F4EF]">
              Consultation Request Durably Logged
            </h3>
            <p className="text-[#F6F4EF]/75 font-sans leading-relaxed">
              Our Production Desk has recorded your brief under reference{" "}
              <strong className="text-[#D9BD81] font-mono">
                {submitted.referenceId}
              </strong>
              . A Human Creative Lead will reply to{" "}
              <strong className="text-[#F6F4EF]">{submitted.workEmail}</strong>{" "}
              or you can reference this code directly on WhatsApp{" "}
              <strong className="text-[#D9BD81]">+8801778307704</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            render={<Link href="/builder">Configure Smart Brief &rarr;</Link>}
            className="cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSubmitted(null);
              setBrief("");
            }}
            className="border-[#232528] text-[#F6F4EF] font-mono text-xs"
          >
            Submit Another Inquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
      {errorMsg && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-red-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-full-name"
            className="text-[#F6F4EF] uppercase text-[11px] block"
          >
            Full Name
          </label>
          <Input
            id="contact-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tariq Hasan"
            required
            className="bg-[#090A0A] border-[#232528] h-10 text-xs text-[#F6F4EF]"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="contact-work-email"
            className="text-[#F6F4EF] uppercase text-[11px] block"
          >
            Work Email
          </label>
          <Input
            id="contact-work-email"
            type="email"
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            placeholder="founder@brand.com"
            required
            className="bg-[#090A0A] border-[#232528] h-10 text-xs text-[#F6F4EF]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-org"
            className="text-[#F6F4EF] uppercase text-[11px] block"
          >
            Organization / Brand
          </label>
          <Input
            id="contact-org"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Sylhet Botanicals"
            className="bg-[#090A0A] border-[#232528] h-10 text-xs text-[#F6F4EF]"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="contact-timeline"
            className="text-[#F6F4EF] uppercase text-[11px] block"
          >
            Target Timeline
          </label>
          <select
            id="contact-timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full h-10 bg-[#090A0A] border border-[#232528] text-[#F6F4EF] rounded-md px-3 text-xs focus:outline-none"
          >
            <option value="Standard Turnaround (2–5 Days)">
              Standard Turnaround (2–5 Days)
            </option>
            <option value="Priority Same-Day Slot (ADD-14 Subject to Confirmation)">
              Priority Same-Day Slot (ADD-14 Subject to Confirmation)
            </option>
            <option value="10-Min Express Micro-Edit (SRV-02 / SRV-05 / SRV-13 Only)">
              10-Min Express Micro-Edit (SRV-02 / SRV-05 / SRV-13 Only)
            </option>
            <option value="Commercial Bundle Sprint (5–10 Days)">
              Commercial Bundle Sprint (5–10 Days)
            </option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-discipline"
          className="text-[#F6F4EF] uppercase text-[11px] block"
        >
          Approved Creative Discipline (4 Disciplines)
        </label>
        <select
          id="contact-discipline"
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
          className="w-full h-10 bg-[#090A0A] border border-[#232528] text-[#F6F4EF] rounded-md px-3 text-xs focus:outline-none"
        >
          <option value="DISC-01 · Brand & Visual Identity (SRV-01 to SRV-04)">
            DISC-01 &middot; Brand &amp; Visual Identity (SRV-01 to SRV-04)
          </option>
          <option value="DISC-02 · Social Media & Campaign Creative (SRV-05 to SRV-08)">
            DISC-02 &middot; Social Media &amp; Campaign Creative (SRV-05 to
            SRV-08)
          </option>
          <option value="DISC-03 · Commercial Graphic & Print Design (SRV-09 to SRV-11)">
            DISC-03 &middot; Commercial Graphic &amp; Print Design (SRV-09 to
            SRV-11)
          </option>
          <option value="DISC-04 · Motion, Reels & Short-Form Video (SRV-12 to SRV-13)">
            DISC-04 &middot; Motion, Reels &amp; Short-Form Video (SRV-12 to
            SRV-13)
          </option>
          <option value="Commercial Bundle (BND-01 to BND-05)">
            Commercial Bundle (BND-01 to BND-05)
          </option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-brief"
          className="text-[#F6F4EF] uppercase text-[11px] block"
        >
          Project Brief &amp; Deliverable Goals
        </label>
        <textarea
          id="contact-brief"
          rows={4}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          required
          placeholder="Describe your target deliverables, required file formats (SVG/PDF/MP4), and reference links..."
          className="w-full rounded-md border border-[#232528] bg-[#090A0A] p-3 text-xs text-[#F6F4EF] focus:outline-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cyber-glow bg-[#D9BD81] hover:bg-[#D9BD81]/90 text-[#090A0A] font-semibold text-xs font-mono h-11"
      >
        {isSubmitting
          ? "Logging Consultation Request..."
          : "Submit Studio Consultation Brief →"}
      </Button>
      <p className="text-[10px] text-[#F6F4EF]/55 text-center pt-1">
        Official Studio Contact: WhatsApp +8801778307704 &bull;
        bhaifreakinstudio@gmail.com
      </p>
    </form>
  );
}
