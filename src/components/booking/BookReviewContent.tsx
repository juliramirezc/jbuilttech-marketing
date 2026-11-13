"use client";

import { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pushDataLayerEvent, trackCTAClick } from "@/lib/analytics";
import { GoogleBookingCalendar } from "./GoogleBookingCalendar";
import {
  BrandVisibilityIcon,
  CircuitPattern,
  ClockIcon,
  GiftIcon,
  MarketingIcon,
  MeetIcon,
  MicrochipAccent,
  NextStepsIcon,
} from "./BookReviewIcons";

const CONTACT_EMAIL = "info@jbuilttech.com";

const VALUE_CARDS = [
  {
    title: "Brand Visibility",
    body: "Discover how your business presents itself online and where your brand could make a stronger impression.",
    Icon: BrandVisibilityIcon,
  },
  {
    title: "Marketing Opportunities",
    body: "Explore ways to showcase completed projects, reach potential customers, and improve your digital presence.",
    Icon: MarketingIcon,
  },
  {
    title: "Clear Next Steps",
    body: "Walk away with practical recommendations tailored to your business and priorities.",
    Icon: NextStepsIcon,
  },
] as const;

const EXPECTATIONS = [
  "A quick introduction to your business.",
  "A discussion about your current branding and marketing.",
  "Opportunities to improve your visibility.",
  "Recommended next steps.",
] as const;

function scrollToBooking() {
  const el = document.getElementById("booking");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BookReviewContent() {
  const reducedMotion = useReducedMotion() ?? false;

  const handleScheduleCta = useCallback((location: "hero" | "closing") => {
    pushDataLayerEvent("booking_section_cta_click", {
      page_path: "/book-review",
      cta_name: "schedule_my_free_review",
      location,
    });
    trackCTAClick("schedule_my_free_review", `book_review_${location}`);
    scrollToBooking();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.55,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reducedMotion ? 0 : 0.1 },
    },
  };

  return (
    <div className="book-review">
      <div className="book-review__atmosphere" aria-hidden="true">
        <div className="book-review__glow book-review__glow--a" />
        <div className="book-review__glow book-review__glow--b" />
        <CircuitPattern />
      </div>

      <header className="book-review-header">
        <div className="book-review-shell book-review-header__inner">
          <a href="/" className="book-review-brand" aria-label="JBUILTTECH home">
            <span className="book-review-brand__mark" aria-hidden="true">
              <MicrochipAccent />
            </span>
            <span className="book-review-brand__text">
              <span className="book-review-brand__name">JBUILTTECH</span>
              <span className="book-review-brand__descriptor">
                BRANDING · MARKETING · SOFTWARE DEVELOPMENT
              </span>
            </span>
          </a>
        </div>
      </header>

      <main>
        <section className="book-review-hero" aria-labelledby="book-review-hero-heading">
          <div className="book-review-shell">
            <motion.div
              className="book-review-hero__content"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.p className="book-review-kicker" variants={fadeUp}>
                COMPLIMENTARY 15-MINUTE BUSINESS REVIEW
              </motion.p>

              <motion.h1
                id="book-review-hero-heading"
                className="book-review-hero__title"
                variants={fadeUp}
              >
                GOOD WORK DESERVES TO BE SEEN.
              </motion.h1>

              <motion.p className="book-review-hero__support" variants={fadeUp}>
                Your business deserves more than word-of-mouth. Let&apos;s explore
                opportunities to strengthen your brand, showcase your projects,
                and reach more customers.
              </motion.p>

              <motion.ul className="book-review-indicators" variants={fadeUp}>
                <li>
                  <ClockIcon className="book-review-indicators__icon" />
                  <span>15-Minute Consultation</span>
                </li>
                <li>
                  <MeetIcon className="book-review-indicators__icon" />
                  <span>Online via Google Meet</span>
                </li>
                <li>
                  <GiftIcon className="book-review-indicators__icon" />
                  <span>Complimentary · No Obligation</span>
                </li>
              </motion.ul>

              <motion.div variants={fadeUp}>
                <button
                  type="button"
                  className="book-review-cta"
                  onClick={() => handleScheduleCta("hero")}
                >
                  Schedule My Free Review
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section
          className="book-review-value"
          aria-labelledby="book-review-value-heading"
        >
          <div className="book-review-shell">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.h2
                id="book-review-value-heading"
                className="book-review-section-title"
                variants={fadeUp}
              >
                Let&apos;s Find Opportunities to Grow Your Business.
              </motion.h2>

              <div className="book-review-cards">
                {VALUE_CARDS.map(({ title, body, Icon }) => (
                  <motion.article
                    key={title}
                    className="book-review-card"
                    variants={fadeUp}
                  >
                    <div className="book-review-card__icon">
                      <Icon />
                    </div>
                    <h3 className="book-review-card__title">{title}</h3>
                    <p className="book-review-card__body">{body}</p>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="booking"
          className="book-review-booking"
          aria-labelledby="book-review-booking-heading"
        >
          <div className="book-review-shell">
            <div className="book-review-booking__intro">
              <h2 id="book-review-booking-heading" className="book-review-section-title">
                Choose a Time That Works for You.
              </h2>
              <p className="book-review-section-support">
                Select an available 15-minute appointment. Once your booking is
                confirmed, you&apos;ll receive a calendar invitation with your
                Google Meet details.
              </p>
            </div>

            <div className="book-review-booking__grid">
              <div className="book-review-booking__calendar">
                <GoogleBookingCalendar contactEmail={CONTACT_EMAIL} />
              </div>

              <aside className="book-review-expect" aria-labelledby="what-to-expect">
                <div className="book-review-expect__panel">
                  <h3 id="what-to-expect" className="book-review-expect__title">
                    What to Expect
                  </h3>
                  <ol className="book-review-expect__list">
                    {EXPECTATIONS.map((item, index) => (
                      <li key={item}>
                        <span className="book-review-expect__num" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>

                  <dl className="book-review-expect__meta">
                    <div>
                      <dt>Duration</dt>
                      <dd>15 minutes</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>Google Meet</dd>
                    </div>
                    <div>
                      <dt>Cost</dt>
                      <dd>Free</dd>
                    </div>
                  </dl>

                  <p className="book-review-expect__note">
                    No obligation to purchase services.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section
          className="book-review-close"
          aria-labelledby="book-review-close-heading"
        >
          <div className="book-review-shell book-review-close__inner">
            <h2 id="book-review-close-heading" className="book-review-section-title">
              Your Next Opportunity Starts With a Conversation.
            </h2>
            <p className="book-review-section-support">
              Let&apos;s turn the quality of your work into a brand that more
              people recognize.
            </p>
            <button
              type="button"
              className="book-review-cta book-review-cta--secondary"
              onClick={() => handleScheduleCta("closing")}
            >
              Schedule My Free Review
            </button>
          </div>
        </section>
      </main>

      <footer className="book-review-footer">
        <div className="book-review-shell book-review-footer__inner">
          <p className="book-review-footer__brand">JBUILTTECH</p>
          <p className="book-review-footer__tagline">
            Simplify your work. Build your brand. Reach more people.
          </p>
          <p className="book-review-footer__contact">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
