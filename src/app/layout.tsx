import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { CalendlyProvider } from "@/components/calendly";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jbuilttech.com"),
  title: "JBuiltTech | We Build Contractor Brands",
  description:
    "Premium digital branding and marketing agency built exclusively for contractors. World-class websites, branding, and marketing that transforms your business.",
  keywords: [
    "contractor marketing",
    "contractor websites",
    "contractor branding",
    "construction marketing",
    "remodeling websites",
    "roofing marketing",
    "plumbing websites",
    "HVAC marketing",
  ],
  authors: [{ name: "JBuiltTech" }],
  creator: "JBuiltTech",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jbuilttech.com",
    siteName: "JBuiltTech",
    title: "JBuiltTech | We Build Contractor Brands",
    description:
      "Premium digital branding and marketing agency built exclusively for contractors.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JBuiltTech | We Build Contractor Brands",
    description:
      "Premium digital branding and marketing agency built exclusively for contractors.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-MGZPGP8C" />
      <body className="min-h-screen bg-[#0B0B0B] text-white antialiased">
        {/* Subtle noise texture for premium feel */}
        <div className="noise-overlay" aria-hidden="true" />

        <CalendlyProvider>{children}</CalendlyProvider>
      </body>
    </html>
  );
}
