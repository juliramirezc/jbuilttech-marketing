/**
 * Navigation Configuration
 * Defines the site navigation structure
 */

import { ROUTES } from "@/constants";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    label: "Services",
    href: ROUTES.SERVICES,
    children: [
      {
        label: "Websites",
        href: ROUTES.SERVICES_WEBSITES,
        description: "Professional contractor websites that convert",
      },
      {
        label: "Branding",
        href: ROUTES.SERVICES_BRANDING,
        description: "Logo design and brand identity",
      },
      {
        label: "Marketing",
        href: ROUTES.SERVICES_MARKETING,
        description: "Monthly marketing plans and ads",
      },
    ],
  },
  {
    label: "Industries",
    href: ROUTES.INDUSTRIES,
  },
  {
    label: "Portfolio",
    href: ROUTES.PORTFOLIO,
  },
  {
    label: "Pricing",
    href: ROUTES.PRICING,
  },
  {
    label: "About",
    href: ROUTES.ABOUT,
  },
];

export const footerNavigation = {
  services: [
    { label: "Websites", href: ROUTES.SERVICES_WEBSITES },
    { label: "Branding", href: ROUTES.SERVICES_BRANDING },
    { label: "Marketing Plans", href: ROUTES.SERVICES_MARKETING },
    { label: "Logo Design", href: ROUTES.SERVICES_LOGO },
    { label: "Google Ads", href: ROUTES.SERVICES_GOOGLE_ADS },
    { label: "Facebook Ads", href: ROUTES.SERVICES_FACEBOOK_ADS },
  ],
  industries: [
    { label: "Restoration", href: ROUTES.INDUSTRIES_RESTORATION },
    { label: "Remodeling", href: ROUTES.INDUSTRIES_REMODELING },
    { label: "Roofing", href: ROUTES.INDUSTRIES_ROOFING },
    { label: "Plumbing", href: ROUTES.INDUSTRIES_PLUMBING },
    { label: "HVAC", href: ROUTES.INDUSTRIES_HVAC },
  ],
  company: [
    { label: "About", href: ROUTES.ABOUT },
    { label: "Portfolio", href: ROUTES.PORTFOLIO },
    { label: "Contact", href: ROUTES.CONTACT },
    { label: "Privacy", href: ROUTES.PRIVACY },
    { label: "Terms", href: ROUTES.TERMS },
  ],
};
