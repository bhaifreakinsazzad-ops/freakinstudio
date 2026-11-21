import { describe, expect, it } from "vitest";
import {
  getCatalogCategories,
  getCatalogServices,
  getCatalogVariants,
  getCatalogBundles,
  getAllAddOns,
  getCatalogAIMicroKits,
  getCatalogConceptWorks,
  getServiceById,
  getAllServiceAddOnsMap,
  getAddOnFamily,
  getServiceConfigSchema,
} from "@/lib/catalog";

describe("Canonical Creative Catalog (Creative Office OS 2.0 — 4 / 13 / 15 / 5 / 14)", () => {
  it("contains exactly 4 canonical creative disciplines (DISC-01 to DISC-04)", async () => {
    const categories = await getCatalogCategories();
    expect(categories.length).toBe(4);
    const ids = categories.map((c) => c.id);
    expect(ids).toEqual(["DISC-01", "DISC-02", "DISC-03", "DISC-04"]);
  });

  it("contains exactly 13 canonical core services (SRV-01 to SRV-13) with 2 consolidated revisions", async () => {
    const services = await getCatalogServices();
    expect(services.length).toBe(13);

    const counts: Record<string, number> = {};
    for (const s of services) {
      counts[s.category_id] = (counts[s.category_id] || 0) + 1;
      expect(s.revisions).toBe(2);
      expect(s.base_bdt).toBeGreaterThan(0);
      expect(s.base_usd).toBeGreaterThan(0);
      expect(s.estimated_hours).toBeGreaterThan(0);
      expect(s.title_bn).toBeTruthy();
    }

    expect(counts["DISC-01"]).toBe(4); // SRV-01..04
    expect(counts["DISC-02"]).toBe(4); // SRV-05..08
    expect(counts["DISC-03"]).toBe(3); // SRV-09..11
    expect(counts["DISC-04"]).toBe(2); // SRV-12..13
  });

  it("restricts 10-minute express eligibility strictly to SRV-02, SRV-05, and SRV-13", async () => {
    const services = await getCatalogServices();
    const expressIds = services
      .filter((s) => s.express_eligible)
      .map((s) => s.id);
    expect(expressIds).toEqual(["SRV-02", "SRV-05", "SRV-13"]);
  });

  it("contains exactly 15 scoped service variants (VAR-01 to VAR-15) and 5 commercial bundles (BND-01 to BND-05)", () => {
    const variants = getCatalogVariants();
    expect(variants.length).toBe(15);

    const bundles = getCatalogBundles();
    expect(bundles.length).toBe(5);
    for (const b of bundles) {
      expect(b.revisions).toBe(2);
      expect(b.includedServiceIds.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("contains exactly 14 optional add-ons (ADD-01 to ADD-14) mapped across the 13 core services", async () => {
    const addOns = await getAllAddOns();
    expect(addOns.length).toBe(14);

    const serviceAddOnsMap = getAllServiceAddOnsMap();
    const serviceIds = Object.keys(serviceAddOnsMap);
    expect(serviceIds.length).toBe(13);

    for (const sid of serviceIds) {
      expect(serviceAddOnsMap[sid].length).toBeGreaterThan(0);
    }
  });

  it("contains 3 proposed AI Micro-Kits (৳49, ৳99, ৳199) and 4 Concept Works labeled Concept Work — Not Client Work", () => {
    const kits = getCatalogAIMicroKits();
    expect(kits.map((k) => k.priceBdt)).toEqual([49, 99, 199]);

    const works = getCatalogConceptWorks();
    expect(works.length).toBe(4);
    for (const w of works) {
      expect(w.truthBadge).toBe("CONCEPT WORK — NOT CLIENT WORK");
    }
  });

  it("classifies all 14 add-on labels into canonical functional families", async () => {
    const addOns = await getAllAddOns();
    const validFamilies = new Set([
      "Strategy & Research",
      "Content & Copywriting",
      "Creative Production",
      "Distribution & Adaptation",
      "Operations & Handover",
      "Commercial & Extended Scope",
    ]);

    for (const addon of addOns) {
      const family = getAddOnFamily(addon.label);
      expect(validFamilies.has(family)).toBe(true);
    }
  });

  it("retrieves canonical services (SRV-01) and preserves legacy archive fallback (A01) for historical DB links", async () => {
    const srv01 = await getServiceById("SRV-01");
    expect(srv01).not.toBeNull();
    expect(srv01?.id).toBe("SRV-01");
    expect(srv01?.category?.id).toBe("DISC-01");
    expect(srv01?.addOns.length).toBeGreaterThan(0);

    const legacyA01 = await getServiceById("A01");
    expect(legacyA01).not.toBeNull();
    expect(legacyA01?.id).toBe("A01");

    const schema02 = getServiceConfigSchema("SRV-02");
    expect(schema02.express10MinEligible).toBe(true);
    expect(schema02.rushAvailable).toBe(false);
  });
});
