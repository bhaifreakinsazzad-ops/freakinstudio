import type { MetadataRoute } from "next";
import { getSafeAppOrigin } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSafeAppOrigin(process.env.NEXT_PUBLIC_APP_URL);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
