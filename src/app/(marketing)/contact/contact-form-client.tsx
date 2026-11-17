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
}

export function ContactFormClient() {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [timeline, setTimeline] = useState("Standard (1–2 weeks)");
  const [discipline, setDiscipline] = useState(
    "Brand Identity & Logo Systems (Category B)"
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
      });
      toast.success(`Consultation logged (${data.referenceId})`);
    } catch {
      const err = "Network error while sending consultation request. Please try again.";
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
            <h3 className="text-sm font-bold text-brand-light">
              Consultation Request Received
            </h3>
            <p className="text-brand-muted font-sans leading-relaxed">
              Our Production Desk has logged your brief under reference{" "}
              <strong className="text-brand-highlight font-mono">{submitted.referenceId}</strong>.
              A Senior Creative Producer will reply to{" "}
              <strong className="text-brand-light">{submitted.workEmail}</strong> within 4 business hours.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            render={<Link href="/builder">Configure Package Estimate &rarr;</Link>}
            className="cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSubmitted(null);
              setBrief("");
            }}
            className="border-brand-border text-brand-light font-mono text-xs"
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
        <div className="rounded-lg border border-brand-danger/40 bg-brand-danger/10 px-3.5 py-2.5 text-brand-danger">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-full-name" className="text-brand-light uppercase text-[11px] block">
            Full Name
          </label>
          <Input
            id="contact-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Elena Rostova"
            required
            className="bg-brand-surface border-brand-border h-10 text-xs text-brand-light"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact-work-email" className="text-brand-light uppercase text-[11px] block">
            Work Email
          </label>
          <Input
            id="contact-work-email"
            type="email"
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            placeholder="elena@company.com"
            required
            className="bg-brand-surface border-brand-border h-10 text-xs text-brand-light"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-org" className="text-brand-light uppercase text-[11px] block">
            Organization / Brand
          </label>
          <Input
            id="contact-org"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Aurum Robotics Corp"
            className="bg-brand-surface border-brand-border h-10 text-xs text-brand-light"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact-timeline" className="text-brand-light uppercase text-[11px] block">
            Target Timeline
          </label>
          <select
            id="contact-timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full h-10 bg-brand-surface border border-brand-border text-brand-light rounded-md px-3 text-xs focus:outline-none"
          >
            <option value="Rush (within 24–48 hours)">Rush (within 24–48 hours)</option>
            <option value="Standard (1–2 weeks)">Standard (1–2 weeks)</option>
            <option value="Quarterly Sprints (1+ months)">Quarterly Sprints (1+ months)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-discipline" className="text-brand-light uppercase text-[11px] block">
          Creative Disciplines Needed
        </label>
        <select
          id="contact-discipline"
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
          className="w-full h-10 bg-brand-surface border border-brand-border text-brand-light rounded-md px-3 text-xs focus:outline-none"
        >
          <option value="Graphic Design & Visual Communication (Category A)">
            Graphic Design &amp; Visual Communication (Category A)
          </option>
          <option value="Brand Identity & Logo Systems (Category B)">
            Brand Identity &amp; Logo Systems (Category B)
          </option>
          <option value="Video Production, Editing & Motion Graphics (Category C)">
            Video Production, Editing &amp; Motion Graphics (Category C)
          </option>
          <option value="Social Media & Digital Content (Category D)">
            Social Media &amp; Digital Content (Category D)
          </option>
          <option value="Advertising & Marketing Creative (Category E)">
            Advertising &amp; Marketing Creative (Category E)
          </option>
          <option value="Digital & AI-Powered Creative Production (Category F)">
            Digital &amp; AI-Powered Creative Production (Category F)
          </option>
          <option value="Corporate & Business Communication (Category G)">
            Corporate &amp; Business Communication (Category G)
          </option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-brief" className="text-brand-light uppercase text-[11px] block">
          Project Brief &amp; Requirements
        </label>
        <textarea
          id="contact-brief"
          rows={4}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          required
          placeholder="Describe your commercial vision, campaign channels, and deliverable expectations..."
          className="w-full rounded-md border border-brand-border bg-brand-surface p-3 text-xs text-brand-light focus:outline-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cyber-glow bg-brand-highlight hover:bg-brand-highlight/90 text-brand-black font-semibold text-xs font-mono h-11"
      >
        {isSubmitting ? "Sending Consultation Request..." : "Send Consultation Request →"}
      </Button>
      <p className="text-[10px] text-brand-muted text-center pt-1">
        Guaranteed response within 4 business hours from a Senior Production Architect.
      </p>
    </form>
  );
}
