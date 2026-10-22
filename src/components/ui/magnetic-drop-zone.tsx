"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

const MAGNETIC_SPRING = {
  type: "spring" as const,
  stiffness: 350,
  damping: 25,
  mass: 0.5,
};

export interface MagneticDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function MagneticDropZone({
  onFileSelect,
  accept = "application/pdf,.pdf",
  maxSizeBytes = 15 * 1024 * 1024,
  disabled = false,
  className = "",
  title = "Drop your PDF resume here",
  subtitle,
}: MagneticDropZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  const [isDragging, setIsDragging] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
  const displaySubtitle =
    subtitle ?? `or choose from your device · PDF up to ${maxMb} MB`;

  // Calculate magnetic pull toward pointer
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from center
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Magnetic pull clamp (up to 18px)
      const maxPull = 18;
      const pullX = Math.max(-maxPull, Math.min(maxPull, deltaX * 0.15));
      const pullY = Math.max(-maxPull, Math.min(maxPull, deltaY * 0.15));

      setMagneticOffset({ x: pullX, y: pullY });
    },
    [disabled, reducedMotion]
  );

  const resetMagneticOffset = useCallback(() => {
    setMagneticOffset({ x: 0, y: 0 });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    resetMagneticOffset();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    resetMagneticOffset();
    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload PDF resume by dragging or choosing from device"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMagneticOffset}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      initial={false}
      animate={{
        scale: isDragging && !reducedMotion ? 1.012 : 1,
      }}
      transition={MAGNETIC_SPRING}
      className={cn(
        "relative flex flex-col items-center justify-center py-10 px-6 sm:py-12 sm:px-8 rounded-[1.75rem] text-center cursor-pointer select-none",
        "border-[1.5px] border-dashed transition-all duration-200 outline-none bg-card",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isDragging
          ? "border-primary bg-primary/[0.04] ring-2 ring-primary/25 ring-offset-2 ring-offset-card shadow-sm"
          : "border-border/90 hover:border-primary/50 hover:bg-primary/[0.02]",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {/* Magnetic Floating Brand Squircle Puck */}
      <motion.div
        animate={{
          x: magneticOffset.x,
          y: magneticOffset.y,
          scale: isDragging && !reducedMotion ? 1.12 : 1,
        }}
        transition={MAGNETIC_SPRING}
        className={cn(
          "flex items-center justify-center size-14 sm:size-16 rounded-2xl mb-3.5 transition-all duration-200",
          isDragging
            ? "bg-primary text-primary-foreground border-transparent shadow-[0_8px_24px_-4px_rgba(30,102,255,0.35)]"
            : "bg-primary/10 text-primary border border-primary/20 shadow-xs"
        )}
      >
        <FileUp
          className={cn(
            "size-7 transition-colors duration-200",
            isDragging ? "text-primary-foreground" : "text-primary"
          )}
        />
      </motion.div>

      {/* Brand & Function Copy */}
      <div className="space-y-1 max-w-sm">
        <p className="text-sm sm:text-base font-bold text-foreground tracking-tight">
          {isDragging ? (
            <span className="text-primary font-bold">Release to drop PDF resume</span>
          ) : (
            <span>{title}</span>
          )}
        </p>
        <p className="text-xs sm:text-[13px] text-muted-foreground font-normal">
          {displaySubtitle}
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onFileSelect(selected);
        }}
      />
    </motion.div>
  );
}
