import React, { useEffect, useMemo, useRef } from 'react';

export interface StudioDonutDatum<K extends string = string> {
  key: K;
  label: string;
  value: number;
  color: string;
}

interface StudioDonutChartProps<K extends string = string> {
  data: StudioDonutDatum<K>[];
  total: number;
  defaultLabel?: string;
  size?: number;
  activeKey?: K | null;
  hoveredKey?: K | null;
  onHoverChange?: (key: K | null) => void;
  onSelect?: (key: K) => void;
  ariaLabel?: string;
}

interface SliceRange<K extends string> {
  key: K;
  label: string;
  value: number;
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

interface PixelCell {
  cx: number;
  cy: number;
  r: number;
  angle: number; // [0, 2*PI) clockwise from 12 o'clock
  alphaFactor: number; // subtle deterministic texture per pixel (0.72..1.0)
}

/** Deterministic hash in [0, 1) for subtle Bakai Lab / Studio Plan Donut pixel texture */
const hashCell = (gx: number, gy: number): number => {
  const n = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

/** Resolve CSS variable colors like var(--primary) into computed RGB/OKLCH for canvas fillStyle */
const resolveCanvasColor = (color: string, el: HTMLElement | null): string => {
  if (!color.startsWith('var(') || !el) return color;
  const varName = color.slice(4, -1).trim();
  const resolved = getComputedStyle(el).getPropertyValue(varName).trim();
  return resolved || '#1E66FF';
};

/**
 * Pixelated / dot-matrix Canvas Donut Chart matching Pillow Light's
 * "Studio Plan Donut" (Bakai Lab): crisp orthogonal square mosaic cells
 * clipped to annular slices with angular gaps, subtle pixel texture,
 * and smooth hover/selection highlight.
 */
export function StudioDonutChart<K extends string = string>({
  data,
  total,
  defaultLabel = 'Total',
  size = 112,
  activeKey = null,
  hoveredKey = null,
  onHoverChange,
  onSelect,
  ariaLabel,
}: StudioDonutChartProps<K>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const focusedKey = hoveredKey ?? activeKey ?? null;

  const center = size / 2;
  const outerRadius = size * 0.455;
  const innerRadius = size * 0.275;
  const cellStep = 4.4; // grid pitch in CSS px
  const dotSize = 3.1; // crisp square pixel size in CSS px
  const padAngle = 0.065; // clean angular separator between slices

  // Compute slice angular ranges (clockwise from 12 o'clock: 0..2*PI)
  const slices = useMemo<SliceRange<K>[]>(() => {
    const nonZero = data.filter((d) => d.value > 0);
    if (total <= 0 || nonZero.length === 0) return [];

    let cursor = 0;
    const effectivePad = nonZero.length > 1 ? padAngle : 0;

    return nonZero.map((item) => {
      const span = (item.value / total) * Math.PI * 2;
      const startAngle = cursor + effectivePad / 2;
      const endAngle = cursor + span - effectivePad / 2;
      cursor += span;

      return {
        ...item,
        startAngle,
        endAngle: Math.max(startAngle, endAngle),
        midAngle: (startAngle + endAngle) / 2,
      };
    });
  }, [data, total]);

  // Precompute orthogonal pixel grid inside the annulus
  const gridCells = useMemo<PixelCell[]>(() => {
    const cells: PixelCell[] = [];
    const halfCount = Math.ceil(outerRadius / cellStep) + 1;

    for (let gy = -halfCount; gy <= halfCount; gy += 1) {
      for (let gx = -halfCount; gx <= halfCount; gx += 1) {
        const dx = gx * cellStep;
        const dy = gy * cellStep;
        const r = Math.hypot(dx, dy);

        if (r < innerRadius || r > outerRadius) continue;

        // Angle clockwise from 12 o'clock in [0, 2*PI)
        let angle = Math.atan2(dx, -dy);
        if (angle < 0) angle += Math.PI * 2;

        // Subtle organic opacity texture matching Studio Plan Donut mosaic
        const h = hashCell(gx, gy);
        const edgeDist = Math.min(r - innerRadius, outerRadius - r);
        const isEdge = edgeDist < cellStep * 0.55;
        const alphaFactor = isEdge ? 0.65 + h * 0.3 : 0.78 + h * 0.22;

        cells.push({
          cx: center + dx,
          cy: center + dy,
          r,
          angle,
          alphaFactor,
        });
      }
    }

    return cells;
  }, [center, innerRadius, outerRadius, cellStep]);

  // Draw the HiDPI pixelated donut on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const halfDot = dotSize / 2;

    // Empty state: muted pixel ring
    if (slices.length === 0) {
      const mutedColor = resolveCanvasColor('var(--muted-foreground)', canvas);
      ctx.fillStyle = mutedColor;
      for (const cell of gridCells) {
        ctx.globalAlpha = 0.16 * cell.alphaFactor;
        ctx.fillRect(
          cell.cx - halfDot,
          cell.cy - halfDot,
          dotSize,
          dotSize
        );
      }
      ctx.globalAlpha = 1;
      return;
    }

    // Resolve slice colors once per render
    const resolvedSlices = slices.map((slice) => ({
      ...slice,
      resolvedColor: resolveCanvasColor(slice.color, canvas),
    }));

    for (const cell of gridCells) {
      // Find which slice owns this pixel
      const owner = resolvedSlices.find(
        (s) => cell.angle >= s.startAngle && cell.angle <= s.endAngle
      );
      if (!owner) continue;

      const isHighlighted = focusedKey === owner.key;
      const isDimmed = Boolean(focusedKey && !isHighlighted);

      // Gentle outward pop offset for highlighted slice
      const popDist = isHighlighted ? 1.8 : 0;
      const ox = popDist ? Math.sin(owner.midAngle) * popDist : 0;
      const oy = popDist ? -Math.cos(owner.midAngle) * popDist : 0;

      ctx.fillStyle = owner.resolvedColor;
      ctx.globalAlpha = isDimmed
        ? 0.2 * cell.alphaFactor
        : isHighlighted
        ? Math.min(1, cell.alphaFactor + 0.12)
        : cell.alphaFactor;

      ctx.fillRect(
        cell.cx + ox - halfDot,
        cell.cy + oy - halfDot,
        dotSize,
        dotSize
      );
    }

    ctx.globalAlpha = 1;
  }, [size, slices, gridCells, focusedKey, dotSize]);

