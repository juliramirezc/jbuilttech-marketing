/**
 * Animation Configuration
 * Shared animation constants and utilities
 */

export const HERO_SCROLL_HEIGHT_VH = 500;

export const HERO_PHASES = {
  BLUEPRINT: { start: 0, end: 0.2 },
  CONSTRUCTION: { start: 0.2, end: 0.5 },
  FINISHED: { start: 0.5, end: 0.8 },
  DIGITAL: { start: 0.8, end: 1 },
} as const;

export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  xslow: 0.8,
} as const;

export const EASING = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  snap: [0.77, 0, 0.175, 1],
} as const;

/**
 * Calculate scroll progress within a range
 */
export function getProgressInRange(
  scrollProgress: number,
  start: number,
  end: number
): number {
  if (scrollProgress <= start) return 0;
  if (scrollProgress >= end) return 1;
  return (scrollProgress - start) / (end - start);
}
