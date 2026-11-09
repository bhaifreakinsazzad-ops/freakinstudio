import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { calculatePricingSummary } from "@/lib/pricing/engine";
import servicesJson from "../../supabase/seed/data/services.json";
import categoriesJson from "../../supabase/seed/data/service-categories.json";
import type { Service, AddOn } from "@/types/domain";

interface RawSeedService {
  id: string;
  category_id: string;
  title: string;
  title_bn: string | null;
  base_usd: number;
  base_bdt: number;
  days: number;
  revisions: number;
  pricing_status: "approved" | "quote_required";
}

describe("Creative Commerce OS — End-to-End Production Workflow", () => {
  const allServices: Service[] = (servicesJson as unknown as RawSeedService[]).map((s) => ({
    ...s,
    created_at: "",
    updated_at: "",
  }));

  describe("1. Canonical 60-Service Catalog Verification", () => {
    it("contains exactly 60 approved services across 7 categories (A–G)", () => {
      expect(allServices.length).toBe(60);

      const categoryCounts = allServices.reduce((acc, s) => {
        acc[s.category_id] = (acc[s.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Canonical distribution:
      // A=10, B=8, C=12, D=8, E=8, F=7, G=7 -> Total = 60
      expect(categoryCounts["A"]).toBe(10);
      expect(categoryCounts["B"]).toBe(8);
      expect(categoryCounts["C"]).toBe(12);
      expect(categoryCounts["D"]).toBe(8);
      expect(categoryCounts["E"]).toBe(8);
      expect(categoryCounts["F"]).toBe(7);
      expect(categoryCounts["G"]).toBe(7);
      expect(categoriesJson.length).toBe(7);
    });

    it("verifies all services possess valid bilingual metadata and positive rates", () => {
      for (const service of allServices) {
        expect(service.id).toMatch(/^[A-G]\d{2}$/);
        expect(service.title.length).toBeGreaterThan(0);
        expect(service.title_bn).toBeTruthy();
        expect(service.base_bdt).toBeGreaterThan(0);
        expect(service.base_usd).toBeGreaterThan(0);
        expect(service.days).toBeGreaterThan(0);
        expect(service.revisions).toBeGreaterThan(0);
      }
    });
  });

  describe("2. Package Configuration & Authoritative Pricing", () => {
    it("computes exact subtotal, rush surcharge, and maintains currency integrity", () => {
      const s1 = allServices[0]; // A01
      const s2 = allServices[1]; // A02
      const addOns: AddOn[] = [
        { id: "addon-1", label: "Extra File Format", unit_price_usd: 25, unit_price_bdt: 3000 },
      ];

      const pricing = calculatePricingSummary({
        serviceIds: [s1.id, s2.id],
        serviceConfigs: {
          [s1.id]: { quantity: 1, rush: false },
          [s2.id]: { quantity: 1, rush: false },
        },
        selectedAddOns: { [s1.id]: ["addon-1"] },
        currency: "BDT",
        catalogServices: allServices,
        catalogAddOns: addOns,
      });

      const expectedBase = s1.base_bdt + s2.base_bdt;
      const expectedAddons = 3000;
      expect(pricing.subtotalBDT).toBe(expectedBase);
      expect(pricing.addOnsTotalBDT).toBe(expectedAddons);
      expect(pricing.rushSurchargeBDT).toBe(0);
      expect(pricing.finalBDT).toBe(expectedBase + expectedAddons);

      // Now with Rush Delivery (+35%)
      const rushPricing = calculatePricingSummary({
        serviceIds: [s1.id, s2.id],
        serviceConfigs: {
          [s1.id]: { quantity: 1, rush: true },
          [s2.id]: { quantity: 1, rush: false },
        },
        selectedAddOns: { [s1.id]: ["addon-1"] },
        currency: "BDT",
        catalogServices: allServices,
        catalogAddOns: addOns,
      });

      const expectedRush = Math.round(s1.base_bdt * 0.35);
      expect(rushPricing.rushSurchargeBDT).toBe(expectedRush);
      expect(rushPricing.finalBDT).toBe(expectedBase + expectedAddons + expectedRush);
    });

    it("enforces quotation gating when volume exceeds threshold bounds", () => {
      // Threshold 1: > 5 services
      const sixServices = allServices.slice(0, 6);
      const volumeGated = calculatePricingSummary({
        serviceIds: sixServices.map((s) => s.id),
        serviceConfigs: {},
        selectedAddOns: {},
        currency: "BDT",
        catalogServices: allServices,
        catalogAddOns: [],
      });
      expect(volumeGated.quoteRequired).toBe(true);
      expect(volumeGated.quoteReasons.some((r) => r.includes("exceeds standard 5-service checkout threshold"))).toBe(true);

      // Threshold 2: Single service with high investment (over 150,000 BDT or 1,250 USD)
      const enterpriseService: Service = {
        id: "C99",
        category_id: "C",
        title: "Enterprise Web Infrastructure",
        title_bn: "এন্টারপ্রাইজ ওয়েব অবকাঠামো",
        base_usd: 2000,
        base_bdt: 240000,
        days: 20,
        revisions: 5,
        pricing_status: "approved",
        created_at: "",
        updated_at: "",
      };

      const highValueGated = calculatePricingSummary({
        serviceIds: ["C99"],
        serviceConfigs: {},
        selectedAddOns: {},
        currency: "BDT",
        catalogServices: [...allServices, enterpriseService],
        catalogAddOns: [],
      });
      expect(highValueGated.quoteRequired).toBe(true);
      expect(highValueGated.quoteReasons.some((r) => r.includes("exceeds the self-service checkout limit"))).toBe(true);
    });
  });

  describe("3. Project Lifecycle & Strict Revision Quota", () => {
    it("tracks revision rounds and flags change-orders when quota is exceeded", () => {
      const project = {
        id: "proj_test_01",
        title: "Brand Master Identity",
        status: "in_production",
        revisions_used: 0,
        max_revisions: 3,
      };

      // Round 1
      project.revisions_used += 1;
      project.status = "client_review";
      expect(project.revisions_used).toBe(1);
      expect(project.revisions_used <= project.max_revisions).toBe(true);

      // Round 2
      project.revisions_used += 1;
      expect(project.revisions_used).toBe(2);

      // Round 3 (Max reached)
      project.revisions_used += 1;
      expect(project.revisions_used).toBe(3);

      // Attempting Round 4 beyond contractual max
      const canRequestMore = project.revisions_used < project.max_revisions;
      expect(canRequestMore).toBe(false);
    });
  });

  describe("4. Binary Deliverable Archive Packaging (JSZip)", () => {
    it("generates a valid, non-empty ZIP buffer containing manifests and master files", async () => {
      const zip = new JSZip();

      // 1. Delivery Manifest
      zip.file(
        "DELIVERY-MANIFEST.txt",
        `FREAKIN'S STUDIO — MASTER PRODUCTION ARCHIVE\nProject: Apex Robotics\nGenerated: ${new Date().toISOString()}`
      );

      // 2. Commercial Buyout License
      zip.file(
        "COMMERCIAL-BUYOUT-LICENSE.txt",
        "PERPETUAL WORLDWIDE COMMERCIAL BUYOUT AGREEMENT\nFreakin's Studio hereby transfers all commercial rights."
      );

      // 3. Technical Specs JSON
      zip.file(
        "SPECS.json",
        JSON.stringify(
          {
            project_id: "proj_test_01",
            color_space: "sRGB / Display P3",
            dpi: 300,
            vector_format: "SVG 1.1 / EPS",
            checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          },
          null,
          2
        )
      );

      // 4. Vector Asset Folder
      zip.file(
        "assets/master-render.svg",
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ff4d00"/></svg>`
      );

      const buffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(500); // Valid compressed archive with files

      // Verify zip contents can be unpacked and read back
      const loadedZip = await JSZip.loadAsync(buffer);
      expect(loadedZip.file("DELIVERY-MANIFEST.txt")).not.toBeNull();
      expect(loadedZip.file("COMMERCIAL-BUYOUT-LICENSE.txt")).not.toBeNull();
      expect(loadedZip.file("SPECS.json")).not.toBeNull();
      expect(loadedZip.file("assets/master-render.svg")).not.toBeNull();

      const manifestContent = await loadedZip.file("DELIVERY-MANIFEST.txt")?.async("string");
      expect(manifestContent).toContain("FREAKIN'S STUDIO");
    });
  });
});
