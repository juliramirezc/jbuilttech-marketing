"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pushDataLayerEvent } from "@/lib/analytics";

/** Official multicolor Google “G” mark — same paths as SocialCard. */
export function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AnimatedStars({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active || doneRef.current) return;
    if (reducedMotion) {
      doneRef.current = true;
      onComplete?.();
      return;
    }
    const t = window.setTimeout(() => {
      doneRef.current = true;
      onComplete?.();
    }, 1100);
    return () => window.clearTimeout(t);
  }, [active, reducedMotion, onComplete]);

  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.svg
          key={i}
          className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]"
          viewBox="0 0 24 24"
          initial={false}
          animate={
            reducedMotion || active
              ? { color: "#FBBC04", opacity: 1, scale: 1 }
              : { color: "rgba(255,255,255,0.22)", opacity: 0.55, scale: 0.92 }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  delay: active ? i * 0.16 : 0,
                  duration: 0.28,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
        >
          <path
            fill="currentColor"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </motion.svg>
      ))}
    </div>
  );
}

function ViewsMetric({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion || !active ? "12K" : "0");

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      setDisplay("12K");
      return;
    }
    let frame = 0;
    const total = 14;
    const id = window.setInterval(() => {
      frame += 1;
      if (frame >= total) {
        setDisplay("12K");
        window.clearInterval(id);
        return;
      }
      const n = Math.round((12000 * frame) / total / 1000);
      setDisplay(`${n}K`);
    }, 35);
    return () => window.clearInterval(id);
  }, [active, reducedMotion]);

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
        {display}
      </span>
      <span className="text-xs sm:text-sm text-white/45">views/month</span>
    </div>
  );
}

type GoogleProofCardsProps = {
  showProfile: boolean;
  showReviews: boolean;
};

declare global {
  interface Window {
    __jbtGoogleBusinessProfileViewPushed?: boolean;
    __jbtGoogleReviewsViewPushed?: boolean;
    __jbtGoogleReviewsAnimationCompletePushed?: boolean;
  }
}

function pushGoogleProofEventOnce(
  flag:
    | "__jbtGoogleBusinessProfileViewPushed"
    | "__jbtGoogleReviewsViewPushed"
    | "__jbtGoogleReviewsAnimationCompletePushed",
  eventName: string
): void {
  if (typeof window === "undefined") return;
  if (window[flag]) return;
  window[flag] = true;
  pushDataLayerEvent(eventName);
}

/**
 * Google Business Profile + Reviews proof — visual language from SocialCard.
 */
export function GoogleProofCards({
  showProfile,
  showReviews,
}: GoogleProofCardsProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!showProfile) return;
    pushGoogleProofEventOnce(
      "__jbtGoogleBusinessProfileViewPushed",
      "google_business_profile_view"
    );
  }, [showProfile]);

  useEffect(() => {
    if (!showReviews) return;
    pushGoogleProofEventOnce(
      "__jbtGoogleReviewsViewPushed",
      "google_reviews_view"
    );
  }, [showReviews]);

  const enter = (visible: boolean) =>
    reducedMotion
      ? { opacity: 1, y: 0, scale: 1 }
      : visible
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 0, y: 16, scale: 0.96 };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <motion.div
        className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#4285F4]/10 to-transparent p-4 backdrop-blur-sm"
        initial={false}
        animate={enter(showProfile)}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#4285F420" }}
          >
            <GoogleIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white mb-0.5">
              Google Business Profile
            </p>
            <p className="text-xs text-white/50 mb-3">
              Verified contractor in Westfield
            </p>
            <ViewsMetric active={showProfile} />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#34A853]/10 to-transparent p-4 backdrop-blur-sm"
        initial={false}
        animate={enter(showReviews)}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#34A85320" }}
          >
            <GoogleIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white mb-0.5">
              Google Reviews
            </p>
            <div className="mb-2.5">
              <AnimatedStars
                active={showReviews}
                onComplete={() =>
                  pushGoogleProofEventOnce(
                    "__jbtGoogleReviewsAnimationCompletePushed",
                    "google_reviews_animation_complete"
                  )
                }
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                4.9
              </span>
              <span className="text-xs sm:text-sm text-white/45">
                average rating
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
