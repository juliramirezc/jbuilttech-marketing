import type { Metadata } from "next";
import { MemberStoryForm } from "./MemberStoryForm";

export const metadata: Metadata = {
  title: "DC 78 | Share Your Story",
  description: "IUPAT District Council 78 member newsletter story submission",
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

export default function Dc78MemberStoryPage() {
  return <MemberStoryForm />;
}
