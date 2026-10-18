import type { Metadata } from "next";
import { DrywallApplicationForm } from "./DrywallApplicationForm";

export const metadata: Metadata = {
  title: "Apply to Work as a Drywall Finisher | DC78",
  description:
    "Apply for Drywall Finisher Journey Worker opportunities in Tampa and St. Petersburg, Florida. Learn about union compensation and benefits and submit your application to DC78.",
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

export default function DrywallApplicationPage() {
  return <DrywallApplicationForm />;
}
