import type { Metadata } from "next";
import { PainterApplicationForm } from "./PainterApplicationForm";

export const metadata: Metadata = {
  title: "Apply to Work as an Industrial Painter | DC78",
  description:
    "Apply for Industrial Painter opportunities with DC78. $45.09/hour including benefits. Submit your application today.",
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

export default function PainterApplicationPage() {
  return <PainterApplicationForm />;
}
