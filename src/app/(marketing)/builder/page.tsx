import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  getCatalogCategories,
  getCatalogServices,
  getAllAddOns,
} from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { PackageBuilderClient } from "./package-builder-client";

export const metadata: Metadata = {
  title: "Build Your Creative Package — Freakin's Studio",
  description:
    "Assemble and configure your multi-disciplinary creative production package across 60 canonical services with instant pricing calculations and quotation routing.",
};

export const instant = false;

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: initialServiceId } = await searchParams;

  const [categories, services, addOns] = await Promise.all([
    getCatalogCategories(),
    getCatalogServices(),
    getAllAddOns(),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-brand-black">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
          <div className="space-y-2">
            <span className="badge-mono text-brand-highlight">
              Signature Creative Commerce Configurator
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-light">
              Build Your Creative Package
            </h1>
            <p className="text-brand-muted max-w-2xl text-xs sm:text-sm font-mono">
              Configure services, quantities, deliverable formats and specialized add-ons with real-time server-authoritative pricing or request a formal commercial quotation.
            </p>
          </div>

          <PackageBuilderClient
            categories={categories}
            services={services}
            addOns={addOns}
            initialServiceId={initialServiceId}
            isAuthenticated={!!user}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
