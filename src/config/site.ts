/**
 * Site Configuration
 * Central source of truth for company information and SEO
 */

export const siteConfig = {
  name: "JBuiltTech",
  tagline: "We Build Contractor Brands",
  description:
    "Premium digital branding and technology agency built exclusively for contractors. Professional websites, branding, marketing plans, and lead generation for restoration, remodeling, roofing, plumbing, HVAC, and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://jbuilttech.com",
  
  keywords: [
    "contractor marketing",
    "contractor websites",
    "contractor branding",
    "restoration contractor marketing",
    "remodeling contractor websites",
    "roofing company marketing",
    "plumbing company websites",
    "HVAC contractor marketing",
    "contractor logo design",
    "contractor lead generation",
    "Google Ads for contractors",
    "Facebook Ads for contractors",
  ],

  contact: {
    email: "hello@jbuilttech.com",
    phone: "",
  },

  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
