import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { ExperienceItem, ExperiencePosition } from '../../types/resume';
import { IconPlus as Plus, IconTrash as Trash2, IconTrendingUp as TrendingUp } from '@tabler/icons-react';
import { RichTextEditor } from '../RichTextEditor';
import { DatePicker } from '../DatePicker';
import { sortByPeriodDesc } from '../../utils/periodSort';
import { sanitizeHtml } from '../../utils/sanitize';

interface ExperienceSectionProps {
  title: string;
  isPlaceholder?: boolean;
  data: { items: ExperienceItem[] };
  onRename: (title: string) => void;
  onUpdateData: (data: { items: ExperienceItem[] }, isPlaceholder?: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const normalizeItem = (item: ExperienceItem): ExperienceItem => {
  if (item.positions && item.positions.length > 0) {
    return item;
  }
  return {
    ...item,
    positions: [
      {
        id: `pos-${item.id}-0`,
        role: item.role || '',
        period: item.period || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: item.current || false,
        bullets: item.bullets || '<ul><li>Describe your responsibilities and achievements...</li></ul>',
      },
    ],
  };
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
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
  const [items, setItems] = useState<ExperienceItem[]>(() =>
    sortByPeriodDesc((data.items || []).map(normalizeItem))
  );
  const isOrgVol = title.toUpperCase().includes('ORGANIZATIONAL') || title.toUpperCase().includes('VOLUNTEER');

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
      const positions = (it.positions || []).map((pos) => ({
        ...pos,
        period: computePeriod(pos),
      }));

      if (positions.length > 1) {
        return {
          ...it,
          role: positions[0].role,
          period: positions[0].period,
          startDate: positions[positions.length - 1].startDate || positions[0].startDate,
          endDate: positions[0].endDate,
          current: positions[0].current,
          bullets: positions[0].bullets,
          positions,
        };
      }

      const single = positions[0] || {
        role: it.role,
        period: computePeriod(it),
        startDate: it.startDate,
        endDate: it.endDate,
        current: it.current,
        bullets: it.bullets,
      };

      return {
        ...it,
        role: single.role,
        period: single.period,
        startDate: single.startDate,
        endDate: single.endDate,
        current: single.current,
        bullets: single.bullets,
        positions: undefined,
      };
    });

    const hasContent = updated.some(
      (it) =>
        it.company ||
        it.role ||
        (it.bullets && it.bullets !== '<p></p>') ||
        (it.positions && it.positions.some((p) => p.role || (p.bullets && p.bullets !== '<p></p>')))
    );

