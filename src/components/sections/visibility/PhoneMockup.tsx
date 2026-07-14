"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, type MotionValue } from "framer-motion";
import { NotificationCard, type Notification } from "./NotificationCard";

/**
 * Premium icons for notifications
 */
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.544 3.682 7.227L4.5 22l4.354-2.178c.996.267 2.053.41 3.146.41 5.523 0 10-4.144 10-9.232C22 6.145 17.523 2 12 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/**
 * Configurable notifications
 * These represent real business activity
 */
const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: <CalendarIcon />,
    title: "New Consultation Booked",
    subtitle: "Michael R. scheduled a kitchen remodel consultation for Thursday",
    time: "2m ago",
    iconBg: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
  },
  {
    id: 2,
    icon: <MessageIcon />,
    title: "Facebook Messenger",
    subtitle: "Hi! We saw your work on Main Street. Can you give us a quote?",
    time: "8m ago",
    iconBg: "linear-gradient(135deg, #1877F2 0%, #0D5BBE 100%)",
  },
  {
    id: 3,
    icon: <DocumentIcon />,
    title: "New Estimate Request",
    subtitle: "Bathroom renovation • Sarah T. • Westfield",
    time: "23m ago",
    iconBg: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
  },
  {
    id: 4,
    icon: <StarIcon />,
    title: "New Google Review",
    subtitle: "★★★★★ Amazing work on our deck! Highly recommend...",
    time: "1h ago",
    iconBg: "linear-gradient(135deg, #FBBC04 0%, #EA8600 100%)",
  },
];

/** Scroll progress when Facebook Insights animation completes */
const INSIGHTS_COMPLETE_THRESHOLD = 0.22;

/** Pause after insights settle before phone enters */
const PAUSE_AFTER_INSIGHTS_MS = 1000;

/** Phone entrance duration */
const PHONE_ANIMATION_DURATION_S = 0.8;

/** Pause after phone settles before first notification */
const NOTIFICATION_DELAY_AFTER_PHONE_MS = 250;

type AnimationPhase = "idle" | "waiting" | "phone" | "notifications";

interface PhoneMockupProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

const phoneVariants = {
  hidden: {
    opacity: 0,
    x: 80,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: PHONE_ANIMATION_DURATION_S,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

/**
 * PhoneMockup
 *
 * Time-based sequence triggered when Facebook Insights animation completes:
 * 1. Insights settle (scroll threshold)
 * 2. ~1s pause
 * 3. Phone slides in from right (0.8s ease-out)
 * 4. ~250ms pause
 * 5. Notifications appear one by one
 */
export const PhoneMockup = memo(function PhoneMockup({
  scrollProgress,
  reducedMotion,
}: PhoneMockupProps) {
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const hasTriggered = useRef(false);

  // Trigger sequence when insights animation completes via scroll
  useEffect(() => {
    const unsubscribe = scrollProgress.on("change", (progress) => {
      if (hasTriggered.current || progress < INSIGHTS_COMPLETE_THRESHOLD) return;
      hasTriggered.current = true;

      if (reducedMotion) {
        setPhase("notifications");
        return;
      }

      setPhase("waiting");
    });

    return unsubscribe;
  }, [scrollProgress, reducedMotion]);

  // 1s pause, then phone enters
  useEffect(() => {
    if (phase !== "waiting") return;

    const timer = setTimeout(() => {
      setPhase("phone");
    }, PAUSE_AFTER_INSIGHTS_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  // Phone settles, then notifications begin
  useEffect(() => {
    if (phase !== "phone") return;

    const timer = setTimeout(() => {
      setPhase("notifications");
    }, PHONE_ANIMATION_DURATION_S * 1000 + NOTIFICATION_DELAY_AFTER_PHONE_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  const showPhone = phase === "phone" || phase === "notifications";
  const showNotifications = phase === "notifications";

  return (
    <motion.div
      className="relative"
      variants={phoneVariants}
      initial="hidden"
      animate={showPhone ? "visible" : "hidden"}
    >
      {/* Phone frame */}
      <div className="relative w-[280px] md:w-[320px]">
        {/* Outer frame */}
        <div className="relative rounded-[3rem] bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] p-[3px] shadow-2xl shadow-black/60">
          {/* Inner frame */}
          <div className="relative rounded-[2.8rem] bg-[#000] overflow-hidden">
            {/* Screen */}
            <div className="relative aspect-[9/19.5] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]">
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full" />

              {/* Status bar */}
              <div className="absolute top-4 left-8 right-8 flex items-center justify-between text-white/60 text-[10px] font-medium">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 17h2v4H2v-4zm5-4h2v8H7v-8zm5-5h2v13h-2V8zm5-3h2v16h-2V5z" />
                  </svg>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.18.18.43.29.71.29.28 0 .53-.11.71-.29l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z" />
                  </svg>
                  <div className="w-6 h-3 rounded-sm border border-white/60 relative">
                    <div className="absolute inset-0.5 bg-white/60 rounded-sm" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>

              {/* Lock screen content */}
              <div className="absolute top-20 left-0 right-0 text-center">
                <p className="text-white/40 text-xs font-light tracking-wider mb-1">
                  Thursday, July 9
                </p>
                <p className="text-white text-6xl font-extralight tracking-tight">
                  9:41
                </p>
              </div>

              {/* Notifications container */}
              <div className="absolute bottom-8 left-3 right-3 space-y-2">
                {NOTIFICATIONS.map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    index={index}
                    isVisible={showNotifications}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute left-0 top-32 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute left-0 top-44 w-[3px] h-14 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute left-0 top-60 w-[3px] h-14 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute right-0 top-40 w-[3px] h-20 bg-[#2a2a2a] rounded-r-sm" />
      </div>
    </motion.div>
  );
});
