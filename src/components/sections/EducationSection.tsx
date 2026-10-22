import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { EducationItem } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';
import { DatePicker } from '../DatePicker';
import { RichTextEditor } from '../RichTextEditor';
import { sortByPeriodDesc } from '../../utils/periodSort';
import { sanitizeHtml } from '../../utils/sanitize';

interface EducationSectionProps {
  title: string;
  isPlaceholder?: boolean;
  data: { items: EducationItem[] };
  onRename: (title: string) => void;
  onUpdateData: (data: { items: EducationItem[] }, isPlaceholder?: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const normalizeEduItem = (it: EducationItem): EducationItem => {
  let startDate = it.startDate || '';
  let endDate = it.endDate || '';
  let current = it.current || false;
  if (!startDate && !endDate && it.period) {
    if (it.period.includes(' - ')) {
      const parts = it.period.split(' - ');
      startDate = parts[0]?.trim() || '';
      endDate = parts[1]?.trim() || '';
    } else {
      endDate = it.period.trim();
    }
  }
  if (!current && (endDate.toLowerCase() === 'present' || it.period?.toLowerCase().includes('present'))) {
    current = true;
  }
  return {
    ...it,
    startDate,
    endDate: current && endDate.toLowerCase() === 'present' ? '' : endDate,
    current,
  };
};

export const EducationSection: React.FC<EducationSectionProps> = ({
  title,
  isPlaceholder = false,
  data,
  onRename,
  onUpdateData,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst,
  isLast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState<EducationItem[]>(() =>
    sortByPeriodDesc((data.items || []).map(normalizeEduItem))
  );

  const computePeriod = (item: {
    startDate?: string;
    endDate?: string;
    current?: boolean;
    period?: string;
  }) => {
    if (item.current) {
      return item.startDate ? `${item.startDate} - Present` : 'Present';
    }
    if (item.startDate && item.endDate) {
      return `${item.startDate} - ${item.endDate}`;
    }
    return item.startDate || item.endDate || item.period || '';
  };

  const handleSave = () => {
    const updated = items.map((it) => {
      const period = computePeriod(it);
      return {
        ...it,
        period,
      };
    });
    const hasContent = updated.some((it) => it.degree.trim() || it.institution.trim());
    onUpdateData({ items: updated }, hasContent ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(sortByPeriodDesc((data.items || []).map(normalizeEduItem)));
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      period: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateField = <K extends keyof EducationItem>(
    id: string,
    field: K,
    value: EducationItem[K]
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        return {
          ...updated,
          period: computePeriod(updated),
        };
      })
    );
  };

  return (
    <section className="mb-1">
      {!isEditing && (
        <SectionHeader
          title={title}
          onRename={onRename}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onToggleEdit={() => {
            setItems(sortByPeriodDesc((data.items || []).map(normalizeEduItem)));
            setIsEditing(true);
          }}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}

      {isEditing ? (
        <div className="my-2.5 rounded-xl border border-border bg-muted/50 p-4 font-sans shadow-sm no-print sm:p-5">
          {/* Header Title */}
          <div className="mb-5 border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              {title}
            </h3>
          </div>

          {/* List of Education Items */}
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={item.id} className="space-y-3.5">
                {/* Row 1: Degree, GPA & Trash */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-semibold text-foreground">
                        Degree or major <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.degree}
                        onChange={(e) => handleUpdateField(item.id, 'degree', e.target.value)}
                        aria-label="Degree or major"
                        placeholder="e.g. Bachelor of Information Systems"
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-foreground">
                        GPA or grade <span className="font-normal text-muted-foreground">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={item.gpa || ''}
                        onChange={(e) => handleUpdateField(item.id, 'gpa', e.target.value)}
                        aria-label="GPA or grade"
                        placeholder="e.g. GPA: 4.0 of 4.0"
                        className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="mt-5 flex-shrink-0 rounded-lg border border-border p-1.5 text-destructive transition hover:bg-destructive/10"
                    title="Delete education"
                    aria-label="Delete education"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Currently studying checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-${item.id}`}
                    checked={item.current || false}
                    onChange={(e) => handleUpdateField(item.id, 'current', e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-input text-primary focus:ring-primary/30"
                  />
                  <label
                    htmlFor={`current-${item.id}`}
                    className="cursor-pointer select-none text-xs text-foreground"
                  >
                    I currently study here
                  </label>
                </div>

                {/* Row 2: Institution & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      Institution or school <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => handleUpdateField(item.id, 'institution', e.target.value)}
                      aria-label="Institution or school"
                      placeholder="e.g., State University / Institute of Technology"
                      className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      Start date
                    </label>
                    <DatePicker
                      value={item.startDate || ''}
                      onChange={(val) => handleUpdateField(item.id, 'startDate', val)}
                      ariaLabel="Education start date"
                      placeholder="Select start date"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      End date or graduation {!item.current && <span className="text-destructive">*</span>}
                    </label>
                    <DatePicker
                      value={item.current ? 'Present' : (item.endDate || '')}
                      disabled={item.current || false}
                      onChange={(val) => handleUpdateField(item.id, 'endDate', val)}
                      ariaLabel="Education end date or graduation"
                      placeholder="Select graduation date"
                    />
                  </div>
                </div>

                {/* Row 3: Description (full width, rich text) */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-foreground">
                    Description <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <RichTextEditor
                    initialContent={item.description || ''}
                    onChange={(newHtml) => handleUpdateField(item.id, 'description', newHtml)}
                    hideActions={true}
                    ariaLabel="Education description"
                  />
                </div>

                {/* Separator between items */}
                {idx < items.length - 1 && (
                  <div className="border-b border-border pt-3" />
                )}
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 rounded-lg border border-primary px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-accent"
            >
              <Plus size={13} />
              <span>Add education</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-semibold text-primary transition hover:text-primary/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-primary px-6 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setItems(data.items.length > 0 && !isPlaceholder ? sortByPeriodDesc((data.items || []).map(normalizeEduItem)) : [{ id: `edu-${Date.now()}`, degree: '', institution: '', period: '', gpa: '', startDate: '', endDate: '', current: false }]);
            setIsEditing(true);
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          className="cursor-pointer space-y-1.5 hover:bg-accent/50 p-1 -m-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          title={`Click to edit ${title}`}
          aria-label={`Edit ${title}`}
        >
          {isPlaceholder ? (
            <div className="avoid-break text-slate-400 select-none space-y-0.5">
              <div className="flex justify-between items-baseline leading-snug">
                <span className="font-bold text-slate-400">Bachelor of Computer Science</span>
                <span className="text-[7.75pt] font-semibold text-slate-400">May 2022 - Present</span>
              </div>
              <div className="flex justify-between items-baseline text-slate-400 leading-snug text-[8pt]">
                <span>Name of the Educational Institution</span>
                <span className="font-medium text-slate-400">GPA: 4.0 of 4.0</span>
              </div>
              <div className="text-slate-400 text-[7.75pt] leading-snug">
                E.g., info about scholarships, student activity, etc.
              </div>
            </div>
          ) : (
            sortByPeriodDesc(data.items || []).map((item) => (
              <div key={item.id} className="avoid-break">
                {/* Line 1: Degree & Period */}
                <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                  <span>{item.degree}</span>
                  <span className="text-[7.75pt] font-semibold text-slate-800">{item.period}</span>
                </div>

                {/* Line 2: Institution & GPA */}
                <div className="flex justify-between items-baseline text-slate-800 leading-snug text-[8pt]">
                  <span>{item.institution}</span>
                  {item.gpa && <span className="font-medium text-slate-800">{item.gpa}</span>}
                </div>

                {/* Line 3: Description */}
                {item.description && (
                  <div
                    className="text-slate-800 text-justify mt-0.5 text-[7.75pt] leading-[1.48]"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
