import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { ResumeDocument } from '../types/resume';
import { runPagination } from '../layouts/core/packing';
import { getLayoutPlugin } from '../layouts/registry';
import type { ContentBlock } from '../layouts/core/types';

interface PaginatedResumeViewProps {
  resume: ResumeDocument;
  scale?: number;
  showPageNumbers?: boolean;
}

export const PaginatedResumeView: React.FC<PaginatedResumeViewProps> = ({
  resume,
  scale = 1,
  showPageNumbers = true,
}) => {
  const { header, sections } = resume.content;
  const measureRef = useRef<HTMLDivElement>(null);
  const plugin = useMemo(() => getLayoutPlugin(resume.layoutId), [resume.layoutId]);
  const { geometry } = plugin;

  // Flatten into atomic blocks (header, section titles, cohesive items)
  const allBlocks: ContentBlock[] = useMemo(
    () => plugin.buildBlocks(resume),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plugin, header, sections]
  );

  // Initial deterministic pagination
  const [pages, setPages] = useState<ContentBlock[][]>(() =>
    runPagination(allBlocks, undefined, geometry.maxPageHeightPx)
  );

  // Dynamic real DOM measurement via useLayoutEffect (zero-flicker subpixel precision)
  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const heights: Record<string, number> = {};
    const nodes = measureRef.current.children;
    let hasPositiveHeights = false;

    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i] as HTMLElement;
      const id = el.getAttribute('data-measure-id');
      if (id) {
        const rect = el.getBoundingClientRect();
        let h = rect.height;

        // Ensure element top and bottom margins are accurately included
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
    }

    // Only update pages if we measured real, non-zero DOM heights!
    if (hasPositiveHeights) {
      const measuredPages = runPagination(allBlocks, heights, geometry.maxPageHeightPx);
      setPages(measuredPages);
    }
  }, [allBlocks, geometry]);

  return (
    <>
      {/* Hidden 1:1 A4 Measurement Container - ensures browser engine computes exact layout */}
      <div
        ref={measureRef}
        aria-hidden="true"
        data-a4-measure="true"
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
          fontSynthesis: 'none',
          zIndex: -999,
        }}
      >
        {allBlocks.map((b) => (
          <div key={b.id} data-measure-id={b.id} style={{ display: 'flow-root' }}>
            {b.render()}
          </div>
        ))}
      </div>

      {/* Visible Paginated Pages */}
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        className="transition-transform duration-100 ease-out flex flex-col items-center"
      >
        {pages.map((pageBlocks, pageIdx) => (
          <div
            key={pageIdx}
            data-layout={plugin.id}
            className="a4-page-sheet shadow-2xl relative border border-slate-300/80 bg-white overflow-hidden"
            style={{
              marginBottom: '48px',
              padding: geometry.sheetPadding,
            }}
          >
            {/* Page Content */}
            <div
              className={`w-full h-full flex flex-col justify-start${geometry.pageContentClassName || ''}`}
            >
              {pageBlocks.map((b) => (
                <React.Fragment key={b.id}>{b.render()}</React.Fragment>
              ))}
            </div>

            {/* Page Number Badge (only on screen preview, hidden in print) */}
            {showPageNumbers && (
              <div className="absolute bottom-2.5 right-4 text-[8pt] text-slate-400 font-mono select-none no-print">
                Page {pageIdx + 1} of {pages.length}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
