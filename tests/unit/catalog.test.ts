import { describe, expect, it } from "vitest";
import {
  getCatalogCategories,
  getCatalogServices,
  getAllAddOns,
  getServiceById,
  getAllServiceAddOnsMap,
  getAddOnFamily,
  getServiceConfigSchema,
} from "@/lib/catalog";

describe("Authoritative Creative Service Catalog (Directive 9.0 Section 4 & 8)", () => {
  it("contains exactly 7 canonical service categories", async () => {
    const categories = await getCatalogCategories();
    expect(categories.length).toBe(7);
    const ids = categories.map((c) => c.id).sort();
    expect(ids).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("contains exactly 60 canonical services with verified category distribution", async () => {
    const services = await getCatalogServices();
    expect(services.length).toBe(60);

    const counts: Record<string, number> = {};
    for (const s of services) {
      counts[s.category_id] = (counts[s.category_id] || 0) + 1;
    }

    // Directive 9.0 Section 4 Acceptance
    expect(counts["A"]).toBe(10); // Graphic Design
    expect(counts["B"]).toBe(8);  // Brand Identity
    expect(counts["C"]).toBe(12); // Video Production & Motion
    expect(counts["D"]).toBe(8);  // Social Media & Content
    expect(counts["E"]).toBe(8);  // Advertising & Marketing
    expect(counts["F"]).toBe(7);  // AI-Powered Creative
    expect(counts["G"]).toBe(7);  // Corporate Communication

    expect(10 + 8 + 12 + 8 + 8 + 7 + 7).toBe(60);
  });

  it("ensures all 60 services have unique IDs, valid turnaround days, positive pricing, and bilingual titles", async () => {
    const services = await getCatalogServices();
    const idSet = new Set<string>();

    for (const s of services) {
      expect(idSet.has(s.id)).toBe(false);
      idSet.add(s.id);

      expect(s.title).toBeDefined();
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.title_bn).toBeDefined();
      expect(typeof s.title_bn).toBe("string");

      expect(s.base_bdt).toBeGreaterThan(0);
      expect(s.base_usd).toBeGreaterThan(0);
      expect(s.days).toBeGreaterThan(0);
      expect(s.revisions).toBeGreaterThan(0);
      expect(["approved", "quote_required"]).toContain(s.pricing_status);
    }
  });

  it("verifies the 283 distinct add-ons and 327 service-specific mappings", async () => {
    const addOns = await getAllAddOns();
    expect(addOns.length).toBe(283);

    const serviceAddOnsMap = getAllServiceAddOnsMap();
    const serviceIds = Object.keys(serviceAddOnsMap);
    expect(serviceIds.length).toBe(60); // All 60 services have specialized mappings

    let totalMappings = 0;
    for (const sid of serviceIds) {
      const mapped = serviceAddOnsMap[sid];
      expect(mapped.length).toBeGreaterThan(0);
      totalMappings += mapped.length;
    }

    expect(totalMappings).toBe(327);
  });

  it("classifies all add-on labels into the 6 canonical functional families", async () => {
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

  it("retrieves individual services with hydrated category and specialized add-ons", async () => {
    const srvA01 = await getServiceById("A01");
    expect(srvA01).not.toBeNull();
    expect(srvA01?.id).toBe("A01");
    expect(srvA01?.category?.name).toBe("Graphic Design & Visual Communication");
    expect(srvA01?.addOns.length).toBeGreaterThan(0);

    const srvC02 = await getServiceById("C02");
    expect(srvC02).not.toBeNull();
    expect(srvC02?.id).toBe("C02");
    expect(srvC02?.category?.name).toBe("Video Production, Editing & Motion Graphics");
    expect(srvC02?.addOns.length).toBeGreaterThan(0);
  });

  it("provides specific configurator schemas for each category type", () => {
    const schemaA = getServiceConfigSchema("A01");
    expect(schemaA.formatOptions.some((f) => f.includes("Social Post"))).toBe(true);
    expect(schemaA.rushAvailable).toBe(true);

    const schemaC = getServiceConfigSchema("C01");
    expect(schemaC.formatOptions.some((f) => f.includes("Vertical 9:16"))).toBe(true);
    expect(schemaC.rushAvailable).toBe(true);

    const schemaB = getServiceConfigSchema("B01");
    expect(schemaB.formatOptions.some((f) => f.includes("Vector Suite"))).toBe(true);
  });
});
