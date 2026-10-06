import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { CalendlyProvider } from "@/components/calendly";
import { LeadProvider } from "@/components/lead";
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
  verification: {
    other: {
      "facebook-domain-verification": "k2n11dfl8rs5aqh5dam402j7fffsrg",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
};

const GOOGLE_ADS_ID = "AW-18330253504";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-MGZPGP8C" />
      <body className="min-h-screen bg-[#0B0B0B] text-white antialiased">
        {/* Google tag (gtag.js) — Google Ads */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>

        {/* Subtle noise texture for premium feel */}
        <div className="noise-overlay" aria-hidden="true" />

        <CalendlyProvider>
          <LeadProvider>{children}</LeadProvider>
        </CalendlyProvider>
      </body>
    </html>
  );
}
