"use client";

import { memo, useEffect, useRef } from "react";
import { motion, type MotionValue, useInView, useTransform } from "framer-motion";
import { CALENDLY_BOOKING_URL, getExternalLinkProps } from "@/lib/links";
import { PROCESS_SHOWCASE_VIDEOS } from "@/components/sections/process/mobile/constants";

interface DigitalPresenceDesktopLayerProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

function DesktopShowcaseVideo({
  title,
  badge,
  src,
  poster,
}: {
  title: string;
  badge: string;
  src: string;
  poster?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisible = useInView(ref, { amount: 0.4 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.volume = 0;

    const keepMuted = () => {
      video.muted = true;
      video.volume = 0;
    };
    video.addEventListener("volumechange", keepMuted);

    if (!isVisible) {
      video.pause();
      return () => video.removeEventListener("volumechange", keepMuted);
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be blocked; controls still allow manual play.
      });
    }

    return () => video.removeEventListener("volumechange", keepMuted);
  }, [isVisible]);

  return (
    <article
      ref={ref}
      className="relative shrink-0 w-[150px] xl:w-[170px] 2xl:w-[190px] aspect-[9/16] max-h-[min(420px,48vh)] rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#111] transition-transform duration-300 hover:scale-[1.02]"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label={title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/20 to-transparent pointer-events-none" />
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase text-white/90 border border-white/15 bg-black/40 backdrop-blur-md pointer-events-none">
        {badge}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none">
        <p className="text-xs font-medium text-white leading-snug">{title}</p>
      </div>
    </article>
  );
}

/**
 * DigitalPresenceDesktopLayer
 *
 * PHASE 5 - Grand Finale (desktop lg+ only): Video showcase becomes the FINAL visual reveal
 *
 * Timeline:
 * - 65-80%: Showcase animates into view (opacity, scale, Y position)
 * - 80-88%: Showcase fully settled - visitor appreciates the completed brand
 * - 88-91%: Glass panel fades in behind text area
 * - 91-94%: Headline fades upward
 * - 94-96%: Supporting text appears
 * - 96-100%: Button animates with spring feel
 */
export const DigitalPresenceDesktopLayer = memo(function DigitalPresenceDesktopLayer({
  scrollProgress,
  reducedMotion,
}: DigitalPresenceDesktopLayerProps) {
  const mockupsOpacity = useTransform(
    scrollProgress,
    [0.65, 0.75],
    [0, 1]
  );

  const mockupsScale = useTransform(
    scrollProgress,
    [0.65, 0.80],
    reducedMotion ? [1, 1] : [0.92, 1]
  );

  const mockupsY = useTransform(
    scrollProgress,
    [0.65, 0.80],
    reducedMotion ? ["0%", "0%"] : ["8%", "0%"]
  );

  const panelOpacity = useTransform(
    scrollProgress,
    [0.88, 0.91],
    [0, 1]
  );

  const panelScale = useTransform(
    scrollProgress,
    [0.88, 0.91],
    reducedMotion ? [1, 1] : [0.97, 1]
  );

  const headlineOpacity = useTransform(
    scrollProgress,
    [0.91, 0.94],
    [0, 1]
  );

  const headlineY = useTransform(
    scrollProgress,
    [0.91, 0.94],
    reducedMotion ? [0, 0] : [18, 0]
  );

  const supportingOpacity = useTransform(
    scrollProgress,
    [0.94, 0.96],
    [0, 1]
  );

  const supportingY = useTransform(
    scrollProgress,
    [0.94, 0.96],
    reducedMotion ? [0, 0] : [14, 0]
  );

  const buttonOpacity = useTransform(
    scrollProgress,
    [0.96, 1.0],
    [0, 1]
  );

  const buttonY = useTransform(
    scrollProgress,
    [0.96, 1.0],
    reducedMotion ? [0, 0] : [20, 0]
  );

  const buttonScale = useTransform(
    scrollProgress,
    [0.96, 1.0],
    reducedMotion ? [1, 1] : [0.82, 1]
  );

  const buttonBlur = useTransform(
    scrollProgress,
    [0.96, 0.99],
    reducedMotion ? [0, 0] : [6, 0]
  );

  return (
    <motion.div
      className="absolute inset-0 hidden lg:flex items-center justify-center will-change-transform"
      style={{
        opacity: mockupsOpacity,
      }}
    >
      <motion.div
        className="relative w-full max-w-6xl mx-auto px-8"
        style={{
          scale: mockupsScale,
          y: mockupsY,
        }}
      >
        <div
          className="flex justify-center items-center gap-3 xl:gap-4 w-full pointer-events-auto"
          aria-label="Recent creative work video showcase"
        >
          {PROCESS_SHOWCASE_VIDEOS.map((video) => (
            <DesktopShowcaseVideo
              key={video.id}
              title={video.title}
              badge={video.badge}
              src={video.src}
              poster={video.poster}
            />
          ))}
        </div>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <motion.div
            className="absolute -inset-x-10 sm:-inset-x-14 md:-inset-x-20 -inset-y-8 sm:-inset-y-10 md:-inset-y-14"
            style={{
              opacity: panelOpacity,
              scale: panelScale,
              backgroundColor: "rgba(8, 12, 20, 0.42)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "28px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 30px 90px rgba(0, 0, 0, 0.35)",
            }}
          />

          <div className="relative z-10 text-center px-6 py-4 pointer-events-auto">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-5 tracking-tight"
              style={{
                opacity: headlineOpacity,
                y: headlineY,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              This Could Be{" "}
              <span className="text-gold-gradient">Your Business.</span>
            </motion.h2>

            <motion.div
              style={{
                opacity: supportingOpacity,
                y: supportingY,
              }}
            >
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-2 font-light">
                You already build incredible projects.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-white/70 mb-10 font-light max-w-lg mx-auto leading-relaxed">
                Now build a brand that homeowners trust before they ever call.
              </p>
            </motion.div>

            <motion.div
              style={{
                opacity: buttonOpacity,
                y: buttonY,
                scale: buttonScale,
                filter: useTransform(buttonBlur, (v) => `blur(${v}px)`),
              }}
            >
              <a
                href={CALENDLY_BOOKING_URL}
                className="hero-final-cta"
                data-calendly-trigger
                {...getExternalLinkProps()}
              >
                Build My Brand
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
