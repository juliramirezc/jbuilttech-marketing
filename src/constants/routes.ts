/**
 * Route Constants
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  HOME: "/",
  
  // Services
  SERVICES: "/services",
  SERVICES_WEBSITES: "/services/websites",
  SERVICES_BRANDING: "/services/branding",
  SERVICES_MARKETING: "/services/marketing",
  SERVICES_LOGO: "/services/logo-design",
  SERVICES_VIDEO: "/services/video-editing",
  SERVICES_SOCIAL: "/services/social-media",
  SERVICES_GBP: "/services/google-business-profile",
  SERVICES_GOOGLE_ADS: "/services/google-ads",
  SERVICES_FACEBOOK_ADS: "/services/facebook-ads",
  
  // Industries
  INDUSTRIES: "/industries",
  INDUSTRIES_RESTORATION: "/industries/restoration",
  INDUSTRIES_REMODELING: "/industries/remodeling",
  INDUSTRIES_ROOFING: "/industries/roofing",
  INDUSTRIES_CABINET: "/industries/cabinet-installers",
  INDUSTRIES_PLUMBING: "/industries/plumbing",
  INDUSTRIES_HVAC: "/industries/hvac",
  INDUSTRIES_FLOORING: "/industries/flooring",
  INDUSTRIES_CONCRETE: "/industries/concrete",
  INDUSTRIES_PAINTING: "/industries/painting",
  INDUSTRIES_LANDSCAPING: "/industries/landscaping",
  
  // Other pages
  PORTFOLIO: "/portfolio",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  CONSULTATION: "/consultation",
  THANK_YOU: "/thank-you",
  
  // Legal
  PRIVACY: "/privacy",
  TERMS: "/terms",
  
  // Sections (anchor links)
  SECTION_STORY: "/#story",
  SECTION_CONSULTATION: "/#consultation",
  /** Creative work showcase lives in the Process section on the homepage */
  SECTION_PORTFOLIO: "/#process",
  SECTION_PROCESS: "/#process",
} as const;

export type Routes = typeof ROUTES;
export type RouteKey = keyof Routes;
export type RoutePath = Routes[RouteKey];