  // Pointer hit-testing against slice angular ranges
  const findSliceAtPointer = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): K | null => {
    const canvas = canvasRef.current;
    if (!canvas || slices.length === 0) return null;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - center;
    const y = event.clientY - rect.top - center;
    const r = Math.hypot(x, y);

    if (r < innerRadius - 3 || r > outerRadius + 4) return null;

    let angle = Math.atan2(x, -y);
    if (angle < 0) angle += Math.PI * 2;

    const hit = slices.find((s) => angle >= s.startAngle && angle <= s.endAngle);
    return hit ? hit.key : null;
  };

  const focusedItem = focusedKey
    ? data.find((d) => d.key === focusedKey) ?? null
    : null;

  return (
    <div
      className="relative grid shrink-0 select-none"
      style={{
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        width: size,
        height: size,
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel || `${defaultLabel}: ${total}`}
        style={{ width: size, height: size, gridArea: '1 / 1' }}
        onMouseMove={(e) => {
          const hit = findSliceAtPointer(e);
          if (hit !== hoveredKey) {
            onHoverChange?.(hit);
          }
        }}
        onMouseLeave={() => onHoverChange?.(null)}
        onClick={(e) => {
          const hit = findSliceAtPointer(e);
          if (hit) onSelect?.(hit);
        }}
        className="cursor-pointer block"
      />

      {/* Center Readout */}
      <div
        className="pointer-events-none flex flex-col items-center justify-center text-center"
        style={{ gridArea: '1 / 1' }}
      >
        <span className="text-[17px] font-bold leading-none tracking-tight text-foreground tabular-nums">
          {focusedItem ? focusedItem.value : total}
        </span>
        <span className="mt-0.5 max-w-[54px] truncate text-[9px] font-medium leading-tight text-muted-foreground">
          {focusedItem ? focusedItem.label : defaultLabel}
        </span>
      </div>
    </div>
  );
}
