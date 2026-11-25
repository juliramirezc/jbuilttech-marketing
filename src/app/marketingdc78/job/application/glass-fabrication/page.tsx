import type { Metadata } from "next";
import { GlassFabricationApplicationForm } from "./GlassFabricationApplicationForm";

export const metadata: Metadata = {
  title: "Glass Fabrication – Employment Opportunities",
  description:
    "Do you have experience working in glass fabrication? IUPAT District Council 78 is looking to connect with skilled glass fabrication workers in Tampa, Palmetto, and Oldsmar, Florida. Complete the application below, and a representative will contact you to discuss available opportunities.",
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

export default function GlassFabricationApplicationPage() {
  return <GlassFabricationApplicationForm />;
}
