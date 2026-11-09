import type { MetadataRoute } from "next";
import servicesJson from "../../supabase/seed/data/services.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freakinstudio.com";
  const now = new Date();

  const staticRoutes = [
    "",
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

  const serviceRoutes = servicesJson.map((service) => ({
    url: `${baseUrl}/services/${service.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
