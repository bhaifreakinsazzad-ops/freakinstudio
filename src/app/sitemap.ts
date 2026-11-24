import type { MetadataRoute } from "next";
import { CANONICAL_SERVICES } from "@/lib/catalog";
import { getSafeAppOrigin } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSafeAppOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const now = new Date();

  const staticRoutes = [
    "",
    "/tools",
    "/playground",
    "/kits",
    "/services",
    "/builder",
    "/portfolio",
    "/case-studies",
    "/about",
    "/how-it-works",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/revision-policy",
    "/licensing-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const serviceRoutes = CANONICAL_SERVICES.map((service) => ({
    url: `${baseUrl}/services/${service.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
