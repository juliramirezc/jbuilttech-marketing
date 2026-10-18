import type { Metadata } from "next";
import { WallCoveringApplicationForm } from "./WallCoveringApplicationForm";

export const metadata: Metadata = {
  title: "Apply to Work in Wall Covering | DC78",
  description:
    "Apply for Wall Covering Journey Worker opportunities in Tampa and St. Petersburg, Florida. Learn about the total hourly compensation package, including union benefits, and submit your application to DC78.",
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
};

export default function WallCoveringApplicationPage() {
  return <WallCoveringApplicationForm />;
}
