"use client";

import { memo, type ReactNode } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { CALENDLY_BOOKING_URL, getExternalLinkProps } from "@/lib/links";
import { MOBILE_HERO_IMAGES } from "./mobile/constants";
import { MOBILE_DIGITAL_STORY } from "./mobile/scrollThresholds";
import { useScrollReveal } from "./mobile/useScrollReveal";

interface DigitalPresenceMobileLayerProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

const STATS = [
  { icon: "👁", label: "More Visibility" },
  { icon: "⭐", label: "More Trust" },
  { icon: "📞", label: "More Calls" },
  { icon: "🏠", label: "More Projects" },
] as const;

const SOCIAL_PLATFORMS = [
  { name: "Instagram", color: "#E4405F" },
  { name: "Facebook", color: "#1877F2" },
  { name: "TikTok", color: "#ffffff" },
  { name: "YouTube", color: "#FF0000" },
] as const;

const ENGAGEMENT_BADGES = [
  "+18K Reach",
  "247 Likes",
  "Video Views",
] as const;

function StoryCard({
  imageSrc,
  imageAlt,
  title,
  children,
  style,
}: {
  imageSrc: string;
  imageAlt: string;
  title: string;
  children: ReactNode;
  style: {
    opacity: MotionValue<number>;
    y: MotionValue<number>;
    scale: MotionValue<number>;
    filter: MotionValue<string>;
  };
}) {
  return (
    <motion.article
      className="w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      style={{
        backgroundColor: "rgba(8, 12, 20, 0.5)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        opacity: style.opacity,
        y: style.y,
        scale: style.scale,
        filter: style.filter,
      }}
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 0px"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/80 via-transparent to-transparent" />
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-snug mb-2">
          {title}
        </h3>
        {children}
      </div>
    </motion.article>
  );
}

function SocialIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, ReactNode> = {
    Instagram: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill={color}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    Facebook: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill={color}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    TikTok: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill={color}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
      </svg>
    ),
    YouTube: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill={color}>
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };

  return (
    <div
      className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/5"
      title={name}
    >
      {icons[name]}
    </div>
  );
}

/**
 * DigitalPresenceMobileLayer
 *
 * Mobile digital story (below lg): Blueprint dissolves directly into
 * Photos & Videos → Social → Website → Stats → CTA.
 * Desktop is handled separately and remains unchanged.
 */
