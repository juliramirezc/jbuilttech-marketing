"use client";

import { memo, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ConversionCta, useLeadModal } from "@/components/lead";
import { PROCESS_SHOWCASE_VIDEOS } from "./mobile/constants";

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

function ShowcaseReelCard({
  title,
  badge,
  src,
  poster,
  index,
  reducedMotion,
}: {
  title: string;
  badge: string;
  src: string;
  poster?: string;
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisible = useInView(ref, { amount: 0.45 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    if (isVisible) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isVisible, reducedMotion]);

  return (
    <motion.div
      ref={ref}
      className="relative shrink-0 w-[78vw] max-w-[280px] snap-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: reducedMotion ? 0.01 : 0.45,
        delay: reducedMotion ? 0 : index * 0.06,
        ease: REVEAL_EASE,
      }}
    >
      <div className="relative aspect-[9/14] bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          muted
          playsInline
          loop
          preload="metadata"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
          <p className="text-[10px] uppercase tracking-wider text-gold mb-1">
            {badge}
          </p>
          <p className="text-sm font-medium text-white leading-snug">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Mobile process / competitor conversion block.
 */
export const ProcessSectionMobile = memo(function ProcessSectionMobile() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(sectionRef, { once: true, margin: "-40px" });
  const { openLeadModal } = useLeadModal();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.45,
        ease: REVEAL_EASE,
      },
    },
  };

  return (
    <div ref={sectionRef} className="lg:hidden relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div className="mb-6 px-1" variants={itemVariants}>
          <h3
            id="process-heading"
            className="text-2xl sm:text-3xl font-semibold text-white text-center mb-5 tracking-tight leading-tight"
          >
            BEING BETTER ISN&apos;T ENOUGH.
          </h3>

          <div className="text-sm sm:text-base text-white/75 text-center max-w-md mx-auto leading-relaxed font-light space-y-3">
            <p>You know the guy.</p>
            <p>His work isn&apos;t better than yours.</p>
            <p>His crew isn&apos;t better than yours.</p>
            <p>He doesn&apos;t care more about the homeowner than you do.</p>
            <p className="text-white font-medium pt-1">
              But somehow his phone keeps ringing.
            </p>
            <p className="text-lg sm:text-xl font-semibold text-gold pt-3 leading-snug">
              Maybe he&apos;s just easier to find.
            </p>
            <p className="pt-1">
              And if a homeowner sees his work before they see yours,{" "}
              <strong className="text-white font-semibold">
                he gets the chance to win the job first.
              </strong>
            </p>
            <p className="text-lg sm:text-xl font-semibold text-white pt-3 leading-snug">
              Stop giving that advantage away.
            </p>
          </div>
        </motion.div>

        <motion.div className="mb-8 text-center" variants={itemVariants}>
          <ConversionCta onClick={() => openLeadModal("competitor_section")}>
            GET MY COMPANY FOUND
          </ConversionCta>
        </motion.div>

        <motion.div className="mb-6 -mx-5" variants={itemVariants}>
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-2 scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {PROCESS_SHOWCASE_VIDEOS.map((video, index) => (
              <ShowcaseReelCard
                key={video.id}
                title={video.title}
                badge={video.badge}
                src={video.src}
                poster={video.poster}
                index={index}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});
