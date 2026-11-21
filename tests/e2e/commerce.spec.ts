import { test, expect } from "@playwright/test";

test.describe("Freakin' Studio — Creative Office OS 2.0 Storefront & PWA Verification", () => {
  test("1. Homepage renders Creative Office OS 2.0 identity & navigation links without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page).toHaveTitle(/Freakin/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Smart Brief|Open DB Quote Builder/i }).first()
    ).toBeVisible();

    const overflowDesktop = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflowDesktop).toBe(false);
  });

  test("2. Mobile 360px layout renders cleanly with no horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const overflowMobile = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflowMobile).toBe(false);
  });

  test("3. Services page displays 13 canonical services across 4 disciplines", async ({
    page,
  }) => {
    await page.goto("/services");
    await expect(page.locator("body")).toContainText(
      /13 Core Services|4 Disciplines/i
    );
    const serviceCards = page.locator("a[href^='/services/SRV-']");
    const count = await serviceCards.count();
    expect(count).toBe(13);
  });

  test("4. Smart Package Builder (/builder) loads canonical steps & quote gating", async ({
    page,
  }) => {
    await page.goto("/builder");
    await expect(
      page.getByRole("heading", {
        name: /Smart Project Brief & Hourly Scope Estimator/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Select Core Creative Services \(13\)/i,
      })
    ).toBeVisible();
  });

  test("5. Free Tools (/tools) & AI Micro-Kits (/kits) render with zero Puter login gate", async ({
    page,
  }) => {
    await page.goto("/tools");
    await expect(page.locator("body")).toContainText(/Free Tools|Resizer/i);

    await page.goto("/kits");
    await expect(page.locator("body")).toContainText(
      /Zero Puter Login|ZERO PUTER LOGIN|NO PUTER LOGIN/i
    );
    await expect(page.locator("body")).toContainText(/SKU-SHOP-49/);
    await expect(page.locator("body")).toContainText(/SKU-CAMP-99/);
    await expect(page.locator("body")).toContainText(/SKU-BRAND-199/);
  });

  test("6. Public informational, policy, and PWA manifest/offline routes respond with 200", async ({
    page,
  }) => {
    const routes = [
      "/about",
      "/how-it-works",
      "/contact",
      "/faq",
      "/portfolio",
      "/licensing-policy",
      "/refund-policy",
      "/revision-policy",
      "/offline",
      "/manifest.webmanifest",
      "/sw.js",
    ];

    for (const r of routes) {
      const response = await page.goto(r);
      expect(response?.status()).toBe(200);
    }
  });

  test("7. Authentication entrypoints (login & signup) render cleanly", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /Sign In|Log In/i })
    ).toBeVisible();

    await page.goto("/signup");
    await expect(
      page.getByRole("button", { name: /Sign Up|Create Account/i })
    ).toBeVisible();
  });
});
