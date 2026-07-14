"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

/**
 * DigitalBrandScene
 * 
 * Phase 4 of the Hero experience.
 * Shows the digital transformation - laptop, phone, social media mockups.
 */

interface DigitalBrandSceneProps {
  scrollProgress: MotionValue<number>;
  className?: string;
}

export function DigitalBrandScene({ scrollProgress, className }: DigitalBrandSceneProps) {
  const opacity = useTransform(scrollProgress, [0.75, 0.85, 0.95, 1], [0, 1, 1, 1]);
  const devicesProgress = useTransform(scrollProgress, [0.8, 0.95], [0, 1]);

  return (
    <motion.div
      className={`absolute inset-0 flex items-center justify-center ${className || ""}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 800 500"
        className="w-full max-w-4xl h-auto"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <linearGradient id="deviceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>
        </defs>

        {/* Laptop */}
        <motion.g
          initial={{ opacity: 0, y: 30 }}
          style={{
            opacity: devicesProgress,
            y: useTransform(scrollProgress, [0.8, 0.9], [30, 0]),
          }}
        >
          {/* Laptop screen */}
          <rect x="200" y="100" width="300" height="200" rx="8" fill="url(#deviceGradient)" />
          <rect x="210" y="110" width="280" height="170" rx="4" fill="url(#screenGradient)" />

          {/* Screen content - website mockup */}
          <rect x="220" y="120" width="260" height="40" fill="#F59E0B" opacity="0.3" />
          <text x="230" y="145" fill="#FCD34D" fontSize="14" fontWeight="bold">CONTRACTOR BRAND</text>
          <rect x="220" y="170" width="120" height="8" fill="#4B5563" rx="2" />
          <rect x="220" y="185" width="180" height="6" fill="#374151" rx="2" />
          <rect x="220" y="198" width="150" height="6" fill="#374151" rx="2" />
          <rect x="220" y="220" width="80" height="30" rx="4" fill="#F59E0B" />
          <text x="235" y="240" fill="#1F2937" fontSize="10" fontWeight="bold">GET QUOTE</text>

          {/* Laptop base */}
          <path d="M 180 300 L 200 300 L 200 310 L 500 310 L 500 300 L 520 300 L 540 330 L 160 330 Z" fill="url(#deviceGradient)" />
        </motion.g>

        {/* Phone */}
        <motion.g
          initial={{ opacity: 0, x: 30 }}
          style={{
            opacity: useTransform(scrollProgress, [0.85, 0.92], [0, 1]),
            x: useTransform(scrollProgress, [0.85, 0.95], [30, 0]),
          }}
        >
          <rect x="560" y="150" width="100" height="180" rx="12" fill="url(#deviceGradient)" />
          <rect x="568" y="165" width="84" height="150" rx="4" fill="url(#screenGradient)" />

          {/* Phone screen content */}
          <rect x="575" y="175" width="70" height="20" fill="#F59E0B" opacity="0.3" />
          <rect x="575" y="205" width="50" height="4" fill="#4B5563" rx="1" />
          <rect x="575" y="215" width="65" height="3" fill="#374151" rx="1" />
          <rect x="575" y="225" width="55" height="3" fill="#374151" rx="1" />
          <rect x="575" y="250" width="40" height="15" rx="2" fill="#F59E0B" />

          {/* Phone notch */}
          <rect x="595" y="155" width="30" height="6" rx="3" fill="#111827" />
        </motion.g>

        {/* Social media post mockup */}
        <motion.g
          initial={{ opacity: 0, x: -30 }}
          style={{
            opacity: useTransform(scrollProgress, [0.88, 0.95], [0, 1]),
            x: useTransform(scrollProgress, [0.88, 0.98], [-30, 0]),
          }}
        >
          <rect x="80" y="180" width="100" height="140" rx="8" fill="#1F2937" />
          <rect x="88" y="188" width="84" height="60" fill="#374151" />
          <circle cx="100" cy="262" r="8" fill="#4B5563" />
          <rect x="115" y="256" width="50" height="4" fill="#4B5563" rx="1" />
          <rect x="115" y="264" width="35" height="3" fill="#374151" rx="1" />
          <rect x="88" y="280" width="60" height="3" fill="#374151" rx="1" />
          <rect x="88" y="288" width="75" height="3" fill="#374151" rx="1" />
          <rect x="88" y="300" width="45" height="3" fill="#374151" rx="1" />

          {/* Like/comment icons */}
          <circle cx="95" cy="312" r="4" fill="#EF4444" opacity="0.6" />
          <circle cx="110" cy="312" r="4" fill="#3B82F6" opacity="0.6" />
        </motion.g>

        {/* Connection lines */}
        <motion.g
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="4,4"
          fill="none"
          initial={{ opacity: 0 }}
          style={{ opacity: useTransform(scrollProgress, [0.9, 1], [0, 0.4]) }}
        >
          <path d="M 180 250 Q 190 300 350 350" />
          <path d="M 500 250 Q 530 280 560 250" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
