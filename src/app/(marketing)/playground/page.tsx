import type { Metadata } from "next";
import { CreativeOfficeOS } from "@/features/creative-office/creative-office-os";

export const metadata: Metadata = {
  title:
    "Free Creative Playground (6 Browser-Native Utilities) — Freakin's Studio",
  description:
    "Run real local HTML5 Canvas image resizing, compression, palette extraction, WCAG 2.2 contrast checking, and brief generation with zero login.",
};

export const instant = false;

export default function PlaygroundPage() {
  return <CreativeOfficeOS initialRoute="tools" />;
}
