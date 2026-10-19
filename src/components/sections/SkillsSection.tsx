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
    <section className="mb-1.5">
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
        <div className="my-2.5 rounded-xl border border-border bg-muted/50 p-4 font-sans shadow-sm no-print sm:p-5">
          {/* Header Section Title */}
          <div className="mb-5 border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
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
                    <label className="mb-1 block text-[11px] font-semibold text-foreground">
                      Skill category <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => handleChange(cat.id, 'category', e.target.value)}
                      aria-label="Skill category"
                      placeholder="e.g. Design & Research"
                      className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  {/* Trash button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat.id)}
                    className="mt-5 rounded-lg border border-border p-1.5 text-destructive transition hover:bg-destructive/10"
                    title="Delete category"
                    aria-label="Delete category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* List of skills textarea */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-foreground">
                    Skills <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={cat.items}
                    onChange={(e) => handleChange(cat.id, 'items', e.target.value)}
                    aria-label="Skills"
                    placeholder="UI/UX Design, Visual Design, Wireframing..."
                    rows={2}
                    className="w-full resize-y rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    Separate skills with commas
                  </p>
                </div>

                {/* Separator between items */}
                {idx < categories.length - 1 && (
                  <div className="border-b border-border pt-3" />
                )}
              </div>
            ))}
          </div>

          {/* Action Bar (Add category on left, Cancel & Save on right) */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={handleAddCategory}
              className="inline-flex items-center gap-1 rounded-lg border border-primary px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-accent"
            >
              <Plus size={13} />
              <span>Add category</span>
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
            setCategories(data.categories.length > 0 && !isPlaceholder ? data.categories : [{ id: `sk-${Date.now()}`, category: '', items: '' }]);
            setIsEditing(true);
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          className="cursor-pointer hover:bg-accent/50 p-1 -m-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 space-y-0.5 leading-[1.48] text-[7.75pt]"
          title="Click to edit skills"
          aria-label="Edit skills"
        >
          {isPlaceholder ? (
            <div className="leading-[1.48] text-slate-400 select-none">
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
