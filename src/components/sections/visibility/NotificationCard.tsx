"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export interface Notification {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
  iconBg: string;
}

interface NotificationCardProps {
  notification: Notification;
  index: number;
  isVisible: boolean;
  reducedMotion: boolean;
}

/**
 * NotificationCard
 * 
 * iOS-style notification for the phone mockup.
 * Animates in with a slide + fade effect.
 * 
 * Design:
 * - Glassmorphism background
 * - App icon with colored background
 * - Title and subtitle
 * - Time indicator
 */
export const NotificationCard = memo(function NotificationCard({
  notification,
  index,
  isVisible,
  reducedMotion,
}: NotificationCardProps) {
  const variants = {
    hidden: {
      opacity: 0,
      x: reducedMotion ? 0 : 50,
      scale: reducedMotion ? 1 : 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.5,
        delay: reducedMotion ? 0 : index * 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] shadow-lg"
      variants={variants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {/* App icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: notification.iconBg }}
      >
        <div className="w-5 h-5 text-white">{notification.icon}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-xs font-medium text-white truncate">
            {notification.title}
          </p>
          <span className="text-[10px] text-white/40 flex-shrink-0">
            {notification.time}
          </span>
        </div>
        <p className="text-[11px] text-white/60 leading-tight line-clamp-2">
          {notification.subtitle}
        </p>
      </div>
    </motion.div>
  );
});