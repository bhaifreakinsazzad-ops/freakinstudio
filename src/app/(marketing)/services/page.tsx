import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCatalogCategories, getCatalogServices } from "@/lib/catalog";
import { ServicesCatalogClient } from "./services-catalog-client";

export const metadata: Metadata = {
  title: "Service Discovery — Freakin's Studio",
  description:
    "Explore the canonical 60-service creative production catalog across Graphic Design, Brand Identity, Video/Motion, Social Media, Advertising, AI Creative, and Corporate Communication.",
};

export const instant = false;

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([
    getCatalogCategories(),
    getCatalogServices(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-brand-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-10">
          <div className="space-y-3">
            <span className="badge-mono text-brand-highlight">
              Canonical Service Discovery
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-light">
              60 Creative Services Across 7 Disciplines
            </h1>
            <p className="text-brand-muted max-w-2xl text-sm sm:text-base">
              Browse our complete creative production capabilities. Select any service to view full
              specifications, add-on options, or bundle it directly into the 7-Step Package Builder.
            </p>
          </div>

          <ServicesCatalogClient
            initialCategories={categories}
            initialServices={services}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
