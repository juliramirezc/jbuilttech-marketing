/**
 * Industries Configuration
 * The 10 target contractor industries
 */

import { ROUTES } from "./routes";

export interface Industry {
  id: string;
  name: string;
  slug: string;
  href: string;
  description: string;
  icon?: string;
}

export const INDUSTRIES: Industry[] = [
  {
    id: "restoration",
    name: "Restoration Contractors",
    slug: "restoration",
    href: ROUTES.INDUSTRIES_RESTORATION,
    description: "Water, fire, and mold restoration services",
  },
  {
    id: "remodeling",
    name: "Remodeling Contractors",
    slug: "remodeling",
    href: ROUTES.INDUSTRIES_REMODELING,
    description: "Kitchen, bathroom, and whole-home remodels",
  },
  {
    id: "roofing",
    name: "Roofing Companies",
    slug: "roofing",
    href: ROUTES.INDUSTRIES_ROOFING,
    description: "Residential and commercial roofing",
  },
  {
    id: "cabinet",
    name: "Cabinet Installers",
    slug: "cabinet-installers",
    href: ROUTES.INDUSTRIES_CABINET,
    description: "Custom cabinet design and installation",
  },
  {
    id: "plumbing",
    name: "Plumbing Companies",
    slug: "plumbing",
    href: ROUTES.INDUSTRIES_PLUMBING,
    description: "Residential and commercial plumbing services",
  },
  {
    id: "hvac",
    name: "HVAC Contractors",
    slug: "hvac",
    href: ROUTES.INDUSTRIES_HVAC,
    description: "Heating, ventilation, and air conditioning",
  },
  {
    id: "flooring",
    name: "Flooring Contractors",
    slug: "flooring",
    href: ROUTES.INDUSTRIES_FLOORING,
    description: "Hardwood, tile, carpet, and luxury vinyl",
  },
  {
    id: "concrete",
    name: "Concrete Contractors",
    slug: "concrete",
    href: ROUTES.INDUSTRIES_CONCRETE,
    description: "Driveways, patios, foundations, and decorative",
  },
  {
    id: "painting",
    name: "Painting Contractors",
    slug: "painting",
    href: ROUTES.INDUSTRIES_PAINTING,
    description: "Interior and exterior painting services",
  },
  {
    id: "landscaping",
    name: "Landscaping Companies",
    slug: "landscaping",
    href: ROUTES.INDUSTRIES_LANDSCAPING,
    description: "Landscape design, hardscaping, and maintenance",
  },
] as const;
