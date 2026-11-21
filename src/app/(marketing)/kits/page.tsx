import type { Metadata } from "next";
import { CreativeOfficeOS } from "@/features/creative-office/creative-office-os";

export const metadata: Metadata = {
  title:
    "Studio AI Assistants & AI Micro-Kits (৳49 / ৳99 / ৳199) — Freakin's Studio",
  description:
    "5 Puter-login-free Studio AI creative assistants and 3 fixed-scope AI Micro-Product Kits (Shop Starter ৳49, Campaign Ready ৳99, Brand Mini ৳199).",
};

export const instant = false;

export default function KitsPage() {
  return <CreativeOfficeOS initialRoute="kits" />;
}
