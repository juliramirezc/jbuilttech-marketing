"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";

type SocialPlatform = "facebook" | "instagram" | "google-business" | "google-reviews";

interface SocialCardProps {
  platform: SocialPlatform;
  scrollProgress: MotionValue<number>;
  index: number;
  reducedMotion: boolean;
}

/**
 * Platform-specific icons
 */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const StarRating = () => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 text-[#FBBC04]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

/**
 * Platform configurations
 */
const PLATFORM_CONFIG: Record<SocialPlatform, {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  stat?: string;
  statLabel?: string;
  bgGradient: string;
  iconColor: string;
}> = {
  facebook: {
    icon: <FacebookIcon />,
    title: "Facebook Business",
    subtitle: "Premium Builders LLC",
    stat: "2.4K",
    statLabel: "followers",
    bgGradient: "from-[#1877F2]/10 to-transparent",
    iconColor: "#1877F2",
  },
  instagram: {
    icon: <InstagramIcon />,
    title: "Instagram",
    subtitle: "@premiumbuilders",
    stat: "847",
    statLabel: "posts",
    bgGradient: "from-[#E4405F]/10 to-transparent",
    iconColor: "#E4405F",
  },
  "google-business": {
    icon: <GoogleIcon />,
    title: "Google Business Profile",
    subtitle: "Verified contractor in Westfield",
    stat: "12K",
    statLabel: "views/month",
    bgGradient: "from-[#4285F4]/10 to-transparent",
    iconColor: "#4285F4",
  },
  "google-reviews": {
    icon: <GoogleIcon />,
    title: "Google Reviews",
    subtitle: "4.9 average rating",
    stat: "127",
    statLabel: "reviews",
    bgGradient: "from-[#34A853]/10 to-transparent",
    iconColor: "#34A853",
  },
};

/**
 * SocialCard
 * 
 * Represents a social media presence card.
 * Communicates multi-channel visibility.
 * 
 * Design:
 * - Platform icon with brand color
 * - Platform name and handle
 * - Key metric
 * - Subtle gradient background
 */
export const SocialCard = memo(function SocialCard({
  platform,
  scrollProgress,
  index,
  reducedMotion,
}: SocialCardProps) {
  const config = PLATFORM_CONFIG[platform];

  // Staggered reveal — social cards complete by ~46%
  const startProgress = 0.36 + index * 0.02;
  const endProgress = startProgress + 0.04;

  const cardOpacity = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    [0, 1]
  );

  const cardY = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    reducedMotion ? [0, 0] : [25, 0]
  );

  const cardScale = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    reducedMotion ? [1, 1] : [0.95, 1]
  );

  return (
    <motion.div
      className={`relative p-4 rounded-xl bg-gradient-to-br ${config.bgGradient} border border-white/[0.06] backdrop-blur-sm overflow-hidden`}
      style={{
        opacity: cardOpacity,
        y: cardY,
        scale: cardScale,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${config.iconColor}20` }}
        >
          <div className="w-5 h-5" style={{ color: config.iconColor }}>
            {config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate mb-0.5">
            {config.title}
          </p>
          <p className="text-xs text-white/50 truncate mb-2">
            {config.subtitle}
          </p>

          {/* Rating for Google Reviews */}
          {platform === "google-reviews" && <StarRating />}

          {/* Stat */}
          {config.stat && platform !== "google-reviews" && (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-white">
                {config.stat}
              </span>
              <span className="text-xs text-white/40">{config.statLabel}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});