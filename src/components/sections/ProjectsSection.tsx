import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { ProjectItem } from '../../types/resume';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
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
    <section className="mb-2">
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
        <div className="bg-[#f8fafc] rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm my-2.5 no-print font-sans">
          {/* Header Title */}
          <div className="border-b border-slate-900 pb-1 mb-5">
            <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                      placeholder="e.g. Proaksi Internship Services"
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 mt-5 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete project"
                    aria-label="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Row 2: URL, Start Date, End Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Project Link <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={item.url || ''}
                      onChange={(e) => handleUpdateField(item.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Start Date
                    </label>
                    <DatePicker
                      value={item.startDate || ''}
                      onChange={(val) => {
                        const end = item.endDate || '';
                        const period = val && end ? `${val} - ${end}` : (val || end || '');
                        setItems(items.map((it) => it.id === item.id ? { ...it, startDate: val, period } : it));
                      }}
                      placeholder="Select start date"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={item.endDate || ''}
                      onChange={(val) => {
                        const start = item.startDate || '';
                        const period = start && val ? `${start} - ${val}` : (val || start || '');
                        setItems(items.map((it) => it.id === item.id ? { ...it, endDate: val, period } : it));
                      }}
                      placeholder="Select end date"
                    />
                  </div>
                </div>

                {/* Row 3: Descriptions Rich Text */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    initialContent={item.bullets}
                    onChange={(newHtml) => handleUpdateField(item.id, 'bullets', newHtml)}
                    hideActions={true}
                  />
                </div>

                {/* Separator between items */}
                {idx < items.length - 1 && (
                  <div className="border-b border-slate-200 pt-3" />
                )}
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-3 pt-6 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-4 py-1.5 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition"
            >
              <Plus size={13} />
              <span>Add project</span>
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
            setItems(data.items.length > 0 && !isPlaceholder ? sortByPeriodDesc((data.items || []).map(normalizeProjItem)) : [{ id: `proj-${Date.now()}`, name: '', url: '', period: '', bullets: '', startDate: '', endDate: '' }]);
            setIsEditing(true);
          }}
          className="cursor-pointer space-y-2 hover:bg-slate-50/70 p-1 -m-1 rounded transition"
          title={`Click to edit ${title}`}
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