    onUpdateData({ items: updated }, hasContent ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(sortByPeriodDesc((data.items || []).map(normalizeItem)));
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const newId = `exp-${Date.now()}`;
    const newItem: ExperienceItem = {
      id: newId,
      role: '',
      company: '',
      location: '',
      period: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: '<ul><li>Describe your responsibilities and achievements...</li></ul>',
      positions: [
        {
          id: `pos-${newId}-0`,
          role: '',
          period: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: '<ul><li>Describe your responsibilities and achievements...</li></ul>',
        },
      ],
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateField = <K extends keyof ExperienceItem>(
    id: string,
    field: K,
    value: ExperienceItem[K]
  ) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handleAddPosition = (itemId: string) => {
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        const currentPositions = it.positions && it.positions.length > 0 ? it.positions : [
          {
            id: `pos-${it.id}-0`,
            role: it.role || '',
            period: it.period || '',
            startDate: it.startDate || '',
            endDate: it.endDate || '',
            current: it.current || false,
            bullets: it.bullets || '<ul><li>Describe your responsibilities and achievements...</li></ul>',
          },
        ];
        const newPos: ExperiencePosition = {
          id: `pos-${itemId}-${Date.now()}`,
          role: '',
          period: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: '<ul><li>Describe your responsibilities and achievements for this role...</li></ul>',
        };
        return {
          ...it,
          positions: [...currentPositions, newPos],
        };
      })
    );
  };

  const handleRemovePosition = (itemId: string, posId: string) => {
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        const currentPositions = it.positions || [];
        if (currentPositions.length <= 1) return it;
        return {
          ...it,
          positions: currentPositions.filter((p) => p.id !== posId),
        };
      })
    );
  };

  const handleUpdatePositionField = <K extends keyof ExperiencePosition>(
    itemId: string,
    posId: string,
    field: K,
    value: ExperiencePosition[K]
  ) => {
    setItems(
      items.map((it) => {
        if (it.id !== itemId) return it;
        const currentPositions = it.positions || [];
        return {
          ...it,
          positions: currentPositions.map((p) => (p.id === posId ? { ...p, [field]: value } : p)),
        };
      })
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
            setItems(sortByPeriodDesc((data.items || []).map(normalizeItem)));
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

          {/* List of Experience Items */}
          <div className="space-y-6">
            {items.map((item) => {
              const positions = item.positions && item.positions.length > 0 ? item.positions : [
                {
                  id: `pos-${item.id}-0`,
                  role: item.role,
                  period: item.period,
                  startDate: item.startDate,
                  endDate: item.endDate,
                  current: item.current,
                  bullets: item.bullets,
                },
              ];
              const hasMultiplePositions = positions.length > 1;

              return (
                <div key={item.id} className="space-y-4 rounded-xl border border-border bg-card p-4">
                  {/* Top Bar: Company Name, Location & Trash */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-foreground">
                          Company name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => handleUpdateField(item.id, 'company', e.target.value)}
                          aria-label="Company name"
                          placeholder={isOrgVol ? "e.g., Meta, Shopee, etc" : "e.g., Acme Corporation"}
                          className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-foreground">
                          City and country <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => handleUpdateField(item.id, 'location', e.target.value)}
                          aria-label="City and country"
                          placeholder={isOrgVol ? "e.g., Jakarta, Indonesia" : "e.g., Malang (On-site)"}
                          className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-6 flex-shrink-0 rounded-lg border border-border p-1.5 text-destructive transition hover:bg-destructive/10"
                      title="Delete experience"
                      aria-label="Delete experience"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Positions / Promotions inside this Company */}
                  <div className="space-y-4 pt-1">
                    {positions.map((pos, pIdx) => (
                      <div
                        key={pos.id}
                        className={`space-y-3 ${
                          hasMultiplePositions ? 'rounded-lg border border-border bg-muted/40 p-3 sm:p-3.5' : ''
                        }`}
                      >
                        {/* Header when multiple positions (Promotion) */}
                        {hasMultiplePositions && (
                          <div className="flex items-center justify-between border-b border-border pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp size={13} className="text-primary" />
                              <span className="text-[11px] font-semibold text-foreground">
                                Position {pIdx + 1} {pIdx === 0 ? '(latest or promotion)' : ''}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePosition(item.id, pos.id)}
                              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1"
                              title="Delete this position"
                            >
                              <Trash2 size={12} />
                              <span>Delete position</span>
                            </button>
                          </div>
                        )}

                        {/* Currently working checkbox */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`current-${pos.id}`}
                            checked={pos.current || false}
                            onChange={(e) => handleUpdatePositionField(item.id, pos.id, 'current', e.target.checked)}
                            className="h-3.5 w-3.5 cursor-pointer rounded border-input text-primary focus:ring-primary/30"
                          />
                          <label
                            htmlFor={`current-${pos.id}`}
                            className="cursor-pointer select-none text-xs text-foreground"
                          >
                            I currently work in this role
                          </label>
                        </div>

                        {/* Position, Start Date, End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-foreground">
                              Position or role <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="text"
                              value={pos.role}
                              onChange={(e) => handleUpdatePositionField(item.id, pos.id, 'role', e.target.value)}
                              aria-label="Position or role"
                              placeholder={isOrgVol ? "e.g., Lead, Member, etc" : "e.g., Senior Product Designer"}
                              className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-foreground">
                              Start date <span className="text-destructive">*</span>
                            </label>
                            <DatePicker
                              value={pos.startDate || ''}
                              onChange={(val) => handleUpdatePositionField(item.id, pos.id, 'startDate', val)}
                              ariaLabel="Position start date"
                              placeholder="Select start date"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-foreground">
                              End date
                            </label>
                            <DatePicker
                              value={pos.current ? 'Present' : (pos.endDate || '')}
                              disabled={pos.current || false}
                              onChange={(val) => handleUpdatePositionField(item.id, pos.id, 'endDate', val)}
                              ariaLabel="Position end date"
                              placeholder="Select end date"
                            />
                          </div>
                        </div>

                        {/* Bullets */}
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-foreground">
                            {isOrgVol ? 'Descriptions' : 'Job descriptions'}{' '}
                            <span className="text-destructive">*</span>
                          </label>
                          <RichTextEditor
                            initialContent={pos.bullets}
                            onChange={(newHtml) => handleUpdatePositionField(item.id, pos.id, 'bullets', newHtml)}
                            hideActions={true}
                            ariaLabel={isOrgVol ? 'Descriptions' : 'Job descriptions'}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Button to add promotion / position inside this company */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddPosition(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-accent px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-accent/70"
                      >
                        <Plus size={13} />
                        <span>Add position</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 rounded-lg border border-primary px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-accent"
            >
              <Plus size={13} />
              <span>Add experience</span>
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
            setItems(sortByPeriodDesc((data.items || []).map(normalizeItem)));
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
              <div className="flex justify-between items-baseline font-bold leading-snug">
                <span className="text-slate-400">Position</span>
                <span className="text-[7.75pt] font-semibold text-slate-400">May 2022 - Present</span>
              </div>
              <div className="flex justify-between items-baseline text-slate-400 leading-snug text-[8pt]">
                <span className="font-semibold text-slate-400">Company Name</span>
                <span className="text-slate-400">City, State/Country</span>
              </div>
              <div className="text-slate-400 text-justify mt-0.5 text-[7.75pt] leading-[1.48]">
                State your tasks and accomplishments including name of the project and position of responsibility held.
              </div>
            </div>
          ) : (
            sortByPeriodDesc(data.items || []).map((item) => {
              if (item.positions && item.positions.length > 1) {
                return (
                  <div key={item.id} className="avoid-break mb-1.5 last:mb-0">
                    {/* Line 1: Company Name & Location */}
                    <div className="flex justify-between items-baseline leading-snug">
                      <span className="font-bold text-slate-900 text-[8pt]">{item.company}</span>
                      <span className="text-slate-700 text-[8pt]">{item.location}</span>
                    </div>

                    {/* Positions / Promotions */}
                    <div className="space-y-1.5 mt-0.5">
                      {sortByPeriodDesc(item.positions).map((pos, posIdx) => (
                        <div key={pos.id || posIdx}>
                          <div className="flex justify-between items-baseline leading-snug">
                            <span className="font-semibold text-slate-900 text-[7.75pt]">{pos.role}</span>
                            <span className="text-[7.75pt] font-semibold text-slate-800">{pos.period}</span>
                          </div>
                          {pos.bullets && (
                            <div
                              className="text-slate-800 text-justify mt-0.5 text-[7.75pt] leading-[1.48]"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(pos.bullets) }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="avoid-break mb-1.5 last:mb-0">
                  {/* Line 1: Role & Period */}
                  <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                    <span>{item.role}</span>
                    <span className="text-[7.75pt] font-semibold text-slate-800">{item.period}</span>
                  </div>

                  {/* Line 2: Company & Location */}
                  <div className="flex justify-between items-baseline text-slate-800 leading-snug text-[8pt]">
                    <span className="font-semibold">{item.company}</span>
                    <span className="text-slate-700">{item.location}</span>
                  </div>

                  {/* Bullet Points */}
                  {item.bullets && (
                    <div
                      className="text-slate-800 text-justify mt-0.5 text-[7.75pt] leading-[1.48]"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.bullets) }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
