/**
 * Remap desktop digital-phase scroll thresholds to mobile timeline.
 * Mobile skips Framing + Finished Home — digital story begins earlier.
 */

const DESKTOP_DIGITAL_START = 0.65;
const MOBILE_DIGITAL_START = 0.16;
const DESKTOP_DIGITAL_RANGE = 1 - DESKTOP_DIGITAL_START;
const MOBILE_DIGITAL_RANGE = 1 - MOBILE_DIGITAL_START;

/** Map a desktop hero scroll value (≥0.65) to the mobile equivalent */
export function mobileHeroThreshold(desktopValue: number): number {
  if (desktopValue < DESKTOP_DIGITAL_START) {
    return desktopValue;
  }

  return (
    MOBILE_DIGITAL_START +
    ((desktopValue - DESKTOP_DIGITAL_START) / DESKTOP_DIGITAL_RANGE) *
      MOBILE_DIGITAL_RANGE
  );
}

export function mobileHeroRange(
  desktopRange: [number, number]
): [number, number] {
  return [
    mobileHeroThreshold(desktopRange[0]),
    mobileHeroThreshold(desktopRange[1]),
  ];
}

/** Blueprint dissolve window on mobile — short hold, then into digital story */
export const MOBILE_BLUEPRINT_DISSOLVE: [number, number] = [0.10, 0.20];

/**
 * Direct mobile digital-story ranges (no Finished Home / positioning title).
 * Progress is absolute mobile scroll (0–1).
 */
export const MOBILE_DIGITAL_STORY = {
  layerFade: [0.12, 0.20] as [number, number],
  contentScrollStart: 0.22,
  card1: [0.18, 0.28] as [number, number],
  card2: [0.30, 0.40] as [number, number],
  card3: [0.42, 0.52] as [number, number],
  badge1: [0.34, 0.40] as [number, number],
  badge2: [0.36, 0.42] as [number, number],
  badge3: [0.38, 0.44] as [number, number],
  websiteSlide: [0.46, 0.54] as [number, number],
  stat1: [0.54, 0.60] as [number, number],
  stat2: [0.56, 0.62] as [number, number],
  stat3: [0.58, 0.64] as [number, number],
  stat4: [0.60, 0.66] as [number, number],
  finalCopy: [0.66, 0.74] as [number, number],
  button: [0.72, 0.82] as [number, number],
  /** Max internal translate for the sticky story stack */
  contentScrollPx: 620,
} as const;
