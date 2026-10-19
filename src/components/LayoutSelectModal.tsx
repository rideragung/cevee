import React, { useState, useEffect } from 'react';
import { Check, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { ResumeLayoutId } from '../types/resume';
import { RESUME_LAYOUTS, LayoutDefinition } from '../data/layouts';
import { DEFAULT_LAYOUT_ID, normalizeLayoutId } from '../layouts/registry';
import { ResumeMiniPreview } from './ResumeMiniPreview';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface LayoutSelectModalProps {
  isOpen: boolean;
  mode: 'create' | 'switch';
  currentLayoutId?: string;
  onConfirm: (layoutId: ResumeLayoutId) => void;
  onClose: () => void;
}

export const LayoutSelectModal: React.FC<LayoutSelectModalProps> = ({
  isOpen,
  mode,
  currentLayoutId = DEFAULT_LAYOUT_ID,
  onConfirm,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<ResumeLayoutId>(normalizeLayoutId(currentLayoutId));

  useEffect(() => {
    if (isOpen) {
      setSelectedId(normalizeLayoutId(currentLayoutId));
    }
  }, [isOpen, currentLayoutId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden no-print">
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-start gap-3 p-5 sm:p-6 border-b border-border space-y-0 text-left">
          <div className="p-2.5 bg-accent text-accent-foreground rounded-xl border border-border flex-shrink-0 mt-0.5">
            <LayoutTemplate className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight">
              {mode === 'create' ? 'Choose a resume layout' : 'Change resume layout'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {mode === 'create'
                ? 'Select a layout to start. You can switch layouts later.'
                : 'Select a layout for this resume. Your content stays the same.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Modal Body: Layout Options */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <RadioGroup
            value={selectedId}
            onValueChange={(value) => setSelectedId(normalizeLayoutId(value))}
            aria-label="Resume layout"
            className="grid grid-cols-1 gap-3.5"
          >
            {RESUME_LAYOUTS.map((layout: LayoutDefinition) => {
              const isSelected = selectedId === layout.id;

              return (
                <div
                  key={layout.id}
                  className={cn(
                    'relative flex cursor-pointer flex-col items-start gap-4 rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150 focus-within:ring-2 focus-within:ring-primary/30 sm:flex-row sm:gap-5 sm:p-5',
                    isSelected
                      ? 'border-primary bg-accent/40 shadow-xs'
                      : 'border-border [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:bg-muted/40'
                  )}
                >
                  <RadioGroupItem
                    value={layout.id}
                    aria-label={layout.name}
                    className="absolute inset-0 z-10 size-full cursor-pointer rounded-xl opacity-0"
                  />

                  {/* High-Fidelity Vector Document Preview */}
                  <ResumeMiniPreview
                    layoutId={layout.id}
                    className="pointer-events-none w-full flex-shrink-0 sm:w-36"
                  />

                  {/* Layout Metadata & Content */}
                  <div className="pointer-events-none min-w-0 flex-1 pr-8 sm:pr-6">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                        {layout.name}
                      </h3>
                      <Badge variant="secondary" className="px-2 py-0 text-[10px] font-medium">
                        {layout.badge}
                      </Badge>
                    </div>

                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                      {layout.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-1.5">
                      {layout.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-[11px] font-medium text-foreground"
                        >
                          <CheckCircle2 className="size-3.5 flex-shrink-0 text-muted-foreground" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selection indicator */}
                  <div className="pointer-events-none absolute right-4 top-4 sm:right-5 sm:top-5">
                    <div
                      className={cn(
                        'flex size-5 items-center justify-center rounded-full border transition-colors duration-150',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                          : 'border-border bg-card'
                      )}
                    >
                      {isSelected && <Check className="size-3" strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {/* Modal Footer */}
          <div className="pt-4 mt-4 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-muted-foreground">
              Exports as an ATS-friendly PDF.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="flex-1 sm:flex-initial"
              >
                {mode === 'create' ? 'Create resume' : 'Apply layout'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

