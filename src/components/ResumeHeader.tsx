import React, { useState } from 'react';
import { HeaderData, ContactLink } from '../types/resume';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export const getWhatsAppUrl = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return `https://wa.me/${cleaned}`;
};

interface ResumeHeaderProps {
  data: HeaderData;
  onChange: (updated: HeaderData) => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({ data, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const isPlaceholder = Boolean(data.isPlaceholder);

  const getCleanFormData = (): HeaderData => {
    if (data.isPlaceholder) {
      return {
        fullName: '',
        roles: [''],
        headline: '',
        location: '',
        willingToRelocate: false,
        relocationStatus: '',
        email: '',
        phone: '',
        links: [
          { id: `link-${Date.now()}-1`, label: '', url: '' },
          { id: `link-${Date.now()}-2`, label: '', url: '' },
        ],
        isPlaceholder: true,
      };
    }
    const initialRoles =
      data.roles && data.roles.length > 0
        ? data.roles
        : data.headline
        ? data.headline.split('|').map((s) => s.trim())
        : [''];
    return {
      ...data,
      roles: initialRoles.slice(0, 4),
      willingToRelocate: data.willingToRelocate ?? true,
    };
  };

  const [formData, setFormData] = useState<HeaderData>(getCleanFormData);

  const handleSave = () => {
    const cleanedRoles = (formData.roles || []).map((r) => r.trim()).filter(Boolean);
    const hasContent = Boolean(formData.fullName.trim() || formData.email.trim() || formData.location.trim());
    const updated: HeaderData = {
      ...formData,
      roles: cleanedRoles,
      headline: cleanedRoles.join(' | '),
      willingToRelocate: formData.willingToRelocate ?? false,
      relocationStatus: formData.willingToRelocate ? '(Willing to relocate)' : '',
      isPlaceholder: hasContent ? false : isPlaceholder,
    };
    onChange(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(getCleanFormData());
    setIsEditing(false);
  };

  const handleAddRole = () => {
    if ((formData.roles || []).length < 4) {
      setFormData({
        ...formData,
        roles: [...(formData.roles || []), ''],
      });
    }
  };

  const handleRemoveRole = (index: number) => {
    const updated = (formData.roles || []).filter((_, i) => i !== index);
    setFormData({ ...formData, roles: updated.length > 0 ? updated : [''] });
  };

  const handleUpdateRole = (index: number, value: string) => {
    const updated = [...(formData.roles || [])];
    updated[index] = value;
    setFormData({ ...formData, roles: updated });
  };

  const handleAddLink = () => {
    const newLink: ContactLink = {
      id: `link-${Date.now()}`,
      label: '',
      url: '',
    };
    setFormData({
      ...formData,
      links: [...formData.links, newLink],
    });
  };

  const handleRemoveLink = (id: string) => {
    setFormData({
      ...formData,
      links: formData.links.filter((l) => l.id !== id),
    });
  };

  const handleUpdateLink = (id: string, field: 'label' | 'url', value: string) => {
    setFormData({
      ...formData,
      links: formData.links.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    });
  };

  // View Mode values
  const activeRoles = (
    data.roles && data.roles.length > 0
      ? data.roles
      : data.headline
      ? data.headline.split('|').map((s) => s.trim())
      : []
  ).filter(Boolean);
  const displayedRoles = activeRoles.join(' | ');

  const isRelocating = data.willingToRelocate ?? (data.relocationStatus && data.relocationStatus.includes('Willing'));

  if (isEditing) {
    return (
      <div className="bg-[#f8fafc] rounded-xl border border-slate-200/90 p-5 shadow-xs my-2.5 no-print font-sans">
        {/* Title */}
        <div className="border-b border-slate-900 pb-1 mb-5">
          <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider">
            HEADER & CONTACT
          </h3>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Your Name"
                className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. City, State/Country"
                className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. email@address.com"
                className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +65 1234 5678"
                className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Relocation Checklist */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="relocateCheck"
              checked={formData.willingToRelocate ?? false}
              onChange={(e) => setFormData({ ...formData, willingToRelocate: e.target.checked })}
              className="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="relocateCheck" className="text-xs text-slate-700 cursor-pointer select-none font-medium">
              Willing to relocate
            </label>
          </div>

          {/* Roles (Max 4, automatically joined with |) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-semibold text-slate-700">
                Target Roles / Positions <span className="text-slate-400 font-normal">(Max 4 roles, automatically separated by "|")</span>
              </label>
              {(formData.roles || []).length < 4 && (
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus size={12} /> Add Role ({(formData.roles || []).length}/4)
                </button>
              )}
            </div>

            <div className="space-y-2">
              {(formData.roles || []).map((role, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => handleUpdateRole(idx, e.target.value)}
                    placeholder={`Role ${idx + 1} (e.g. ${idx === 0 ? 'UI/UX Designer' : idx === 1 ? 'Product Designer' : idx === 2 ? 'UX Researcher' : 'Product Manager'})`}
                    className="flex-1 px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  {(formData.roles || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="p-1.5 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Role"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social / Portfolio Links */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-[11px] font-semibold text-slate-700 mb-2">
              Portfolio & Profile Links
            </label>

            <div className="space-y-2.5">
              {formData.links.map((link) => (
                <div key={link.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)}
                    placeholder="Display Name (e.g. linkedin.com/in/your_linkedin)"
                    className="w-1/3 px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                    placeholder="URL (https://...)"
                    className="flex-1 px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link.id)}
                    className="p-1.5 border border-slate-200 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Link"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={handleAddLink}
            className="inline-flex items-center gap-1 px-4 py-1.5 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition"
          >
            <Plus size={13} />
            <span>Add Link</span>
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
    );
  }

  return (
    <div className="resume-header group relative text-center mb-2 pb-0.5">
      {/* Edit trigger button */}
      <button
        type="button"
        data-editor-control="true"
        onClick={() => {
          setFormData(getCleanFormData());
          setIsEditing(true);
        }}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-slate-200 shadow-xs rounded-md px-1.5 py-1 text-slate-600 hover:text-slate-900 transition no-print"
        title="Edit Contact Information"
      >
        <Pencil size={13} />
      </button>

      {/* Full Name */}
      <h1
        className={`text-[17pt] font-bold tracking-tight mb-0.5 leading-tight ${
          isPlaceholder ? 'text-slate-400' : 'text-slate-900'
        }`}
      >
        {data.fullName || 'Your Name'}
      </h1>

      {/* Optional Roles (Joined with |) */}
      {displayedRoles && (
        <div className="text-[8.5pt] text-slate-800 font-normal leading-tight mb-1">
          {displayedRoles}
        </div>
      )}

      {/* Contact Line 1 */}
      <div
        className={`text-[8.5pt] flex flex-wrap items-center justify-center gap-x-1 leading-tight ${
          isPlaceholder ? 'text-slate-400' : 'text-slate-700'
        }`}
      >
        <span>{data.location || 'City, State/Country'}</span>
        {isRelocating && ' (Willing to relocate)'}

        <span>•</span>
        <a
          href={data.email ? `mailto:${data.email}` : '#'}
          className={`underline hover:text-black ${isPlaceholder ? 'text-slate-400' : 'text-slate-800'}`}
        >
          {data.email || 'email@address.com'}
        </a>

        <span>•</span>
        <a
          href={data.phone ? getWhatsAppUrl(data.phone) : '#'}
          target="_blank"
          rel="noreferrer"
          className={`underline hover:text-black ${isPlaceholder ? 'text-slate-400' : 'text-slate-800'}`}
          title="Contact via WhatsApp"
        >
          {data.phone || '+65 1234 5678'}
        </a>

        {data.links &&
          data.links.map((link) => (
            <React.Fragment key={link.id}>
              <span>•</span>
              <a
                href={link.url || '#'}
                target="_blank"
                rel="noreferrer"
                className={`underline hover:text-black inline-flex items-center ${
                  isPlaceholder ? 'text-slate-400' : 'text-slate-800'
                }`}
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};
