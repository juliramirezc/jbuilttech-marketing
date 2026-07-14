/**
 * Story Configuration
 * Hero copy and story beats for the construction narrative
 */

export interface StoryBeat {
  id: string;
  phase: string;
  headline: string;
  subheadline: string;
  serviceTag: string;
  scrollRangeStart: number;
  scrollRangeEnd: number;
}

export const STORY_BEATS: StoryBeat[] = [
  {
    id: "foundation",
    phase: "foundation",
    headline: "Every successful contractor starts with a strong foundation.",
    subheadline: "Before marketing. Before ads. Before a single lead.\nYour brand is the slab everything else is built on.",
    serviceTag: "Branding · Logo Design · Brand Identity",
    scrollRangeStart: 0,
    scrollRangeEnd: 16,
  },
  {
    id: "brand",
    phase: "brand",
    headline: "Your brand is what homeowners remember before they call.",
    subheadline: "The logo on your truck. The colors on your website.\nThe feeling they get when they see your name.",
    serviceTag: "Logo Design · Brand Colors · Typography",
    scrollRangeStart: 16,
    scrollRangeEnd: 33,
  },
  {
    id: "website",
    phase: "website",
    headline: "Your website is your 24/7 sales rep.",
    subheadline: "While you're on the job site, your website is closing the next one.\nMake every visit count.",
    serviceTag: "Website Design · Mobile Optimization · SEO",
    scrollRangeStart: 33,
    scrollRangeEnd: 50,
  },
  {
    id: "marketing",
    phase: "marketing",
    headline: "Marketing brings the homeowners to your door.",
    subheadline: "The right message. The right people. The right time.\nConsistent marketing builds predictable growth.",
    serviceTag: "Google Ads · Facebook Ads · Social Media",
    scrollRangeStart: 50,
    scrollRangeEnd: 66,
  },
  {
    id: "growth",
    phase: "growth",
    headline: "Growth happens when everything works together.",
    subheadline: "Brand. Website. Marketing. Lead follow-up.\nA system that scales with your ambition.",
    serviceTag: "Marketing Plans · Analytics · CRM Integration",
    scrollRangeStart: 66,
    scrollRangeEnd: 83,
  },
  {
    id: "legacy",
    phase: "legacy",
    headline: "Build something that lasts.",
    subheadline: "Your business is more than jobs and invoices.\nIt's a legacy. Let's build it right.",
    serviceTag: "Full-Service Partnership",
    scrollRangeStart: 83,
    scrollRangeEnd: 100,
  },
];

export const HERO_COPY = {
  headline: "We don't build websites.",
  headlineAccent: "We build contractor brands.",
  subheadline: "Premium digital branding and marketing exclusively for contractors who want to stand out, get more leads, and build a business that lasts.",
  primaryCta: "Book a Free Consultation",
  secondaryCta: "View Our Work",
  trustBadge: "Trusted by 50+ contractors across 10 industries",
} as const;
