import React, { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { SectionType } from '../types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddSectionBarProps {
  onAddSection: (title: string, type: SectionType) => void;
  existingTitles: string[];
}

export const AddSectionBar: React.FC<AddSectionBarProps> = ({
  onAddSection,
  existingTitles,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const presetOptions: { title: string; type: SectionType }[] = [
    { title: 'CERTIFICATIONS', type: 'custom_list' },
    { title: 'LANGUAGES', type: 'custom_list' },
    { title: 'PUBLICATIONS', type: 'custom_list' },
    { title: 'AWARDS', type: 'custom_list' },
    { title: 'ORGANIZATIONAL & VOLUNTEERING EXPERIENCE', type: 'experience' },
    { title: 'REFERENCES', type: 'custom_list' },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle.trim()) {
      onAddSection(customTitle.trim().toUpperCase(), 'custom_list');
      setCustomTitle('');
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="mt-4 pt-2.5 border-t border-border no-print" data-editor-control="true">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {presetOptions.map((opt) => {
          if (existingTitles.includes(opt.title)) return null;

          return (
            <Button
              key={opt.title}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddSection(opt.title, opt.type)}
              className="h-7 gap-1.5 rounded-lg px-3 text-xs font-medium shadow-2xs"
            >
              <Plus className="size-3 text-muted-foreground" />
              <span>
                Add{' '}
                {opt.title
                  .toLowerCase()
                  .split(' ')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
              </span>
            </Button>
          );
        })}

        {/* Custom Section Button */}
        {!isCustomOpen ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsCustomOpen(true)}
            className="h-7 gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs"
          >
            <Plus className="size-3" />
            <span>Add custom section</span>
          </Button>
        ) : (
          <form
            onSubmit={handleCustomSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-card p-0.5 shadow-2xs"
          >
            <Input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Section title"
              autoFocus
              aria-label="Custom section title"
              className="h-7 w-44 rounded-md border-0 px-3 text-xs focus-visible:ring-0"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-6 rounded-md text-primary"
              title="Add section"
              aria-label="Add section"
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsCustomOpen(false)}
              className="size-6 rounded-md text-muted-foreground hover:text-foreground"
              title="Cancel"
              aria-label="Cancel"
            >
              <X className="size-3.5" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
