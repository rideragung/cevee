import React, { useState } from 'react';
import { ResumeLayoutId } from '../types/resume';
import { RESUME_LAYOUTS, LayoutDefinition } from '../data/layouts';
import { normalizeLayoutId } from '../layouts/registry';
import { LayoutThumbnail } from './LayoutThumbnail';
import { IconTemplate as LayoutTemplate } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface LayoutSidebarProps {
  activeLayoutId: ResumeLayoutId | string;
  onSelectLayout: (layoutId: ResumeLayoutId) => void;
}

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  activeLayoutId,
  onSelectLayout,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Left Sidebar Container */}
      <aside className="no-print hidden lg:flex flex-col w-56 xl:w-64 bg-card border-r border-border flex-shrink-0 sticky top-0 h-screen z-30">
        <div className="h-14 border-b border-border flex items-center gap-2 px-4 flex-shrink-0">
          <LayoutTemplate className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Layouts</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4">
          {RESUME_LAYOUTS.map((layout: LayoutDefinition) => {
            const isActive = normalizeLayoutId(activeLayoutId) === layout.id;

            return (
              <LayoutThumbnail
                key={layout.id}
                layoutId={layout.id}
                isActive={isActive}
                onClick={() => onSelectLayout(layout.id)}
                title={layout.name}
              />
            );
          })}
        </div>
      </aside>

      {/* Mobile & Tablet Floating Left Rail Trigger */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <div className="no-print fixed left-2.5 top-20 z-30 lg:hidden">
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-10 rounded-xl border border-border bg-card/95 shadow-md backdrop-blur-md"
              title="Change layout"
              aria-label="Change layout"
            >
              <LayoutTemplate className="size-4" />
            </Button>
          </SheetTrigger>
        </div>

        <SheetContent
          side="left"
          className="no-print flex w-64 max-w-[80vw] flex-col gap-0 border-r border-border bg-card p-0 lg:hidden"
        >
          <SheetHeader className="flex h-14 flex-row items-center gap-2 space-y-0 border-b border-border px-4 pr-12">
            <LayoutTemplate className="size-4 text-muted-foreground" />
            <SheetTitle className="text-xs font-semibold">Layouts</SheetTitle>
            <SheetDescription className="sr-only">
              Choose a resume layout
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto p-4">
            {RESUME_LAYOUTS.map((layout: LayoutDefinition) => {
              const isActive = normalizeLayoutId(activeLayoutId) === layout.id;

              return (
                <LayoutThumbnail
                  key={layout.id}
                  layoutId={layout.id}
                  isActive={isActive}
                  onClick={() => {
                    onSelectLayout(layout.id);
                    setIsMobileOpen(false);
                  }}
                  title={layout.name}
                />
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
