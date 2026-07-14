"use client";

import { memo } from "react";
import { type MotionValue } from "framer-motion";
import { ProcessCard, type ProcessStep } from "./ProcessCard";
import { BlueprintConnector } from "./BlueprintConnector";

interface ProcessTimelineProps {
  steps: ProcessStep[];
  lineProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * ProcessTimeline
 * 
 * Orchestrates the process cards and blueprint connector.
 * Handles the responsive layout and passes scroll progress to children.
 * 
 * Layout Strategy:
 * - Desktop (lg+): 6 cards in a single row, horizontal connector
 * - Tablet (md): 3 cards per row (2 rows), connector adapts
 * - Mobile: Stacked cards, vertical connector
 * 
 * The timeline creates the visual metaphor of an architect's blueprint
 * being revealed step by step.
 */
export const ProcessTimeline = memo(function ProcessTimeline({
  steps,
  lineProgress,
  reducedMotion,
}: ProcessTimelineProps) {
  return (
    <div className="relative">
      {/* Blueprint grid background - subtle */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 180, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 180, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Desktop layout: Single row of 6 cards */}
      <div className="hidden lg:block relative">
        {/* Horizontal connector */}
        <BlueprintConnector
          progress={lineProgress}
          orientation="horizontal"
          reducedMotion={reducedMotion}
        />

        {/* Cards grid */}
        <div className="grid grid-cols-6 gap-6 xl:gap-8">
          {steps.map((step, index) => (
            <ProcessCard
              key={step.id}
              step={step}
              lineProgress={lineProgress}
              index={index}
              totalSteps={steps.length}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>

      {/* Tablet layout: 2 rows of 3 cards */}
      <div className="hidden md:grid lg:hidden grid-cols-3 gap-8 relative">
        {/* Vertical connector for tablet - runs between rows */}
        <BlueprintConnector
          progress={lineProgress}
          orientation="vertical"
          reducedMotion={reducedMotion}
        />

        {steps.map((step, index) => (
          <ProcessCard
            key={step.id}
            step={step}
            lineProgress={lineProgress}
            index={index}
            totalSteps={steps.length}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Mobile layout: Stacked cards */}
      <div className="md:hidden relative">
        {/* Vertical connector */}
        <BlueprintConnector
          progress={lineProgress}
          orientation="vertical"
          reducedMotion={reducedMotion}
        />

        <div className="flex flex-col gap-12 items-center">
          {steps.map((step, index) => (
            <ProcessCard
              key={step.id}
              step={step}
              lineProgress={lineProgress}
              index={index}
              totalSteps={steps.length}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </div>
  );
});