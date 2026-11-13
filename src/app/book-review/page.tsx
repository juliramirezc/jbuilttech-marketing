import type { Metadata } from "next";
import { BookReviewContent } from "@/components/booking";

const PAGE_URL = "https://build.jbuilttech.com/book-review";
const PAGE_TITLE = "Free 15-Minute Business Review | JBUILTTECH";
const PAGE_DESCRIPTION =
  "Book a complimentary 15-minute business review with JBUILTTECH. Explore opportunities to improve your branding, marketing, and business visibility.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "JBUILTTECH",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * /book-review
 *
 * Public booking landing for the complimentary 15-minute business review.
 * Google Calendar Appointment Scheduling handles availability, confirmation,
 * and Google Meet — this page embeds the official booking widget.
 */
export default function BookReviewPage() {
  return <BookReviewContent />;
}