export const DigitalPresenceMobileLayer = memo(function DigitalPresenceMobileLayer({
  scrollProgress,
  reducedMotion,
}: DigitalPresenceMobileLayerProps) {
  const {
    layerFade,
    contentScrollStart,
    contentScrollPx,
    card1: card1Range,
    card2: card2Range,
    card3: card3Range,
    badge1: badge1Range,
    badge2: badge2Range,
    badge3: badge3Range,
    websiteSlide,
    stat1: stat1Range,
    stat2: stat2Range,
    stat3: stat3Range,
    stat4: stat4Range,
    finalCopy,
    button,
  } = MOBILE_DIGITAL_STORY;

  const layerOpacity = useTransform(scrollProgress, layerFade, [0, 1]);

  const contentScrollY = useTransform(scrollProgress, (v) => {
    if (v < contentScrollStart) return "0px";
    const t = Math.min(1, (v - contentScrollStart) / (1 - contentScrollStart));
    return `${-t * contentScrollPx}px`;
  });

  const card1 = useScrollReveal(scrollProgress, card1Range, reducedMotion);
  const card2 = useScrollReveal(scrollProgress, card2Range, reducedMotion);
  const card3 = useScrollReveal(scrollProgress, card3Range, reducedMotion);

  const badge1 = useScrollReveal(scrollProgress, badge1Range, reducedMotion, {
    y: 12,
  });
  const badge2 = useScrollReveal(scrollProgress, badge2Range, reducedMotion, {
    y: 12,
  });
  const badge3 = useScrollReveal(scrollProgress, badge3Range, reducedMotion, {
    y: 12,
  });

  const websiteSlideX = useTransform(
    scrollProgress,
    websiteSlide,
    reducedMotion ? [0, 0] : [40, 0]
  );
  const websiteSlideOpacity = useTransform(scrollProgress, websiteSlide, [0, 1]);
  const websiteSlideScale = useTransform(
    scrollProgress,
    websiteSlide,
    reducedMotion ? [1, 1] : [0.96, 1]
  );

  const stat1 = useScrollReveal(scrollProgress, stat1Range, reducedMotion, {
    y: 16,
  });
  const stat2 = useScrollReveal(scrollProgress, stat2Range, reducedMotion, {
    y: 16,
  });
  const stat3 = useScrollReveal(scrollProgress, stat3Range, reducedMotion, {
    y: 16,
  });
  const stat4 = useScrollReveal(scrollProgress, stat4Range, reducedMotion, {
    y: 16,
  });

  const finalReveal = useScrollReveal(scrollProgress, finalCopy, reducedMotion, {
    y: 20,
    scale: 0.98,
  });
  const buttonReveal = useScrollReveal(scrollProgress, button, reducedMotion, {
    y: 14,
    scale: 0.97,
  });

  return (
    <motion.div
      className="lg:hidden absolute inset-0 overflow-hidden will-change-transform"
      style={{ opacity: layerOpacity }}
    >
      <div className="absolute inset-0 bg-[#090909]" />

      <motion.div
        className="relative z-10 w-full max-w-lg mx-auto px-5 pt-10 pb-8"
        style={{ y: contentScrollY }}
      >
        <div className="flex flex-col gap-8 sm:gap-10">
          <StoryCard
            imageSrc={MOBILE_HERO_IMAGES.roofing}
            imageAlt="Roofing contractor installing architectural shingles on a premium home"
            title="Professional Photos & Videos"
            style={card1}
          >
            <p className="text-sm text-white/65 font-light leading-relaxed">
              Show homeowners the quality of your work before they ever call.
            </p>
          </StoryCard>

          <div className="relative">
            <StoryCard
              imageSrc={MOBILE_HERO_IMAGES.kitchen}
              imageAlt="Luxury finished kitchen remodeling project"
              title="Social Media That Builds Trust"
              style={card2}
            >
              <p className="text-sm text-white/65 font-light leading-relaxed mb-4">
                Consistent content across every platform homeowners use.
              </p>
              <div className="flex items-center gap-2.5">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <SocialIcon
                    key={platform.name}
                    name={platform.name}
                    color={platform.color}
                  />
                ))}
              </div>
            </StoryCard>

            <motion.span
              className="absolute -top-2 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium text-white/90 border border-white/10 bg-white/10 backdrop-blur-md shadow-lg"
              style={{
                opacity: badge1.opacity,
                y: badge1.y,
                scale: badge1.scale,
              }}
            >
              {ENGAGEMENT_BADGES[0]}
            </motion.span>
            <motion.span
              className="absolute top-[38%] -left-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-white/90 border border-white/10 bg-white/10 backdrop-blur-md shadow-lg"
              style={{
                opacity: badge2.opacity,
                y: badge2.y,
                scale: badge2.scale,
              }}
            >
              {ENGAGEMENT_BADGES[1]}
            </motion.span>
            <motion.span
              className="absolute bottom-[28%] -right-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-white/90 border border-white/10 bg-white/10 backdrop-blur-md shadow-lg"
              style={{
                opacity: badge3.opacity,
                y: badge3.y,
                scale: badge3.scale,
              }}
            >
              {ENGAGEMENT_BADGES[2]}
            </motion.span>
          </div>

          <motion.article
            className="w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            style={{
              backgroundColor: "rgba(8, 12, 20, 0.5)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              opacity: card3.opacity,
              y: card3.y,
              scale: card3.scale,
              filter: card3.filter,
            }}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative aspect-[4/3] sm:aspect-auto sm:w-[58%] sm:min-h-[220px]">
                <Image
                  src={MOBILE_HERO_IMAGES.siding}
                  alt="Premium siding installation on a luxury home exterior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 0px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#090909]/40 sm:block hidden" />
              </div>
              <div className="flex-1 px-5 py-5 sm:px-6 sm:py-6 flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-snug mb-3">
                  A Website That Converts Visitors Into Customers
                </h3>
                <motion.div
                  className="rounded-xl overflow-hidden border border-white/10 shadow-xl"
                  style={{
                    opacity: websiteSlideOpacity,
                    x: websiteSlideX,
                    scale: websiteSlideScale,
                  }}
                >
                  <div className="h-5 bg-[#141414] flex items-center gap-1 px-2 border-b border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="flex-1 h-2 bg-white/5 rounded-sm mx-1" />
                  </div>
                  <div
                    className="aspect-[16/11] p-3"
                    style={{
                      background:
                        "linear-gradient(180deg, #0f1419 0%, #1a2332 100%)",
                    }}
                  >
                    <div className="h-2.5 w-20 rounded bg-amber-500/50 mb-2.5" />
                    <div className="h-1.5 w-full bg-white/10 rounded mb-1.5" />
                    <div className="h-1.5 w-[85%] bg-white/10 rounded mb-4" />
                    <div className="h-7 w-24 rounded bg-amber-500/70" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.article>

          <motion.div
            className="grid grid-cols-2 gap-3 sm:gap-4"
            aria-label="Business growth outcomes"
          >
            {[stat1, stat2, stat3, stat4].map((statStyle, i) => (
              <motion.div
                key={STATS[i].label}
                className="rounded-3xl border border-white/[0.08] px-4 py-4 text-center shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
                style={{
                  backgroundColor: "rgba(8, 12, 20, 0.45)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  opacity: statStyle.opacity,
                  y: statStyle.y,
                  scale: statStyle.scale,
                  filter: statStyle.filter,
                }}
              >
                <span className="text-xl mb-1.5 block" aria-hidden="true">
                  {STATS[i].icon}
                </span>
                <span className="text-xs sm:text-sm font-medium text-white/85 tracking-tight">
                  {STATS[i].label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.footer
            className="text-center pt-4 pb-6 pointer-events-auto"
            style={{
              opacity: finalReveal.opacity,
              y: finalReveal.y,
              scale: finalReveal.scale,
              filter: finalReveal.filter,
            }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 tracking-tight leading-tight">
              This Could Be{" "}
              <span className="text-gold-gradient">Your Business.</span>
            </h3>
            <p className="text-sm text-white/85 font-light mb-1">
              You already build incredible projects.
            </p>
            <p className="text-xs sm:text-sm text-white/60 font-light mb-8 leading-relaxed max-w-xs mx-auto">
              Now let homeowners experience that same quality before they ever
              call.
            </p>

            <motion.div
              style={{
                opacity: buttonReveal.opacity,
                y: buttonReveal.y,
                scale: buttonReveal.scale,
                filter: buttonReveal.filter,
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
          </motion.footer>
        </div>
      </motion.div>
    </motion.div>
  );
});
