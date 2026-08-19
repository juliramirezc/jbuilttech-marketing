"use client";

import { useEffect, useRef, useState } from "react";
import { PROCESS_SHOWCASE_VIDEOS } from "@/components/sections/process/mobile/constants";

const ROTATE_MS = 4200;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

type Slot = "left" | "center" | "right" | "hidden";

const SLOT_STYLE: Record<
  Slot,
  { left: string; transform: string; zIndex: number; opacity: number; width: string }
> = {
  left: {
    left: "2%",
    transform: "translateY(-50%) scale(0.88)",
    zIndex: 10,
    opacity: 0.55,
    width: "36%",
  },
  center: {
    left: "50%",
    transform: "translate(-50%, -50%) scale(1.06)",
    zIndex: 20,
    opacity: 1,
    width: "52%",
  },
  right: {
    left: "98%",
    transform: "translate(-100%, -50%) scale(0.88)",
    zIndex: 10,
    opacity: 0.55,
    width: "36%",
  },
  hidden: {
    left: "50%",
    transform: "translate(-50%, -50%) scale(0.7)",
    zIndex: 0,
    opacity: 0,
    width: "40%",
  },
};

/**
 * Auto-rotating 3-up video carousel — center card is active (larger + green glow).
 * Muted autoplay only for the active video; no user interaction required.
 */
export function WorkVideoCarousel() {
  const videos = PROCESS_SHOWCASE_VIDEOS;
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reducedMotion || videos.length < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % videos.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [inView, reducedMotion, videos.length]);

  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === active && inView) {
        vid.muted = true;
        const play = vid.play();
        if (play && typeof play.catch === "function") play.catch(() => {});
      } else {
        vid.pause();
        try {
          vid.currentTime = 0;
        } catch {
          // ignore seek errors
        }
      }
    });
  }, [active, inView]);

  const n = videos.length;
  const left = (active - 1 + n) % n;
  const right = (active + 1) % n;

  const slotFor = (index: number): Slot => {
    if (index === active) return "center";
    if (index === left) return "left";
    if (index === right) return "right";
    return "hidden";
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full select-none"
      aria-roledescription="carousel"
      aria-label="Contractor project videos"
    >
      <div className="relative mx-auto h-[230px] sm:h-[280px] md:h-[320px] lg:h-[360px] w-full max-w-xl">
        {videos.map((video, index) => {
          const slot = slotFor(index);
          const style = SLOT_STYLE[slot];
          const isCenter = slot === "center";

          return (
            <div
              key={video.id}
              className="absolute top-1/2 overflow-hidden rounded-2xl border border-white/10 bg-black transition-[left,transform,opacity,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                left: style.left,
                transform: style.transform,
                zIndex: style.zIndex,
                opacity: style.opacity,
                width: style.width,
                aspectRatio: "4 / 5",
                pointerEvents: slot === "hidden" ? "none" : "auto",
                boxShadow: isCenter
                  ? "0 0 0 1px rgba(34,160,84,0.4), 0 0 42px rgba(34,160,84,0.38), 0 22px 50px rgba(0,0,0,0.55)"
                  : "0 12px 28px rgba(0,0,0,0.4)",
              }}
              aria-hidden={!isCenter}
            >
              {isCenter ? (
                <div
                  className="pointer-events-none absolute -inset-5 rounded-[28px] bg-[rgb(34,160,84)]/30 blur-2xl -z-10"
                  aria-hidden="true"
                />
              ) : null}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={video.src}
                poster={video.poster}
                className={[
                  "h-full w-full object-cover",
                  isCenter
                    ? "brightness-105 contrast-105"
                    : "brightness-75 saturate-75",
                ].join(" ")}
                muted
                playsInline
                loop
                preload={isCenter ? "auto" : "metadata"}
                aria-label={video.title}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs font-medium text-white/90 truncate">
                  {video.badge}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
        {videos.map((v, i) => (
          <span
            key={v.id}
            className={[
              "h-1.5 rounded-full transition-all duration-300",
              i === active ? "w-5 bg-[rgb(34,160,84)]" : "w-1.5 bg-white/25",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
