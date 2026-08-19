"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { GoogleProofCards } from "@/components/home/GoogleProofCards";
import { CALENDLY_BOOKING_URL, getExternalLinkProps } from "@/lib/links";
import { pushDataLayerEvent } from "@/lib/analytics";

const PROJECT_IMAGES = [
  {
    src: "/images/kitchen-remodel.jpg",
    alt: "Completed kitchen remodel project",
  },
  {
    src: "/images/siding.jpg",
    alt: "Completed exterior siding project",
  },
] as const;

const INQUIRIES = [
  "Can you give me a quote?",
  "How much for this?",
  "Where are you located?",
  "Can you come tomorrow?",
] as const;

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

function playSoftBeep(unlocked: boolean) {
  if (!unlocked) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.14);
    window.setTimeout(() => ctx.close().catch(() => {}), 200);
  } catch {
    // Never break UX for optional sound
  }
}

/**
 * Section 2 — approved competitor messaging + coordinated entrance visuals.
 * CTA opens existing Calendly popup (CalendlyProvider) — not the lead form.
 */
export function CompetitorBlock() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);
  const [visibleNotices, setVisibleNotices] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const unlock = () => setAudioUnlocked(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const timers: number[] = [];

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        if (reducedMotion) {
          setPhase(8);
          setVisibleNotices(INQUIRIES.length);
          return;
        }

        // Compact viewport-triggered sequence (no scroll runway)
        // 1–2 images, 3 copy, 4 social, 5 insights, 6 GBP, 7 reviews, 8 notices
        const steps = [
          () => setPhase(1),
          () => setPhase(2),
          () => setPhase(3),
          () => setPhase(4),
          () => setPhase(5),
          () => setPhase(6),
          () => setPhase(7),
          () => setPhase(8),
        ];
        const delays = [0, 320, 620, 920, 1220, 1550, 1900, 2350];
        delays.forEach((ms, i) => {
          timers.push(window.setTimeout(steps[i], ms));
        });
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (phase < 8 || reducedMotion) return;
    let i = 0;
    const tick = () => {
      i += 1;
      setVisibleNotices(i);
      playSoftBeep(audioUnlocked);
      if (i < INQUIRIES.length) {
        timer = window.setTimeout(tick, 900);
      }
    };
    let timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion, audioUnlocked]);

  const enter = (visible: boolean, x = -28) =>
    reducedMotion
      ? { opacity: 1, x: 0, y: 0, scale: 1 }
      : visible
        ? { opacity: 1, x: 0, y: 0, scale: 1 }
        : { opacity: 0, x, y: 12, scale: 0.96 };

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0a0a0a] py-14 md:py-16 lg:py-20 overflow-hidden"
      aria-labelledby="competitor-heading"
    >
      <div className="container-luxury relative z-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-start">
          {/* Visual story column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {PROJECT_IMAGES.map((img, i) => (
                <motion.div
                  key={img.src}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                  initial={false}
                  animate={enter(phase >= i + 1, i === 0 ? -36 : 36)}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={false}
              animate={enter(phase >= 4, 0)}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#1877F2]/15 px-3.5 py-2.5">
                <span className="text-[#1877F2]">
                  <FacebookIcon />
                </span>
                <span className="text-sm font-medium text-white">Facebook</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#E4405F]/15 px-3.5 py-2.5">
                <span className="text-[#E4405F]">
                  <InstagramIcon />
                </span>
                <span className="text-sm font-medium text-white">Instagram</span>
              </div>
            </motion.div>

            <motion.div
              className="relative w-full overflow-hidden rounded-xl border border-white/[0.1] bg-[#1a1a1a] shadow-2xl shadow-black/40"
              initial={false}
              animate={enter(phase >= 5, 0)}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 px-3 py-2.5 bg-[#2a2a2a] border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-3 py-1 rounded-md bg-[#1a1a1a] border border-white/[0.08] text-[10px] sm:text-xs text-white/50 truncate max-w-full">
                    business.facebook.com/insights
                  </div>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/images/visibility/facebook-insights.png"
                  alt="Facebook Business Page insights showing engagement and reach"
                  width={1200}
                  height={650}
                  className="w-full h-auto object-contain"
                  unoptimized
                />
              </div>
            </motion.div>

            <GoogleProofCards
              showProfile={phase >= 6}
              showReviews={phase >= 7}
            />

            <div className="space-y-2.5 min-h-[11rem]" aria-live="polite">
              {INQUIRIES.slice(0, visibleNotices).map((msg) => (
                <motion.div
                  key={msg}
                  className="flex items-start gap-3 rounded-2xl border border-[rgb(34,160,84)]/25 bg-[rgb(34,160,84)]/10 px-3.5 py-3 shadow-lg backdrop-blur-sm"
                  initial={
                    reducedMotion
                      ? false
                      : { opacity: 0, x: 40, scale: 0.92 }
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[rgb(34,160,84)] text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.544 3.682 7.227L4.5 22l4.354-2.178c.996.267 2.053.41 3.146.41 5.523 0 10-4.144 10-9.232C22 6.145 17.523 2 12 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white">Messages</p>
                      <span className="text-[10px] text-white/40">now</span>
                    </div>
                    <p className="text-sm text-white/85 leading-snug">{msg}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Approved copy — unchanged */}
          <motion.div
            className="lg:col-span-6 lg:sticky lg:top-24"
            initial={false}
            animate={enter(phase >= 3, 24)}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              id="competitor-heading"
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-white tracking-tight leading-[1.1] mb-6"
            >
              BEING BETTER ISN&apos;T ENOUGH.
            </h2>

            <div className="space-y-2.5 text-base sm:text-lg text-white/75 font-light leading-relaxed mb-5">
              <p>You know the guy.</p>
              <p>His work isn&apos;t better than yours.</p>
              <p>His crew isn&apos;t better than yours.</p>
              <p>He doesn&apos;t care more about the homeowner than you do.</p>
              <p className="text-white font-medium pt-1">
                But somehow his phone keeps ringing.
              </p>
            </div>

            <p className="text-xl sm:text-2xl font-semibold text-gold tracking-tight mb-4">
              Maybe he&apos;s just easier to find.
            </p>

            <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed mb-4 max-w-xl">
              And if a homeowner sees his work before they see yours,{" "}
              <strong className="text-white font-semibold">
                he gets the chance to win the job first.
              </strong>
            </p>

            <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-7">
              Stop giving that advantage away.
            </p>

            <a
              href={CALENDLY_BOOKING_URL}
              className="btn-conversion btn-conversion--pulse inline-flex w-full sm:w-auto"
              {...getExternalLinkProps()}
              onClick={() => {
                pushDataLayerEvent("section2_book_consultation_click");
                pushDataLayerEvent("calendly_opened", {
                  source: "competitor_section",
                });
              }}
            >
              BOOK MY FREE CONSULTATION
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
