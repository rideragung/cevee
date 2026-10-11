import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { SkillCategory } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';

interface SkillsSectionProps {
  title: string;
  isPlaceholder?: boolean;
  data: { categories: SkillCategory[] };
  onRename: (title: string) => void;
  onUpdateData: (data: { categories: SkillCategory[] }, isPlaceholder?: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
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
  const [categories, setCategories] = useState<SkillCategory[]>(data.categories);

  const handleSave = () => {
    const hasContent = categories.some((c) => c.category.trim() || c.items.trim());
    onUpdateData({ categories }, hasContent ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCategories(data.categories);
    setIsEditing(false);
  };

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: '',
      items: '',
    };
    setCategories([...categories, newCat]);
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleChange = (id: string, field: 'category' | 'items', value: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <section className="mb-2">
      {/* View Mode Section Header */}
      {!isEditing && (
        <SectionHeader
          title={title}
          onRename={onRename}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onToggleEdit={() => {
            setCategories(data.categories);
            setIsEditing(true);
          }}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}

      {isEditing ? (
        <div className="bg-[#f8fafc] rounded-xl border border-slate-200/90 p-5 shadow-xs my-2.5 no-print font-sans">
          {/* Header Section Title */}
          <div className="border-b border-slate-900 pb-1 mb-5">
            <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider">
              {title}
            </h3>
          </div>

          {/* List of Skill Categories */}
          <div className="space-y-5">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="space-y-3">
                {/* Skill Category row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Skill Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => handleChange(cat.id, 'category', e.target.value)}
                      placeholder="e.g. Design & Research"
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  {/* Trash button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat.id)}
                    className="p-1.5 mt-5 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* List of skills textarea */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    List of skills <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cat.items}
                    onChange={(e) => handleChange(cat.id, 'items', e.target.value)}
                    placeholder="UI/UX Design, Visual Design, Wireframing..."
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y bg-white"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-0.5">
                    Use comma to separate each skill
                  </p>
                </div>

                {/* Separator between items */}
                {idx < categories.length - 1 && (
                  <div className="border-b border-slate-200 pt-3" />
                )}
              </div>
            ))}
          </div>

          {/* Action Bar (Add More on left, Cancel & Save on right) */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAddCategory}
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
            setCategories(data.categories.length > 0 && !isPlaceholder ? data.categories : [{ id: `sk-${Date.now()}`, category: '', items: '' }]);
            setIsEditing(true);
          }}
          className="cursor-pointer hover:bg-slate-50/70 p-1 -m-1 rounded transition space-y-0.5 leading-snug"
          title="Click to edit skills"
        >
          {isPlaceholder ? (
            <div className="leading-snug text-slate-400 select-none">
              <span className="font-bold text-slate-400">Skill Category: </span>
              <span>Skill Name 1, Skill Name 2, Skill Name 3, Skill Name 4, Skill Name 5, etc</span>
            </div>
          ) : (
            data.categories.map((cat) => (
              <div key={cat.id} className="text-slate-800">
                <span className="font-bold text-slate-900">{cat.category}: </span>
                <span>{cat.items}</span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
