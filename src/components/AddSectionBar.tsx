import React, { useState } from 'react';
import { IconPlus as Plus, IconCheck as Check, IconX as X } from '@tabler/icons-react';
import {
  ResumeLanguage,
  ResumeSection,
  ResumeSectionPresetKey,
  SectionType,
} from '../types/resume';
import {
  SECTION_PRESET_TITLES,
  detectSectionPresetKey,
  normalizeResumeLanguage,
} from '../utils/resumeLocale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddSectionBarProps {
  onAddSection: (
    title: string,
    type: SectionType,
    presetKey?: ResumeSectionPresetKey
  ) => void;
  existingSections: Pick<ResumeSection, 'title' | 'type' | 'presetKey'>[];
  resumeLanguage?: ResumeLanguage;
}

const PRESET_OPTIONS: {
  label: string;
  presetKey: Exclude<ResumeSectionPresetKey, 'custom'>;
  type: SectionType;
}[] = [
  { label: 'Certifications', presetKey: 'certifications', type: 'custom_list' },
  { label: 'Languages', presetKey: 'languages', type: 'custom_list' },
  { label: 'Publications', presetKey: 'publications', type: 'custom_list' },
  { label: 'Awards', presetKey: 'awards', type: 'custom_list' },
  {
    label: 'Organizational & Volunteering Experience',
    presetKey: 'volunteering',
    type: 'experience',
  },
  { label: 'References', presetKey: 'references', type: 'custom_list' },
];

export const AddSectionBar: React.FC<AddSectionBarProps> = ({
  onAddSection,
  existingSections,
  resumeLanguage = 'en',
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const lang = normalizeResumeLanguage(resumeLanguage);

  const existingPresetKeys = new Set(existingSections.map((s) => detectSectionPresetKey(s)));
  const existingTitlesUpper = new Set(
    existingSections.map((s) => s.title.trim().toUpperCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle.trim()) {
      onAddSection(customTitle.trim().toUpperCase(), 'custom_list', 'custom');
      setCustomTitle('');
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="mt-4 pt-2.5 border-t border-border no-print" data-editor-control="true">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PRESET_OPTIONS.map((opt) => {
          const localizedTitle = SECTION_PRESET_TITLES[opt.presetKey][lang];
          if (
            existingPresetKeys.has(opt.presetKey) ||
            existingTitlesUpper.has(localizedTitle.toUpperCase())
          ) {
            return null;
          }

          return (
            <Button
              key={opt.presetKey}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddSection(localizedTitle, opt.type, opt.presetKey)}
              className="h-7 gap-1.5 rounded-lg px-3 text-xs font-medium shadow-2xs"
            >
              <Plus className="size-3 text-muted-foreground" />
              <span>Add {opt.label}</span>
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
