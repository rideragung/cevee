import React, { useEffect, useMemo, useRef } from 'react';

export interface StudioDonutDatum<K extends string = string> {
  key: K;
  label: string;
  value: number;
  /** Primary / start hex color for the slice */
  color: string;
  /** Optional end hex color for subtle per-slice gradient */
  colorEnd?: string;
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

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface SliceRange<K extends string> {
  key: K;
  label: string;
  value: number;
  color: string;
  colorEnd?: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

interface PixelCell {
  cx: number;
  cy: number;
  r: number;
  radialT: number; // 0 at innerRadius -> 1 at outerRadius
  angle: number; // [0, 2*PI) clockwise from 12 o'clock
  alphaFactor: number;
}

/** Deterministic hash in [0, 1) for subtle Bakai Lab / Studio Plan Donut pixel texture */
const hashCell = (gx: number, gy: number): number => {
  const n = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

const parseHexRgb = (hex: string): RGB | null => {
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return Number.isNaN(r) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return Number.isNaN(r) ? null : { r, g, b };
  }
  return null;
};

const lerpRgb = (a: RGB, b: RGB, t: number): string => {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(a.r + (b.r - a.r) * clamped);
  const g = Math.round(a.g + (b.g - a.g) * clamped);
  const bl = Math.round(a.b + (b.b - a.b) * clamped);
  return `rgb(${r}, ${g}, ${bl})`;
};

/** Resolve CSS variable colors like var(--primary) into computed color for canvas */
const resolveCanvasColor = (color: string, el: HTMLElement | null): string => {
  if (!color.startsWith('var(') || !el) return color;
  const varName = color.slice(4, -1).trim();
  const resolved = getComputedStyle(el).getPropertyValue(varName).trim();
  return resolved || '#1E66FF';
};

/**
 * Pixelated / dot-matrix Canvas Donut Chart matching Pillow Light's
 * "Studio Plan Donut" (Bakai Lab), enhanced with subtle per-slice gradients
 * while keeping legend bullets solid.
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
  const outerRadius = size * 0.46;
  const innerRadius = size * 0.295;
  const cellStep = 4.3;
  const dotSize = 3.0;
  const padAngle = 0.065;

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
    const ringThickness = Math.max(outerRadius - innerRadius, 1);

    for (let gy = -halfCount; gy <= halfCount; gy += 1) {
      for (let gx = -halfCount; gx <= halfCount; gx += 1) {
        const dx = gx * cellStep;
        const dy = gy * cellStep;
        const r = Math.hypot(dx, dy);

        if (r < innerRadius || r > outerRadius) continue;

        let angle = Math.atan2(dx, -dy);
        if (angle < 0) angle += Math.PI * 2;

        const h = hashCell(gx, gy);
        const edgeDist = Math.min(r - innerRadius, outerRadius - r);
        const isEdge = edgeDist < cellStep * 0.55;
        const alphaFactor = isEdge ? 0.68 + h * 0.28 : 0.82 + h * 0.18;

        cells.push({
          cx: center + dx,
          cy: center + dy,
          r,
          radialT: (r - innerRadius) / ringThickness,
          angle,
          alphaFactor,
        });
      }
    }

    return cells;
  }, [center, innerRadius, outerRadius, cellStep]);

  // Draw HiDPI pixelated donut with subtle per-slice angular + radial gradient
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

    if (slices.length === 0) {
      const mutedColor = resolveCanvasColor('var(--muted-foreground)', canvas);
      ctx.fillStyle = mutedColor;
      for (const cell of gridCells) {
        ctx.globalAlpha = 0.16 * cell.alphaFactor;
        ctx.fillRect(cell.cx - halfDot, cell.cy - halfDot, dotSize, dotSize);
      }
      ctx.globalAlpha = 1;
      return;
    }

    const resolvedSlices = slices.map((slice) => {
      const startCss = resolveCanvasColor(slice.color, canvas);
      const endCss = slice.colorEnd ? resolveCanvasColor(slice.colorEnd, canvas) : null;
      return {
        ...slice,
        startCss,
        startRgb: parseHexRgb(startCss),
        endRgb: endCss ? parseHexRgb(endCss) : null,
      };
    });

    for (const cell of gridCells) {
      const owner = resolvedSlices.find(
        (s) => cell.angle >= s.startAngle && cell.angle <= s.endAngle
      );
      if (!owner) continue;

      const isHighlighted = focusedKey === owner.key;
      const isDimmed = Boolean(focusedKey && !isHighlighted);

      const popDist = isHighlighted ? 1.8 : 0;
      const ox = popDist ? Math.sin(owner.midAngle) * popDist : 0;
      const oy = popDist ? -Math.cos(owner.midAngle) * popDist : 0;

      // Subtle blend of angular progression (65%) + radial depth (35%)
      if (owner.startRgb && owner.endRgb) {
        const span = Math.max(owner.endAngle - owner.startAngle, 0.001);
        const angleT = (cell.angle - owner.startAngle) / span;
        const gradT = angleT * 0.65 + (1 - cell.radialT) * 0.35;
        ctx.fillStyle = lerpRgb(owner.startRgb, owner.endRgb, gradT);
      } else {
        ctx.fillStyle = owner.startCss;
      }

      ctx.globalAlpha = isDimmed
        ? 0.2 * cell.alphaFactor
        : isHighlighted
        ? Math.min(1, cell.alphaFactor + 0.12)
        : cell.alphaFactor;

      ctx.fillRect(cell.cx + ox - halfDot, cell.cy + oy - halfDot, dotSize, dotSize);
    }

    ctx.globalAlpha = 1;
  }, [size, slices, gridCells, focusedKey, dotSize]);

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
        className="pointer-events-none flex flex-col items-center justify-center text-center px-2"
        style={{ gridArea: '1 / 1' }}
      >
        <span className="text-[17px] font-bold leading-none tracking-tight text-foreground tabular-nums">
          {focusedItem ? focusedItem.value : total}
        </span>
        <span className="mt-0.5 max-w-[64px] text-[9px] font-medium leading-[1.15] text-muted-foreground break-words">
          {focusedItem ? focusedItem.label : defaultLabel}
        </span>
      </div>
    </div>
  );
}
