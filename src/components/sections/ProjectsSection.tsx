import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { ProjectItem } from '../../types/resume';
import { IconPlus as Plus, IconTrash as Trash2, IconExternalLink as ExternalLink } from '@tabler/icons-react';
import { RichTextEditor } from '../RichTextEditor';
import { DatePicker } from '../DatePicker';
import { sortByPeriodDesc } from '../../utils/periodSort';
import { sanitizeHtml } from '../../utils/sanitize';

interface ProjectsSectionProps {
  title: string;
  isPlaceholder?: boolean;
  data: { items: ProjectItem[] };
  onRename: (title: string) => void;
  onUpdateData: (data: { items: ProjectItem[] }, isPlaceholder?: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const normalizeProjItem = (it: ProjectItem): ProjectItem => {
  let startDate = it.startDate || '';
  let endDate = it.endDate || '';
  if (!startDate && !endDate && it.period) {
    if (it.period.includes(' - ')) {
      const parts = it.period.split(' - ');
      startDate = parts[0]?.trim() || '';
      endDate = parts[1]?.trim() || '';
    } else {
      endDate = it.period.trim();
    }
  }
  return {
    ...it,
    startDate,
    endDate,
  };
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
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
  const [items, setItems] = useState<ProjectItem[]>(() =>
    sortByPeriodDesc((data.items || []).map(normalizeProjItem))
  );

  const handleSave = () => {
    const updated = items.map((it) => {
      const period = it.startDate && it.endDate
        ? `${it.startDate} - ${it.endDate}`
        : (it.startDate || it.endDate || it.period || '');
      return {
        ...it,
        period,
      };
    });
    const hasContent = updated.some((it) => it.name.trim() || (it.bullets && it.bullets !== '<p></p>'));
    onUpdateData({ items: updated }, hasContent ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(sortByPeriodDesc((data.items || []).map(normalizeProjItem)));
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      url: '',
      period: '',
      startDate: '',
      endDate: '',
      bullets: '<ul><li>Describe project goals, technical highlights, and key results...</li></ul>',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateField = (id: string, field: keyof ProjectItem, value: string) => {
    setItems(
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  return (
    <section className="mb-1.5">
      {!isEditing && (
        <SectionHeader
          title={title}
          onRename={onRename}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onToggleEdit={() => {
            setItems(sortByPeriodDesc((data.items || []).map(normalizeProjItem)));
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

          {/* List of Project Items */}
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={item.id} className="space-y-3.5">
                {/* Row 1: Project Name & Trash */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      Project name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                      aria-label="Project name"
                      placeholder="e.g. Proaksi Internship Services"
                      className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="mt-5 rounded-lg border border-border p-1.5 text-destructive transition hover:bg-destructive/10"
                    title="Delete project"
                    aria-label="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Row 2: URL, Start Date, End Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      Project link <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={item.url || ''}
                      onChange={(e) => handleUpdateField(item.id, 'url', e.target.value)}
                      aria-label="Project link"
                      placeholder="https://..."
                      className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      Start date
                    </label>
                    <DatePicker
                      value={item.startDate || ''}
                      onChange={(val) => {
                        const end = item.endDate || '';
                        const period = val && end ? `${val} - ${end}` : (val || end || '');
                        setItems(items.map((it) => it.id === item.id ? { ...it, startDate: val, period } : it));
                      }}
                      ariaLabel="Project start date"
                      placeholder="Select start date"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      End date <span className="text-destructive">*</span>
                    </label>
                    <DatePicker
                      value={item.endDate || ''}
                      onChange={(val) => {
                        const start = item.startDate || '';
                        const period = start && val ? `${start} - ${val}` : (val || start || '');
                        setItems(items.map((it) => it.id === item.id ? { ...it, endDate: val, period } : it));
                      }}
                      ariaLabel="Project end date"
                      placeholder="Select end date"
                    />
                  </div>
                </div>

                {/* Row 3: Descriptions Rich Text */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-foreground">
                    Project description <span className="text-destructive">*</span>
                  </label>
                  <RichTextEditor
                    initialContent={item.bullets}
                    onChange={(newHtml) => handleUpdateField(item.id, 'bullets', newHtml)}
                    hideActions={true}
                    ariaLabel="Project description"
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
              <span>Add project</span>
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
            setItems(data.items.length > 0 && !isPlaceholder ? sortByPeriodDesc((data.items || []).map(normalizeProjItem)) : [{ id: `proj-${Date.now()}`, name: '', url: '', period: '', bullets: '', startDate: '', endDate: '' }]);
            setIsEditing(true);
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          className="cursor-pointer space-y-2 hover:bg-accent/50 p-1 -m-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          title={`Click to edit ${title}`}
          aria-label={`Edit ${title}`}
        >
          {isPlaceholder ? (
            <div className="avoid-break text-slate-400 select-none">
              <div className="flex justify-between items-baseline leading-snug">
                <span className="font-bold text-slate-400">
                  Project Name (<span className="underline">project link</span>)
                </span>
                <span className="text-[7.75pt] font-semibold text-slate-400">May 2022 - Present</span>
              </div>
              <div className="text-slate-400 text-justify mt-0.5 text-[7.75pt] leading-[1.48]">
                State your tasks and accomplishments including name of the project and position of responsibility held.
              </div>
            </div>
          ) : (
            sortByPeriodDesc(data.items || []).map((item) => (
              <div key={item.id} className="avoid-break">
              {/* Line 1: Name + Link icon & Period */}
              <div className="flex justify-between items-baseline leading-snug">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-slate-900 hover:text-blue-700 inline-flex items-center gap-1 group/link"
                    title={item.url}
                  >
                    <span className="group-hover/link:underline">{item.name}</span>
                    <ExternalLink size={12} className="inline opacity-80 group-hover/link:opacity-100 flex-shrink-0 text-slate-700" />
                  </a>
                ) : (
                  <span className="font-bold text-slate-900">{item.name}</span>
                )}
                <span className="text-[7.75pt] font-semibold text-slate-800">{item.period}</span>
              </div>

                {/* Bullet Points */}
                <div
                  className="text-slate-800 text-justify mt-0.5 text-[7.75pt] leading-[1.48]"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.bullets) }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
