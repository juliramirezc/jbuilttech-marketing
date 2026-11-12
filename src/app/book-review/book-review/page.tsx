
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free 15-Minute Business Review | JBUILTTECH",
  description:
    "Discover how branding, marketing, and technology can help your contracting business grow.",
};

export default function BookReviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 75% 15%, #173b68 0%, #0b1628 48%, #060d19 100%)",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <header
          style={{
            paddingBottom: 60,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          JBUILT<span style={{ color: "#60a5fa" }}>TECH</span>
        </header>

        <section style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              color: "#60a5fa",
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: 13,
            }}
          >
            EXCLUSIVE BUSINESS GROWTH OPPORTUNITY
          </p>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.12,
              margin: "24px 0",
            }}
          >
            Your Work Deserves
            <br />
            <span style={{ color: "#60a5fa" }}>to Be Seen.</span>
          </h1>

          <p
            style={{
              fontSize: 19,
              lineHeight: 1.7,
              color: "#cbd5e1",
              marginBottom: 38,
            }}
          >
            Book a free 15-minute business review and discover
            opportunities to strengthen your brand, improve
            your online presence, and reach more customers.
          </p>

          <div
            style={{
              background: "rgba(20, 43, 75, 0.85)",
              border: "1px solid #31527d",
              borderRadius: 20,
              padding: "36px 24px",
              marginBottom: 40,
            }}
          >
            <h2 style={{ fontSize: 26, marginTop: 0 }}>
              Schedule Your Free Review
            </h2>

            <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
              A focused 15-minute conversation about your
              business, marketing challenges, and growth goals.
            </p>

            <p
              style={{
                color: "#93c5fd",
                fontWeight: 600,
                marginTop: 28,
              }}
            >
              Booking calendar coming soon.
            </p>
          </div>

          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Built for contractors, restoration professionals,
            flooring companies, and remodeling businesses.
          </p>
        </section>

        <footer
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginTop: 90,
            fontSize: 13,
          }}
        >
          © 2026 JBUILTTECH LLC. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
