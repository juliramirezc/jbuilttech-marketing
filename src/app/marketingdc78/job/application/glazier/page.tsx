import type { Metadata } from "next";
import { GlazierApplicationForm } from "./GlazierApplicationForm";

export const metadata: Metadata = {
  title: "Apply to Work for Glazing! | IUPAT District Council 78",
  description:
    "Complete the application so our team can contact you about the glazing opportunity and next steps. $45.09/hour including benefits.",
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

export default function GlazierApplicationPage() {
  return <GlazierApplicationForm />;
}
