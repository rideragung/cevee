import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { EducationItem } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';
import { DatePicker } from '../DatePicker';

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
  const [items, setItems] = useState<EducationItem[]>(() => (data.items || []).map(normalizeEduItem));

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
    const hasContent = updated.some((it) => it.degree.trim() || it.institution.trim());
    onUpdateData({ items: updated }, hasContent ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems((data.items || []).map(normalizeEduItem));
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
      gpa: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateField = (id: string, field: keyof EducationItem, value: string) => {
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
            setItems((data.items || []).map(normalizeEduItem));
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

          {/* List of Education Items */}
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={item.id} className="space-y-3.5">
                {/* Row 1: Degree & Trash */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Degree / Major <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) => handleUpdateField(item.id, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Information Systems"
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 mt-5 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Education"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Row 2: Institution, Dates, GPA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Institution / School <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => handleUpdateField(item.id, 'institution', e.target.value)}
                      placeholder="e.g., State University / Institute of Technology"
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
                      placeholder="Pilih Tanggal Mulai"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      End Date / Graduation <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={item.endDate || ''}
                      onChange={(val) => {
                        const start = item.startDate || '';
                        const period = start && val ? `${start} - ${val}` : (val || start || '');
                        setItems(items.map((it) => it.id === item.id ? { ...it, endDate: val, period } : it));
                      }}
                      placeholder="Pilih Tanggal Lulus"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      GPA / Grade <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={item.gpa || ''}
                      onChange={(e) => handleUpdateField(item.id, 'gpa', e.target.value)}
                      placeholder="e.g. GPA: 4.0 of 4.0"
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Description <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleUpdateField(item.id, 'description', e.target.value)}
                      placeholder="e.g., info about scholarships, student activity, etc."
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>
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
            setItems(data.items.length > 0 && !isPlaceholder ? (data.items || []).map(normalizeEduItem) : [{ id: `edu-${Date.now()}`, degree: '', institution: '', period: '', gpa: '', startDate: '', endDate: '' }]);
            setIsEditing(true);
          }}
          className="cursor-pointer space-y-1 hover:bg-slate-50/70 p-1 -m-1 rounded transition"
          title={`Click to edit ${title}`}
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
            data.items.map((item) => (
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
                  <div className="text-slate-700 text-[7.75pt] leading-snug mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
