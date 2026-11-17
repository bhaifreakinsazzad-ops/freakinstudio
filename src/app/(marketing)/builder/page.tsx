import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  getCatalogCategories,
  getCatalogServices,
  getAllAddOns,
  getAllServiceAddOnsMap,
} from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import type { PackageDraft } from "@/types/domain";
import { getUserDraftsAction } from "./actions";
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
  searchParams: Promise<{ service?: string; payment?: string; error?: string }>;
}) {
  const { service: rawServiceId, payment: paymentStatus, error: paymentError } =
    await searchParams;

  const [categories, services, addOns] = await Promise.all([
    getCatalogCategories(),
    getCatalogServices(),
    getAllAddOns(),
  ]);

  const normalizedServiceId = rawServiceId?.toUpperCase();
  const initialServiceId =
    normalizedServiceId && services.some((s) => s.id === normalizedServiceId)
      ? normalizedServiceId
      : undefined;

  const serviceAddOnsMap = getAllServiceAddOnsMap();

  let user = null;
  let initialDrafts: PackageDraft[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;

      if (user) {
        const draftsRes = await getUserDraftsAction();
        if (draftsRes.ok && draftsRes.drafts) {
          initialDrafts = draftsRes.drafts;
        }
      }
    } catch {
      user = null;
    }
  }

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
            serviceAddOnsMap={serviceAddOnsMap}
            initialDrafts={initialDrafts}
            initialServiceId={initialServiceId}
            paymentStatus={paymentStatus}
            paymentError={paymentError}
            isAuthenticated={!!user}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
