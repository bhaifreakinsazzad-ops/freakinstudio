import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  getCatalogCategories,
  getCatalogServices,
  getCatalogVariants,
  getCatalogBundles,
  getAllAddOns,
  getAllServiceAddOnsMap,
} from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { PackageBuilderClient } from "./package-builder-client";

export const metadata: Metadata = {
  title:
    "Smart Project Brief & Hourly Scope Estimator — Freakin's Studio",
  description:
    "Configure your creative production scope across 13 core services, 15 variants, 5 commercial bundles, and 14 compatible add-ons with transparent hourly pricing.",
};

export const instant = false;

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; bundle?: string }>;
}) {
  const params = await searchParams;
  const [categories, services, addOns] = await Promise.all([
    getCatalogCategories(),
    getCatalogServices(),
    getAllAddOns(),
  ]);
  const variants = getCatalogVariants();
  const bundles = getCatalogBundles();
  const serviceAddOnsMap = getAllServiceAddOnsMap();

  let userEmail: string | null = null;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
    } catch {
      // Guest viewer
    }
  }

  return (
    <>
      <Navbar userEmail={userEmail} />
      <main className="flex-1 py-10 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-7xl">
          <PackageBuilderClient
            categories={categories}
            services={services}
            variants={variants}
            bundles={bundles}
            addOns={addOns}
            serviceAddOnsMap={serviceAddOnsMap}
            initialServiceId={params.service || "SRV-01"}
            initialBundleId={params.bundle || null}
            isAuthenticated={Boolean(userEmail)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
