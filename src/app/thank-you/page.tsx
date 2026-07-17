import type { Metadata } from "next";
import { ThankYouContent } from "@/components/thank-you/ThankYouContent";

export const metadata: Metadata = {
  title: "Thank You | JBuiltTech",
  description: "Thank you for scheduling your consultation with JBuiltTech.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Thank You | JBuiltTech",
    description: "Thank you for scheduling your consultation with JBuiltTech.",
    url: "https://build.jbuilttech.com/thank-you",
  },
};

/**
 * /thank-you
 *
 * Primary conversion destination after Calendly booking.
 * Unique route for GA4, Google Ads, Meta Pixel, and Clarity via GTM.
 * Intentionally excluded from sitemap and robots indexing.
 */
export default function ThankYouPage() {
  return <ThankYouContent />;
}
