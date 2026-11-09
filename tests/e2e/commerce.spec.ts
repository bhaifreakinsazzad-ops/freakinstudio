import { test, expect } from "@playwright/test";

test.describe("Freakin' Studio — Public Commerce & Storefront Verification", () => {
  test("1. Homepage renders brand identity and key navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Freakin/i);
    const builderLink = page.getByRole("link", { name: /Builder|Package Builder/i }).first();
    await expect(builderLink).toBeVisible();
  });

  test("2. Services page displays catalog categories and services", async ({ page }) => {
    await page.goto("/services");
    await expect(page.locator("body")).toContainText(/Services|Creative/i);
    const serviceCards = page.locator("a[href^='/services/']");
    const count = await serviceCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("3. Package Builder page loads through all step definitions", async ({ page }) => {
    await page.goto("/builder");
    await expect(page.locator("body")).toContainText(/Signature Package Builder|Builder/i);
    // Verify first step heading is rendered
    await expect(page.getByRole("heading", { name: /Define Campaign & Commercial Objective/i })).toBeVisible();
  });

  test("4. Public informational and policy routes render cleanly", async ({ page }) => {
    const routes = [
      "/about",
      "/how-it-works",
      "/contact",
      "/faq",
      "/licensing-policy",
      "/refund-policy",
      "/revision-policy",
    ];

    for (const r of routes) {
      const response = await page.goto(r);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });

  test("5. Authentication entrypoints (login & signup) render properly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Sign In|Log In/i })).toBeVisible();

    await page.goto("/signup");
    await expect(page.getByRole("button", { name: /Sign Up|Create Account/i })).toBeVisible();
  });
});
