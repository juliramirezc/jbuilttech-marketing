import type { MetadataRoute } from "next";

const SITE_URL = "https://build.jbuilttech.com";

/**
 * Public routes that exist in the App Router.
 * Add entries here as new pages ship.
 */
const PUBLIC_ROUTES = ["/"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
}
