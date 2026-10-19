import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ResumeDocument } from '../types/resume';
import { getLayoutPlugin } from '../layouts/registry';
import { runPagination } from '../layouts/core/packing';
import type { ContentBlock } from '../layouts/core/types';

interface ResumeContentThumbnailProps {
  resume: ResumeDocument;
  className?: string;
}

const ResumeContentThumbnailInner: React.FC<ResumeContentThumbnailProps> = ({
  resume,
  className = '',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number> | null>(null);

  const plugin = useMemo(() => getLayoutPlugin(resume.layoutId), [resume.layoutId]);
  const { geometry } = plugin;
  const { header, sections } = resume.content;

  // Render the real document blocks (same pipeline as the A4 preview/print).
  const blocks: ContentBlock[] = useMemo(
    () => plugin.buildBlocks(resume),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plugin, header, sections],
  );

  // Pack exactly like PaginatedResumeView (estimates first, then real DOM
  // heights), then keep only page 1: the thumbnail previews page one of the
  // rendered document, never a squeezed stream of every block.
  const pageOneBlocks = useMemo(
    () => runPagination(blocks, measuredHeights ?? undefined, geometry.maxPageHeightPx)[0] ?? [],
    [blocks, measuredHeights, geometry],
  );

  // Mirror PaginatedResumeView's real DOM measurement so the page-1 boundary
  // matches the visible preview instead of relying on block height estimates.
  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      const container = measureRef.current;
      if (!container || cancelled) return;
      const heights: Record<string, number> = {};
      const nodes = container.children;
      let hasPositiveHeights = false;
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i] as HTMLElement;
        const id = el.getAttribute('data-measure-id');
        if (!id) continue;
        let h = el.getBoundingClientRect().height;
        if (el.firstElementChild) {
          const comp = window.getComputedStyle(el.firstElementChild);
          const mt = parseFloat(comp.marginTop) || 0;
          const mb = parseFloat(comp.marginBottom) || 0;
          const childRect = el.firstElementChild.getBoundingClientRect();
          h = Math.max(h, childRect.height + mt + mb);
        }
        if (h > 0) {
          heights[id] = geometry.roundMeasuredHeight(h);
          hasPositiveHeights = true;
        }
      }
      if (hasPositiveHeights) setMeasuredHeights(heights);
    };

    measure();
    // Web fonts swap in after layout: re-measure once they are ready, the
    // same way PaginatedResumeView corrects its initial estimate pass.
    document.fonts.ready.then(() => measure());
    return () => {
      cancelled = true;
    };
  }, [blocks, geometry]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const sheet = sheetRef.current;
    if (!wrap || !sheet) return;

    const update = () => {
      if (sheet.offsetWidth > 0) setScale(wrap.clientWidth / sheet.offsetWidth);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`relative aspect-[210/297] overflow-hidden rounded-lg border border-border bg-white select-none pointer-events-none ${className}`}
    >
      <div
        ref={(node) => {
          sheetRef.current = node;
          // React 18 has no built-in `inert` prop: keep links inside the
          // decorative thumbnail out of the tab order and a11y tree.
          if (node) node.setAttribute('inert', '');
        }}
        data-layout={plugin.id}
        className="a4-page-sheet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          margin: 0,
          padding: geometry.sheetPadding,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          className={`w-full h-full flex flex-col justify-start${geometry.pageContentClassName || ''}`}
        >
          {pageOneBlocks.map((block) => (
            <React.Fragment key={block.id}>{block.render()}</React.Fragment>
          ))}
        </div>
      </div>

      {/* Hidden 1:1 measure container: same pattern as PaginatedResumeView */}
      <div
        ref={measureRef}
        data-layout={plugin.id}
        className="a4-measure-container no-print"
        style={{
          position: 'absolute',
          top: -99999,
          left: -99999,
          width: geometry.contentWidth,
          visibility: 'hidden',
          pointerEvents: 'none',
          boxSizing: 'border-box',
          fontFamily: geometry.fontFamily,
          fontSize: geometry.fontSize,
          lineHeight: geometry.lineHeight,
          color: geometry.color,
          zIndex: -999,
        }}
      >
        {blocks.map((b) => (
          <div key={b.id} data-measure-id={b.id} style={{ display: 'flow-root' }}>
            {b.render()}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResumeContentThumbnail = React.memo(ResumeContentThumbnailInner);
