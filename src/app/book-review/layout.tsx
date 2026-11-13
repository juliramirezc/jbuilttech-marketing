import { Manrope, Syne } from "next/font/google";
import "./book-review.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-book-display",
  display: "swap",
  weight: ["600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-book-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default function BookReviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${display.variable} ${body.variable}`}>{children}</div>
  );
}
