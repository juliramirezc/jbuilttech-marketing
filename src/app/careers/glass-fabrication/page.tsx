import type { Metadata } from "next";
import { GlassFabricationApplicationForm } from "./GlassFabricationApplicationForm";

const CANONICAL_URL = "https://build.jbuilttech.com/careers/glass-fabrication";
const DESCRIPTION =
  "Do you have experience in glass fabrication? Tell us about your skills and availability for opportunities in Tampa, Palmetto, and Oldsmar, Florida.";

export const metadata: Metadata = {
  title: { absolute: "Glass Fabrication Career Opportunities" },
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    type: "website",
    url: CANONICAL_URL,
    title: "Glass Fabrication Career Opportunities",
    description: DESCRIPTION,
    siteName: "Glass Fabrication Careers",
  },
  twitter: {
    card: "summary",
    title: "Glass Fabrication Career Opportunities",
    description: DESCRIPTION,
  },
};

export default function GlassFabricationCareersPage() {
  return <GlassFabricationApplicationForm />;
}
