import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  getCatalogCategories,
  getCatalogServices,
  getCatalogVariants,
  getCatalogBundles,
  getAllAddOns,
} from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { ServicesCatalogClient } from "./services-catalog-client";

export const metadata: Metadata = {
  title:
    "Canonical Creative Service Catalog (13 Services • 4 Disciplines) — Freakin's Studio",
  description:
    "Explore our 13 core creative services across 4 disciplines, 15 scoped variants, 5 commercial bundles, and 14 compatible add-ons with transparent hourly estimates and 2 consolidated revisions.",
};

export const instant = false;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [categories, services, addOns] = await Promise.all([
    getCatalogCategories(),
    getCatalogServices(),
    getAllAddOns(),
  ]);
  const variants = getCatalogVariants();
  const bundles = getCatalogBundles();

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
      <main className="flex-1 py-12 px-4 sm:px-6 bg-[#090A0A]">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="space-y-3">
            <span className="badge-mono text-[#D9BD81]">
              Canonical Architecture &bull; 4 Disciplines / 13 Services / 15
              Variants / 5 Bundles / 14 Add-ons
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F6F4EF]">
              13 Core Services &amp; Hourly Scope Estimator
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-[#F6F4EF]/70 leading-relaxed">
              Every service in our approved catalog includes transparent hourly
              scope calculation,{" "}
              <strong className="text-[#F6F4EF]">
                2 consolidated revision rounds
              </strong>
              , explicit deliverable boundaries, and an interactive{" "}
              <strong className="text-[#D9BD81]">
                5% Launch Promotion Window (20 Nov &ndash; 15 Dec 2026
                Asia/Dhaka)
              </strong>
              .
            </p>
          </div>

          <ServicesCatalogClient
            categories={categories}
            services={services}
            variants={variants}
            bundles={bundles}
            addOns={addOns}
            initialCategory={params.category || "ALL"}
            initialSearch={params.q || ""}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
