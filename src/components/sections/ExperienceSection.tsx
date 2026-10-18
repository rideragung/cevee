import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { ExperienceItem, ExperiencePosition } from '../../types/resume';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
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
        <div className="bg-[#f8fafc] rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm my-2.5 no-print font-sans">
          {/* Header Title */}
          <div className="border-b border-slate-900 pb-1 mb-5">
            <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider">
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
                <div key={item.id} className="p-4 bg-white rounded-xl border border-slate-200/90 space-y-4">
                  {/* Top Bar: Company Name, Location & Trash */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => handleUpdateField(item.id, 'company', e.target.value)}
                          placeholder={isOrgVol ? "e.g., Meta, Shopee, etc" : "e.g., Acme Corporation"}
                          className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          City, Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => handleUpdateField(item.id, 'location', e.target.value)}
                          placeholder={isOrgVol ? "e.g., Jakarta, Indonesia" : "e.g., Malang (On-site)"}
                          className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 mt-6 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0"
                      title="Delete Experience"
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
                          hasMultiplePositions ? 'p-3 sm:p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/80' : ''
                        }`}
                      >
                        {/* Header when multiple positions (Promotion) */}
                        {hasMultiplePositions && (
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp size={13} className="text-emerald-600" />
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Position {pIdx + 1} {pIdx === 0 ? '(Latest / Promotion)' : ''}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePosition(item.id, pos.id)}
                              className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1 hover:underline"
                              title="Delete this position"
                            >
                              <Trash2 size={12} />
                              <span>Delete Position</span>
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
                            className="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`current-${pos.id}`}
                            className="text-xs text-slate-700 cursor-pointer select-none"
                          >
                            I am currently working in this role
                          </label>
                        </div>

                        {/* Position, Start Date, End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Position / Role <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={pos.role}
                              onChange={(e) => handleUpdatePositionField(item.id, pos.id, 'role', e.target.value)}
                              placeholder={isOrgVol ? "e.g., Lead, Member, etc" : "e.g., Senior Product Designer"}
                              className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Start Date <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                              value={pos.startDate || ''}
                              onChange={(val) => handleUpdatePositionField(item.id, pos.id, 'startDate', val)}
                              placeholder="Select start date"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              End Date
                            </label>
                            <DatePicker
                              value={pos.current ? 'Present' : (pos.endDate || '')}
                              disabled={pos.current || false}
                              onChange={(val) => handleUpdatePositionField(item.id, pos.id, 'endDate', val)}
                              placeholder="Select end date"
                            />
                          </div>
                        </div>

                        {/* Bullets */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {isOrgVol ? 'Descriptions' : 'Job Descriptions'}{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <RichTextEditor
                            initialContent={pos.bullets}
                            onChange={(newHtml) => handleUpdatePositionField(item.id, pos.id, 'bullets', newHtml)}
                            hideActions={true}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Button to add promotion / position inside this company */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddPosition(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition"
                      >
                        <Plus size={13} />
                        <span>Add Position</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-3 pt-6 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-4 py-1.5 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition"
            >
              <Plus size={13} />
              <span>Add Experience</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            setItems(sortByPeriodDesc((data.items || []).map(normalizeItem)));
            setIsEditing(true);
          }}
          className="cursor-pointer space-y-2 hover:bg-slate-50/70 p-1 -m-1 rounded transition"
          title={`Click to edit ${title}`}
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
                  <div key={item.id} className="avoid-break mb-2 last:mb-0">
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
                <div key={item.id} className="avoid-break mb-2 last:mb-0">
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
