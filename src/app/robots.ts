import type { MetadataRoute } from "next";

const SITE_URL = "https://build.jbuilttech.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/thank-you"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
