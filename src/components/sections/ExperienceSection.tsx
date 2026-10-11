import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { ExperienceItem } from '../../types/resume';
import { Plus, Trash2, X } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

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
  const [items, setItems] = useState<ExperienceItem[]>(data.items);
  const isOrgVol = title.toUpperCase().includes('ORGANIZATIONAL') || title.toUpperCase().includes('VOLUNTEER');

  const computePeriod = (item: ExperienceItem) => {
    if (item.current) {
      return item.startDate ? `${item.startDate} - Present` : 'Present';
    }
    if (item.startDate && item.endDate) {
      return `${item.startDate} - ${item.endDate}`;
    }
    return item.startDate || item.endDate || item.period || '';
  };

  const handleSave = () => {
    const updated = items.map((it) => ({
      ...it,
      period: computePeriod(it),
    }));
    // If user filled company or role or bullets, mark isPlaceholder false
    const hasContent = updated.some((it) => it.company || it.role || (it.bullets && it.bullets !== '<p></p>'));
    onUpdateData({ items: updated }, hasContent ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(data.items);
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      location: '',
      period: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: '<ul><li>Tuliskan deskripsi pencapaian di sini...</li></ul>',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateField = (id: string, field: keyof ExperienceItem, value: any) => {
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
            setItems(data.items);
            setIsEditing(true);
          }}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}

      {isEditing ? (
        <div className="bg-[#f8fafc] rounded-xl border border-slate-200/90 p-5 shadow-xs my-2.5 no-print font-sans">
          {/* Header Title */}
          <div className="border-b border-slate-900 pb-1 mb-5">
            <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider">
              {title}
            </h3>
          </div>

          {/* List of Experience Items */}
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={item.id} className="space-y-3.5">
                {/* Row 1: Company Name & Trash */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full sm:w-1/2">
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

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 mt-5 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Experience"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Row 2: Currently working checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-${item.id}`}
                    checked={item.current || false}
                    onChange={(e) => handleUpdateField(item.id, 'current', e.target.checked)}
                    className="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`current-${item.id}`}
                    className="text-xs text-slate-700 cursor-pointer select-none"
                  >
                    I am currently working in this role
                  </label>
                </div>

                {/* Row 3: 4 Columns (Position, City/Country, Start Date, End Date) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => handleUpdateField(item.id, 'role', e.target.value)}
                      placeholder={isOrgVol ? "e.g., Frontend, Backend, etc" : "e.g. UI/UX Designer"}
                      className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
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
                      placeholder={isOrgVol ? "e.g., Jakarta, Indonesia" : "e.g. Malang (On-site)"}
                      className="w-full px-2.5 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={item.startDate || ''}
                        onChange={(e) => handleUpdateField(item.id, 'startDate', e.target.value)}
                        placeholder={isOrgVol ? "Pick Date" : "e.g. August 2025"}
                        className="w-full px-2.5 py-1.5 pr-6 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                      {item.startDate && (
                        <button
                          type="button"
                          onClick={() => handleUpdateField(item.id, 'startDate', '')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-800 p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={item.current || false}
                        value={item.current ? 'Present' : (item.endDate || '')}
                        onChange={(e) => handleUpdateField(item.id, 'endDate', e.target.value)}
                        placeholder={isOrgVol ? "Pick Date" : "e.g. December 2025"}
                        className={`w-full px-2.5 py-1.5 pr-6 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                          item.current ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                        }`}
                      />
                      {!item.current && item.endDate && (
                        <button
                          type="button"
                          onClick={() => handleUpdateField(item.id, 'endDate', '')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-800 p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 4: Job Descriptions Rich Text */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {isOrgVol ? 'Organizational/ Volunteering Descriptions' : 'Job Descriptions'}{' '}
                    <span className="text-red-500">*</span>
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
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-4 py-1.5 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition"
            >
              <Plus size={13} />
              <span>Add More</span>
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
                className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            setItems(data.items);
            setIsEditing(true);
          }}
          className="cursor-pointer space-y-2 hover:bg-slate-50/70 p-1 -m-1 rounded transition"
          title={`Click to edit ${title}`}
        >
          {isPlaceholder ? (
            <div className="avoid-break text-slate-400 select-none">
              <div className="flex justify-between items-baseline font-bold leading-snug">
                <span className="text-slate-400">Position</span>
                <span className="text-[9pt] font-semibold text-slate-400">May 2022 - Present</span>
              </div>
              <div className="flex justify-between items-baseline text-slate-400 leading-snug text-[9.5pt]">
                <span className="font-semibold text-slate-400">Company Name</span>
                <span className="text-slate-400">City, State/Country</span>
              </div>
              <div className="text-slate-400 text-justify mt-0.5">
                State your tasks and accomplishments including name of the project and position of responsibility held.
              </div>
            </div>
          ) : (
            data.items.map((item) => (
              <div key={item.id} className="avoid-break">
                {/* Line 1: Role & Period */}
                <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                  <span>{item.role}</span>
                  <span className="text-[9pt] font-semibold text-slate-800">{item.period}</span>
                </div>

                {/* Line 2: Company & Location */}
                <div className="flex justify-between items-baseline text-slate-800 leading-snug text-[9.5pt]">
                  <span className="font-semibold">{item.company}</span>
                  <span className="text-slate-700">{item.location}</span>
                </div>

                {/* Bullet Points */}
                <div
                  className="text-slate-800 text-justify mt-0.5"
                  dangerouslySetInnerHTML={{ __html: item.bullets }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
