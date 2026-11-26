// SegmentedControl: animated radiogroup where an ink thumb slides between options and masks their labels.
// Pillow Light source, extended with a quiet tone and optional icon / accessible label slots so the
// workspace switcher keeps Cevee's product metadata without hand-rolling the control.
"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;

const SEG =
  "inline-flex items-center justify-center gap-1.5 px-3 py-[0.4375rem] text-center text-[0.8125rem] font-medium leading-[1.125rem] tracking-[-0.01em] whitespace-nowrap transition-colors";

export type SegmentedOption = {
  value: string;
  label: ReactNode;
  ariaLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  options: SegmentedOption[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  tone?: "solid" | "quiet" | "ink" | "bare";
  className?: string;
};

export function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  tone = "solid",
  className = "",
}: SegmentedControlProps) {
  const count = Math.max(1, options.length);
  const template = `repeat(${count}, minmax(0, 1fr))`;
  const quiet = tone === "quiet";
  const ink = tone === "ink";
  const bare = tone === "bare";

  const [internal, setInternal] = useState(
    () => defaultValue ?? options[0]?.value ?? "",
  );
  const [hovered, setHovered] = useState(-1);

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const found = options.findIndex((o) => o.value === current);
  const index = found < 0 ? 0 : found;

  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const emit = useRef(onValueChange);
  emit.current = onValueChange;

  const reduced = useReducedMotion();
  const pos = useMotionValue(index);
  const thumbX = useTransform(pos, (v) => `${v * 100}%`);
  const maskX = useTransform(pos, (v) => `${v * -100}%`);

  useEffect(() => {
    if (reduced) {
      pos.set(index);
      return;
    }
    const controls = animate(pos, index, CELL);
    return () => controls.stop();
  }, [index, reduced, pos]);

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      if (next !== current) emit.current?.(next);
    },
    [controlled, current],
  );

  const seek = useCallback(
    (from: number, dir: number) => {
      let i = from;
      for (let k = 0; k < count; k++) {
        i = (i + dir + count) % count;
        if (!options[i]?.disabled) return i;
      }
      return from;
    },
    [count, options],
  );

  const go = useCallback(
    (i: number) => {
      const option = options[i];
      if (!option || option.disabled) return;
      buttons.current[i]?.focus();
      select(option.value);
    },
    [options, select],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(seek(i, 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(seek(i, -1));
    } else if (e.key === "Home") {
      e.preventDefault();
      go(seek(count - 1, 1));
    } else if (e.key === "End") {
      e.preventDefault();
      go(seek(0, -1));
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`relative inline-block select-none rounded-lg ${
        bare
          ? "border-0 bg-transparent p-0"
          : ink
            ? "border border-border bg-muted p-1"
            : "border border-border bg-muted p-[0.1875rem]"
      } ${className}`}
    >
      <div
        className="relative grid"
        style={{ gridTemplateColumns: template, touchAction: "manipulation" }}
      >
        {options.map((option, i) => (
          <span
            key={option.value}
            aria-hidden
            className={`${SEG} pointer-events-none ${
              option.disabled
                ? "text-muted-foreground/70"
                : bare
                  ? hovered === i && i !== index
                    ? "rounded-full bg-accent text-accent-foreground"
                    : "rounded-full text-muted-foreground"
                  : ink
                    ? hovered === i && i !== index
                      ? "rounded-full bg-accent text-foreground"
                      : "rounded-full text-foreground/80"
                    : hovered === i && i !== index
                      ? "text-foreground"
                      : "text-muted-foreground"
            }`}
          >
            {option.icon && (
              <span className="inline-flex shrink-0 items-center">{option.icon}</span>
            )}
            <span>{option.label}</span>
          </span>
        ))}

        <motion.div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 overflow-hidden ${
            bare
              ? "rounded-full bg-primary shadow-sm"
              : ink
                ? "rounded-full bg-foreground shadow-sm"
                : quiet
                  ? "rounded-md border border-primary bg-primary/10 shadow-none"
                  : "rounded-md bg-primary shadow-sm"
          }`}
          style={{ width: `${100 / count}%`, x: thumbX }}
          initial={false}
        >
          <motion.div
            className="absolute inset-0"
            style={{ x: maskX }}
            initial={false}
          >
            <div
              className="absolute inset-y-0 left-0 grid"
              style={{ width: `${count * 100}%`, gridTemplateColumns: template }}
            >
              {options.map((option) => (
                <span
                  key={option.value}
                  className={`${SEG} ${
                    bare
                      ? "text-primary-foreground"
                      : ink
                        ? "text-background"
                        : quiet
                          ? "text-foreground"
                          : "text-primary-foreground"
                  }`}
                >
                  {option.icon && (
                    <span
                      className={`inline-flex shrink-0 items-center ${
                        bare
                          ? "text-primary-foreground"
                          : ink
                            ? "text-background"
                            : quiet
                              ? "text-primary"
                              : "text-primary-foreground"
                      }`}
                    >
                      {option.icon}
                    </span>
                  )}
                  <span>{option.label}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: template }}
          onPointerLeave={() => setHovered(-1)}
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-disabled={option.disabled || undefined}
              tabIndex={i === index ? 0 : -1}
              onClick={() => !option.disabled && select(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onPointerEnter={() => !option.disabled && setHovered(i)}
              className={`relative cursor-default outline-none after:absolute after:-inset-y-2 after:content-[''] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 ${
                bare || ink ? "rounded-full" : "rounded-md"
              }`}
            >
              <span className="sr-only">
                {option.ariaLabel ??
                  (typeof option.label === "string" ? option.label : option.value)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
