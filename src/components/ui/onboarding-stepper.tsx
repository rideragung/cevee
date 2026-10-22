import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** The progress shapes supported by the onboarding stepper. */
export type OnboardingProgressStyle =
  | "dots"
  | "segments"
  | "numbers"
  | "rail"
  | "fraction";

/** Controls how much step copy appears beside the progress shape. */
export type OnboardingLabelMode = "none" | "current" | "all";

/** Motion values shared by the progress indicator and panel transition. */
export type OnboardingMotion = {
  offset: number;
  stiffness: number;
  damping: number;
  mass: number;
  exitDuration: number;
};

/** One step in an onboarding, setup, survey, or product-tour flow. */
export type OnboardingStepperStep = {
  id: string;
  label: string;
  title: string;
  description?: string;
  content?: ReactNode;
  complete?: boolean;
};

/** Direction reported when the current step changes. */
export type OnboardingDirection = 1 | -1;

/** Visual state for one step in the progress indicator. */
export type OnboardingStepState = "completed" | "current" | "upcoming";

/** Default motion values for onboarding panels and indicators. */
export const DEFAULT_ONBOARDING_MOTION: OnboardingMotion = {
  offset: 18,
  stiffness: 280,
  damping: 30,
  mass: 0.8,
  exitDuration: 0.12,
};

/** Keeps a requested step inside the available range. */
export function clampOnboardingIndex(value: number, total: number) {
  if (total < 1) return 0;
  return Math.max(0, Math.min(total - 1, Math.trunc(value)));
}

/** Returns the visual state of one step relative to the current step. */
export function getOnboardingStepState(
  stepIndex: number,
  currentIndex: number,
): OnboardingStepState {
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

/** Returns semantic text classes for completed, current, and upcoming steps. */
export function getOnboardingLabelTone(state: OnboardingStepState) {
  if (state === "current") return "font-semibold text-primary";
  if (state === "completed") return "font-medium text-foreground";
  return "text-muted-foreground";
}

/** Returns the shared Motion transition, including the reduced-motion form. */
export function getOnboardingTransition(
  reduced: boolean,
  config: OnboardingMotion,
) {
  return reduced
    ? { duration: 0 }
    : {
        type: "spring" as const,
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
      };
}

/** Renders labels beneath a horizontal progress indicator. */
export function OnboardingStepLabels({
  steps,
  index,
  mode,
}: {
  steps: OnboardingStepperStep[];
  index: number;
  mode: OnboardingLabelMode;
}) {
  if (mode === "none") return null;

  if (mode === "current") {
    return (
      <p className="mt-2 text-center text-xs font-semibold text-primary">
        {steps[index]?.label}
      </p>
    );
  }

  return (
    <ol
      className="mt-2 grid list-none gap-2 p-0"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step, stepIndex) => {
        const state = getOnboardingStepState(stepIndex, index);

        return (
          <li
            key={step.id}
            data-step-state={state}
            className={`min-w-0 text-center text-xs transition-colors ${getOnboardingLabelTone(state)}`}
          >
            <span className="block truncate">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Renders a segmented bar with distinct completed, current, and upcoming states. */
export function OnboardingSegmentsIndicator({
  steps,
  index,
  labelMode = "all",
  transition,
  onStepClick,
}: {
  steps: OnboardingStepperStep[];
  index: number;
  labelMode?: OnboardingLabelMode;
  transition: ReturnType<typeof getOnboardingTransition>;
  onStepClick?: (targetIndex: number) => void;
}) {
  return (
    <div data-progress-style="segments" className="w-full">
      <div className="flex h-5 items-center gap-2">
        {steps.map((step, stepIndex) => {
          const state = getOnboardingStepState(stepIndex, index);
          const isClickable = onStepClick && stepIndex <= index;

          return (
            <button
              type="button"
              key={step.id}
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(stepIndex)}
              data-step-state={state}
              aria-label={`Step ${stepIndex + 1}: ${step.label}`}
              className={`h-2 flex-1 overflow-hidden rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isClickable ? "cursor-pointer" : "cursor-default"
              } ${
                state === "current"
                  ? "bg-muted ring-2 ring-primary/30 ring-offset-1 ring-offset-card"
                  : "bg-muted/80"
              }`}
            >
              <motion.span
                initial={false}
                animate={{ scaleX: state === "upcoming" ? 0 : 1 }}
                transition={transition}
                className={`block h-full origin-left rounded-full ${
                  state === "completed" ? "bg-primary/70" : "bg-primary"
                }`}
              />
            </button>
          );
        })}
      </div>
      <OnboardingStepLabels steps={steps} index={index} mode={labelMode} />
    </div>
  );
}

/** Props for the shared onboarding stepper. */
export type OnboardingStepperProps = {
  steps: OnboardingStepperStep[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number, direction: OnboardingDirection) => void;
  showPercentage?: boolean;
  complete?: boolean;
  completion?: ReactNode;
  onComplete?: () => void;
  onSkip?: () => void;
  progressStyle?: OnboardingProgressStyle;
  labelMode?: OnboardingLabelMode;
  motionConfig?: Partial<OnboardingMotion>;
  progressLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  skipLabel?: string;
  className?: string;
};

/** Full container OnboardingStepper component */
export function OnboardingStepper({
  steps,
  index,
  defaultIndex = 0,
  onIndexChange,
  showPercentage = false,
  progressStyle = "segments",
  labelMode = "all",
  motionConfig,
  progressLabel = "Onboarding progress",
  className = "",
}: OnboardingStepperProps) {
  const [internalIndex, setInternalIndex] = useState(() =>
    clampOnboardingIndex(defaultIndex, steps.length),
  );
  const current = clampOnboardingIndex(index ?? internalIndex, steps.length);
  const reduced = useReducedMotion() === true;
  const config = { ...DEFAULT_ONBOARDING_MOTION, ...motionConfig };
  const transition = getOnboardingTransition(reduced, config);

  const goTo = useCallback(
    (target: number) => {
      const next = clampOnboardingIndex(target, steps.length);
      if (next === current) return;
      const nextDirection: OnboardingDirection = next > current ? 1 : -1;
      if (index === undefined) setInternalIndex(next);
      onIndexChange?.(next, nextDirection);
    },
    [current, index, onIndexChange, steps.length],
  );

  return (
    <div className={`w-full ${className}`} aria-label={progressLabel}>
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
        <span className="text-foreground">
          Step {current + 1} of {steps.length}
        </span>
        {showPercentage && (
          <span className="tabular-nums font-bold text-primary">
            {Math.round(((current + 1) / steps.length) * 100)}%
          </span>
        )}
      </div>

      <OnboardingSegmentsIndicator
        steps={steps}
        index={current}
        labelMode={labelMode}
        transition={transition}
        onStepClick={goTo}
      />
    </div>
  );
}
