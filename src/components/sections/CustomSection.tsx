import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { CustomSectionItem } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';

interface CustomSectionProps {
  title: string;
  isPlaceholder?: boolean;
  data: { items: CustomSectionItem[] };
  onRename: (title: string) => void;
  onUpdateData: (data: { items: CustomSectionItem[] }, isPlaceholder?: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const CustomSection: React.FC<CustomSectionProps> = ({
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
  const [items, setItems] = useState<CustomSectionItem[]>(data?.items || []);

  const t = title.toUpperCase();
  const isCert = t.includes('CERTIFICATION');
  const isLang = t.includes('LANGUAGE');
  const isPub = t.includes('PUBLICATION');
  const isAward = t.includes('AWARD');
  const isRef = t.includes('REFERENCE');

  const handleSave = () => {
    const hasContent = items.some(
      (it) => it.title.trim() || (it.subtitle && it.subtitle.trim()) || (it.credentialId && it.credentialId.trim())
    );
    onUpdateData({ items }, hasContent ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(data?.items || []);
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const newItem: CustomSectionItem = {
      id: `custom-${Date.now()}`,
      title: '',
      subtitle: '',
      period: '',
      description: '',
      credentialId: '',
      credentialUrl: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateField = (id: string, field: keyof CustomSectionItem, value: string) => {
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
            setItems(data?.items || []);
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

          {/* List of Custom Items */}
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={item.id} className="space-y-3.5">
                {/* Row 1: Title & Trash */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isCert
                        ? 'Certification Name'
                        : isLang
                        ? 'Language'
                        : isPub
                        ? 'Publication Title'
                        : isAward
                        ? 'Title'
                        : isRef
                        ? 'Referee Name'
                        : 'Title / Item'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateField(item.id, 'title', e.target.value)}
                      placeholder={
                        isCert
                          ? 'e.g., Learn Basic AI'
                          : isLang
                          ? 'e.g., Bahasa Indonesia'
                          : isPub
                          ? 'e.g., Publication Title'
                          : isAward
                          ? 'e.g., Title'
                          : isRef
                          ? 'e.g., Richard Hendricks'
                          : 'e.g., Title'
                      }
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 mt-5 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Row 2: Subtitle / Org & Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isCert
                        ? 'Issuing Organization'
                        : isLang
                        ? 'Proficiency'
                        : isPub
                        ? 'Publisher'
                        : isAward
                        ? 'Issuer'
                        : isRef
                        ? 'Role & Company'
                        : 'Subtitle / Organization'}{' '}
                      <span className={isCert || isLang || isRef ? 'text-red-500' : 'text-slate-400 font-normal'}>
                        {isCert || isLang || isRef ? '*' : '(Optional)'}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => handleUpdateField(item.id, 'subtitle', e.target.value)}
                      placeholder={
                        isCert
                          ? 'e.g., Dicoding Indonesia'
                          : isLang
                          ? 'e.g., Native proficiency'
                          : isPub
                          ? 'e.g., Publisher'
                          : isAward
                          ? 'e.g., Issuer'
                          : isRef
                          ? 'e.g., Co-founder of Pied Piper'
                          : 'e.g., Organization'
                      }
                      className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  {!isLang && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {isRef ? 'Email / Contact' : isCert ? 'Issue Date' : 'Date / Year'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.period || ''}
                        onChange={(e) => handleUpdateField(item.id, 'period', e.target.value)}
                        placeholder={isRef ? 'e.g., richard@piedpiper.com' : 'e.g., Jan 2025 – Jan 2028'}
                        className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Row 3: Description / Credential */}
                {!isLang && !isRef && (
                  <>
                    {isCert ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Credential ID <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={
                              item.credentialId ||
                              (item.description && !item.description.includes('.')
                                ? item.description.replace(/^Credential ID:\s*/i, '')
                                : '')
                            }
                            onChange={(e) => handleUpdateField(item.id, 'credentialId', e.target.value)}
                            placeholder="e.g., 6RPNR3EJ9X2M"
                            className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Credential Link / URL <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={
                              item.credentialUrl ||
                              (item.description && item.description.includes('.') ? item.description : '')
                            }
                            onChange={(e) => handleUpdateField(item.id, 'credentialUrl', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Description <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleUpdateField(item.id, 'description', e.target.value)}
                          placeholder={
                            isPub
                              ? 'Provide a brief overview of the research, emphasizing significant findings...'
                              : isAward
                              ? 'Write a concise description of the award, highlighting key achievements...'
                              : 'Brief description...'
                          }
                          className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Separator between items */}
                {idx < items.length - 1 && (
                  <div className="border-b border-slate-200 pt-3" />
                )}
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-200/80">
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
            setItems(
              data?.items && data.items.length > 0 && !isPlaceholder
                ? data.items
                : [{ id: `custom-${Date.now()}`, title: '', subtitle: '', period: '', description: '', credentialId: '', credentialUrl: '' }]
            );
            setIsEditing(true);
          }}
          className="cursor-pointer space-y-1.5 hover:bg-slate-50/70 p-1 -m-1 rounded transition text-slate-800"
          title={`Click to edit ${title}`}
        >
          {isPlaceholder ? (
            /* Dummy Preview Template matching Image 2 in disabled color */
            <div className="avoid-break text-slate-400 select-none space-y-1">
              {isCert && (
                <div className="flex justify-between items-baseline leading-snug">
                  <div>
                    <span className="font-bold text-slate-400">Learn Basic AI (Credential ID: 6RPNR3EJ9X2M)</span>
                    <span className="font-normal text-slate-400"> by </span>
                    <span className="font-bold text-slate-400">Dicoding Indonesia</span>
                  </div>
                  <span className="text-[9pt] font-bold text-slate-400">Jan 2025 – Jan 2028</span>
                </div>
              )}

              {isLang && (
                <div className="text-slate-400 text-[9pt] leading-snug">
                  <span className="font-bold text-slate-400">Bahasa Indonesia</span> (Native proficiency) •{' '}
                  <span className="font-bold text-slate-400">Vietnamese</span> (Full working proficiency) •{' '}
                  <span className="font-bold text-slate-400">English</span> (Professional working proficiency)
                </div>
              )}

              {isPub && (
                <div>
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span className="text-slate-400">Publication Title (Publisher)</span>
                    <span className="text-[9pt] font-semibold text-slate-400">May 2022</span>
                  </div>
                  <div className="text-slate-400 text-[9pt] leading-relaxed mt-0.5">
                    Provide a brief overview of the research, emphasizing significant findings...
                  </div>
                </div>
              )}

              {isAward && (
                <div>
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span className="text-slate-400">Title (Issuer)</span>
                    <span className="text-[9pt] font-semibold text-slate-400">May 2022</span>
                  </div>
                  <div className="text-slate-400 text-[9pt] leading-relaxed mt-0.5">
                    Write a concise description of the award, highlighting key achievements...
                  </div>
                </div>
              )}

              {isRef && (
                <div className="text-slate-400 text-[9pt] leading-snug">
                  <span className="font-bold text-slate-400">Richard Hendricks</span> (Co-founder of Pipe Piper) • richard@piedpiper.com
                </div>
              )}
            </div>
          ) : (
            (data?.items || []).map((item) => {
              if (isCert) {
                // Determine credential ID & URL
                const rawDesc = item.description || '';
                const isUrlDesc = rawDesc.startsWith('http') || rawDesc.includes('.com') || rawDesc.includes('.id') || rawDesc.includes('.org');
                const credUrl = item.credentialUrl || (isUrlDesc ? rawDesc : '');
                const rawCredId = item.credentialId || (!isUrlDesc ? rawDesc.replace(/^Credential ID:\s*/i, '') : '');

                const certContent = (
                  <>
                    <span className="font-bold">{item.title}</span>
                    {rawCredId && (
                      <span className="font-bold"> (Credential ID: {rawCredId})</span>
                    )}
                    {item.subtitle && (
                      <>
                        <span className="font-normal"> by </span>
                        <span className="font-bold">{item.subtitle}</span>
                      </>
                    )}
                  </>
                );

                return (
                  <div key={item.id} className="avoid-break flex justify-between items-baseline leading-snug">
                    {credUrl ? (
                      <a
                        href={credUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-900 hover:text-blue-700 leading-snug"
                        title={credUrl}
                      >
                        {certContent}
                      </a>
                    ) : (
                      <div className="text-slate-900 leading-snug">{certContent}</div>
                    )}
                    {item.period && (
                      <span className="text-[9pt] font-bold text-slate-900 whitespace-nowrap ml-4">
                        {item.period}
                      </span>
                    )}
                  </div>
                );
              }

              if (isLang) {
                return (
                  <div key={item.id} className="avoid-break text-slate-800 text-[9pt] leading-snug">
                    <span className="font-bold">{item.title}</span>
                    {item.subtitle && ` (${item.subtitle})`}
                  </div>
                );
              }

              if (isRef) {
                return (
                  <div key={item.id} className="avoid-break text-slate-800 text-[9pt] leading-snug">
                    <span className="font-bold">{item.title}</span>
                    {item.subtitle && ` (${item.subtitle})`}
                    {item.period && ` • ${item.period}`}
                  </div>
                );
              }

              return (
                <div key={item.id} className="avoid-break">
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span>
                      {item.title}
                      {item.subtitle && ` (${item.subtitle})`}
                    </span>
                    {item.period && (
                      <span className="text-[9pt] font-semibold text-slate-800">{item.period}</span>
                    )}
                  </div>

                  {item.description && (
                    <div className="text-slate-800 text-[9pt] leading-relaxed mt-0.5">
                      {item.description}
                    </div>
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
