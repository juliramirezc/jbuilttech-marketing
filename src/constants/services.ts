/**
 * Services Configuration
 * The services JBuiltTech offers
 */

import { ROUTES } from "./routes";

export interface Service {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  href: string;
  description: string;
  icon?: string;
}

export const SERVICES: Service[] = [
  {
    id: "websites",
    name: "Professional Websites",
    shortName: "Websites",
    slug: "websites",
    href: ROUTES.SERVICES_WEBSITES,
    description: "High-converting contractor websites built for lead generation",
  },
  {
    id: "branding",
    name: "Branding",
    shortName: "Branding",
    slug: "branding",
    href: ROUTES.SERVICES_BRANDING,
    description: "Complete brand identity that sets you apart",
  },
  {
    id: "marketing",
    name: "Monthly Marketing Plans",
    shortName: "Marketing",
    slug: "marketing",
    href: ROUTES.SERVICES_MARKETING,
    description: "Ongoing marketing strategy and execution",
  },
  {
    id: "logo",
    name: "Logo Design",
    shortName: "Logo",
    slug: "logo-design",
    href: ROUTES.SERVICES_LOGO,
    description: "Professional logos that build trust",
  },
  {
    id: "video",
    name: "Video Editing",
    shortName: "Video",
    slug: "video-editing",
    href: ROUTES.SERVICES_VIDEO,
    description: "Project showcases and promotional videos",
  },
  {
    id: "social",
    name: "Social Media Management",
    shortName: "Social",
    slug: "social-media",
    href: ROUTES.SERVICES_SOCIAL,
    description: "Consistent social presence that builds your brand",
  },
  {
    id: "gbp",
    name: "Google Business Profile",
    shortName: "GBP",
    slug: "google-business-profile",
    href: ROUTES.SERVICES_GBP,
    description: "Optimized profiles that rank in local search",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    shortName: "Google Ads",
    slug: "google-ads",
    href: ROUTES.SERVICES_GOOGLE_ADS,
    description: "Targeted ads that bring high-intent leads",
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    shortName: "Facebook Ads",
    slug: "facebook-ads",
    href: ROUTES.SERVICES_FACEBOOK_ADS,
    description: "Social advertising for brand awareness and leads",
  },
] as const;
