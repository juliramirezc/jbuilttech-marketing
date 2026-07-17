"use client";

import { memo, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { CALENDLY_BOOKING_URL, getExternalLinkProps } from "@/lib/links";
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
  const isCentered = useInView(ref, { margin: "-42% 0px -42% 0px" });
  const hasEntered = useInView(ref, { once: true, margin: "-10%" });
  const isVisible = useInView(ref, { amount: 0.55 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Keep playback muted even if native controls try to unmute
    video.muted = true;
    video.volume = 0;

    const keepMuted = () => {
      video.muted = true;
      video.volume = 0;
    };
    video.addEventListener("volumechange", keepMuted);

    if (reducedMotion || !isVisible) {
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
  }, [isVisible, reducedMotion]);

  return (
    <motion.article
      ref={ref}
      className="snap-center shrink-0 w-[190px] sm:w-[210px]"
      initial={false}
      animate={{
        scale: reducedMotion ? 1 : isCentered ? 1 : 0.92,
        opacity: hasEntered ? 1 : 0,
        y: hasEntered ? 0 : reducedMotion ? 0 : 20,
      }}
      transition={{
        duration: reducedMotion ? 0.01 : 0.45,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: REVEAL_EASE,
      }}
    >
      <div className="relative aspect-[9/16] rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#111]">
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

        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase text-white/90 border border-white/15 bg-black/40 backdrop-blur-md">
          {badge}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
          <p className="text-sm font-medium text-white leading-snug">{title}</p>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * ProcessSectionMobile
 *
 * Mobile/tablet showcase replacing the vertical process timeline (below lg).
 */
export const ProcessSectionMobile = memo(function ProcessSectionMobile() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : 22,
      scale: reducedMotion ? 1 : 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.45,
        ease: REVEAL_EASE,
      },
    },
  };

  const statementRef = useRef<HTMLDivElement>(null);
  const statementInView = useInView(statementRef, { once: true, margin: "-60px" });

  return (
    <div ref={sectionRef} className="lg:hidden relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div className="mb-6" variants={itemVariants}>
          <h3
            id="process-heading"
            className="text-xl sm:text-2xl font-semibold text-white text-center mb-3 tracking-tight"
          >
            Recent Creative Work
          </h3>
          <p className="text-sm text-white/60 text-center max-w-md mx-auto leading-relaxed font-light">
            These are real marketing creatives we&apos;ve built for contractor brands.
            <br />
            <br />
            Different markets.
            <br />
            <br />
            Different services.
            <br />
            <br />
            One goal:
            <br />
            Turn attention into booked appointments.
          </p>
        </motion.div>

        <motion.div className="mb-8 -mx-5" variants={itemVariants}>
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

        <motion.div
          ref={statementRef}
          className="text-center max-w-lg mx-auto mb-8 px-2"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 24, scale: reducedMotion ? 1 : 0.98 }}
          animate={
            statementInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: reducedMotion ? 0 : 24, scale: reducedMotion ? 1 : 0.98 }
          }
          transition={{
            duration: reducedMotion ? 0.01 : 0.45,
            ease: REVEAL_EASE,
          }}
        >
          <p className="text-xl sm:text-2xl font-semibold text-white leading-snug tracking-tight">
            Your next customer doesn&apos;t know your workmanship yet.
          </p>
          <p className="text-xl sm:text-2xl font-semibold text-white/80 leading-snug tracking-tight mt-2">
            Our job is making sure they do.
          </p>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <a
            href={CALENDLY_BOOKING_URL}
            className="btn-primary"
            {...getExternalLinkProps()}
          >
            Book My Free Consultation
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
});
