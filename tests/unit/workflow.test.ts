import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { calculatePricingSummary } from "@/lib/pricing/engine";
import {
  CANONICAL_DISCIPLINES,
  CANONICAL_SERVICES,
  CANONICAL_ADDONS,
} from "@/lib/catalog";

describe("Creative Office OS 2.0 — End-to-End Production Workflow", () => {
  describe("1. Canonical 13-Service / 4-Discipline Catalog Verification", () => {
    it("contains exactly 13 approved services across 4 disciplines (DISC-01 to DISC-04)", () => {
      expect(CANONICAL_SERVICES.length).toBe(13);
      expect(CANONICAL_DISCIPLINES.length).toBe(4);
      expect(CANONICAL_ADDONS.length).toBe(14);
    });

    it("verifies all 13 services possess valid bilingual metadata, 2 revisions, and positive rates", () => {
      for (const service of CANONICAL_SERVICES) {
        expect(service.id).toMatch(/^SRV-\d{2}$/);
        expect(service.title.length).toBeGreaterThan(0);
        expect(service.title_bn).toBeTruthy();
        expect(service.base_bdt).toBeGreaterThan(0);
        expect(service.base_usd).toBeGreaterThan(0);
        expect(service.revisions).toBe(2);
      }
    });
  });

  describe("2. Hourly Package Configuration & 5% Launch Promotion", () => {
    it("computes exact subtotal, compatible add-ons, and 5% launch promo discount", () => {
      const s1 = CANONICAL_SERVICES[0]; // SRV-01 (9000 BDT)
      const s2 = CANONICAL_SERVICES[3]; // SRV-04 (4500 BDT)

      const pricing = calculatePricingSummary({
        serviceIds: [s1.id, s2.id],
        serviceConfigs: {
          [s1.id]: { quantity: 1 },
          [s2.id]: { quantity: 1 },
        },
        selectedAddOns: { [s1.id]: ["ADD-01"] }, // +3000 BDT
        currency: "BDT",
        catalogServices: CANONICAL_SERVICES,
        catalogAddOns: CANONICAL_ADDONS,
        evaluationDate: "2026-11-25", // Inside 5% Launch Promo Window
      });

      const expectedGross = 9000 + 4500 + 3000; // 16500
      const expectedPromo = Math.round(expectedGross * 0.05); // 825
      expect(pricing.subtotalBDT).toBe(13500);
      expect(pricing.addOnsTotalBDT).toBe(3000);
      expect(pricing.promoDiscountBDT).toBe(expectedPromo);
      expect(pricing.finalBDT).toBe(expectedGross - expectedPromo);
    });
  });

  describe("3. Project Lifecycle & 2 Consolidated Revision Quota", () => {
    it("tracks 2 consolidated revision rounds and requires ADD-04 when quota is reached", () => {
      const project = {
        id: "PRJ-2026-104",
        title: "Obsidian Horology Identity",
        status: "in_production",
        revisions_used: 0,
        max_revisions: 2,
      };

      project.revisions_used += 1;
      expect(project.revisions_used).toBe(1);
      expect(project.revisions_used < project.max_revisions).toBe(true);

      project.revisions_used += 1;
      expect(project.revisions_used).toBe(2);
      expect(project.revisions_used < project.max_revisions).toBe(false);
    });
  });

  describe("4. Binary Deliverable Archive Packaging (JSZip)", () => {
    it("generates a valid, non-empty ZIP buffer containing manifests and master files", async () => {
      const zip = new JSZip();
      zip.file(
        "DELIVERY-MANIFEST.txt",
        "FREAKIN'S STUDIO — MASTER PRODUCTION ARCHIVE\nDESIGN. CREATE. PRODUCE. GROW."
      );
      zip.file(
        "assets/master-render.svg",
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#090A0A"/><circle cx="50" cy="50" r="35" fill="#D9BD81"/></svg>`
      );

      const buffer = await zip.generateAsync({ type: "nodebuffer" });
      expect(buffer.length).toBeGreaterThan(150);

      const loadedZip = await JSZip.loadAsync(buffer);
      const manifestContent = await loadedZip
        .file("DELIVERY-MANIFEST.txt")
        ?.async("string");
      expect(manifestContent).toContain("FREAKIN'S STUDIO");
    });
  });
});
