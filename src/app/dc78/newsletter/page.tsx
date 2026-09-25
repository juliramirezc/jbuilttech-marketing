import type { Metadata } from "next";
import { NewsletterClient } from "./NewsletterClient";

export const metadata: Metadata = {
  title: "DC 78 | Newsletter send",
  description: "Password-protected newsletter distribution",
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

export default function Dc78NewsletterPage() {
  return <NewsletterClient />;
}
