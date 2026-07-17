"use client";

import { memo } from "react";
import { type MotionValue } from "framer-motion";
import { DigitalPresenceDesktopLayer } from "./DigitalPresenceDesktopLayer";
import { DigitalPresenceMobileLayer } from "./DigitalPresenceMobileLayer";

interface DigitalPresenceLayerProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * DigitalPresenceLayer
 *
 * Orchestrates desktop (lg+) and mobile (<lg) digital presence experiences.
 * Desktop remains unchanged; mobile uses a dedicated vertical storytelling layout.
 */
export const DigitalPresenceLayer = memo(function DigitalPresenceLayer({
  scrollProgress,
  reducedMotion,
}: DigitalPresenceLayerProps) {
  return (
    <>
      <DigitalPresenceDesktopLayer
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />
      <DigitalPresenceMobileLayer
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />
    </>
  );
});
