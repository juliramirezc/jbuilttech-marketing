import type { Metadata } from "next";
import { GlazierApplicationForm } from "./GlazierApplicationForm";

export const metadata: Metadata = {
  title: "Apply to Work for Glazing | DC 78",
  description:
    "Apply for a glazing career opportunity with District Council 78. $45.09/hour including benefits.",
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
