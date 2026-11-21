import type { Metadata } from "next";
import { CreativeOfficeOS } from "@/features/creative-office/creative-office-os";

export const metadata: Metadata = {
  title:
    "6 Free Browser-Native Creative Tools (Zero Login) — Freakin's Studio",
  description:
    "Image Resizer & Platform Exporter, Image Compressor, Deterministic Color Palette Extractor, WCAG 2.2 Brand Contrast Checker, Offline Markdown Brief Builder, and 3D Packaging Specimen Preview.",
};

export const instant = false;

export default function FreeToolsPage() {
  return <CreativeOfficeOS initialRoute="tools" />;
}
