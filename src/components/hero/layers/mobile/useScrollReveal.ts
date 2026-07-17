import { type MotionValue, useTransform } from "framer-motion";

export function useScrollReveal(
  scrollProgress: MotionValue<number>,
  range: [number, number],
  reducedMotion: boolean,
  options?: { y?: number; scale?: number; blur?: number }
) {
  const [start, end] = range;
  const yFrom = options?.y ?? 24;
  const scaleFrom = options?.scale ?? 0.97;
  const blurFrom = options?.blur ?? 4;

  const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const y = useTransform(
    scrollProgress,
    [start, end],
    reducedMotion ? [0, 0] : [yFrom, 0]
  );
  const scale = useTransform(
    scrollProgress,
    [start, end],
    reducedMotion ? [1, 1] : [scaleFrom, 1]
  );
  const filter = useTransform(
    scrollProgress,
    [start, end],
    reducedMotion
      ? ["blur(0px)", "blur(0px)"]
      : [`blur(${blurFrom}px)`, "blur(0px)"]
  );

  return { opacity, y, scale, filter };
}
