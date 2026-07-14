/**
 * Pricing Configuration
 * Pricing plans and features
 */

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for contractors just getting started with their online presence",
    price: 2500,
    priceLabel: "one-time",
    features: [
      "Professional 5-page website",
      "Mobile-responsive design",
      "Basic SEO setup",
      "Contact form integration",
      "Google Business Profile setup",
      "30 days of support",
    ],
    ctaText: "Get Started",
  },
  {
    id: "growth",
    name: "Growth",
    description: "For established contractors ready to scale their business",
    price: 997,
    priceLabel: "/month",
    features: [
      "Everything in Starter",
      "Custom website design",
      "Monthly content updates",
      "Google Ads management",
      "Facebook Ads management",
      "Monthly performance reports",
      "Dedicated account manager",
      "Priority support",
    ],
    highlighted: true,
    ctaText: "Start Growing",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full-service partnership for contractors dominating their market",
    price: 2497,
    priceLabel: "/month",
    features: [
      "Everything in Growth",
      "Complete brand identity",
      "Video content production",
      "Social media management",
      "CRM integration",
      "Lead tracking & analytics",
      "Quarterly strategy sessions",
      "White-glove service",
    ],
    ctaText: "Contact Us",
  },
];
