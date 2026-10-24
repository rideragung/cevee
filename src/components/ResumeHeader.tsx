import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HeaderData, ContactLink, ResumeLayoutId } from '../types/resume';
import {
  IconPencil as Pencil,
  IconPlus as Plus,
  IconTrash as Trash2,
  IconUpload as Upload,
  IconUser as UserIcon,
} from '@tabler/icons-react';
import { compressProfilePhoto } from '../utils/imageCompressor';
import { getWhatsAppUrl } from '../utils/whatsApp';

interface ResumeHeaderProps {
  data: HeaderData;
  onChange: (updated: HeaderData) => void;
  layoutId?: ResumeLayoutId | string;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({ data, onChange, layoutId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPlaceholder = Boolean(data.isPlaceholder);

  const getCleanFormData = useCallback((): HeaderData => {
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
        photoUrl: data.photoUrl || '',
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
      photoUrl: data.photoUrl || '',
      roles: initialRoles.slice(0, 4),
      willingToRelocate: data.willingToRelocate ?? true,
    };
  }, [data]);

  const [formData, setFormData] = useState<HeaderData>(getCleanFormData);

  useEffect(() => {
    if (!isEditing) {
      setFormData(getCleanFormData());
    }
  }, [isEditing, getCleanFormData]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressProfilePhoto(file, 300, 400, 0.85);
      setFormData((prev) => ({ ...prev, photoUrl: compressed }));
    } catch (err) {
      console.error('Failed to compress profile photo', err);
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSave = () => {
    const cleanedRoles = (formData.roles || []).map((r) => r.trim()).filter(Boolean);
    const hasContent = Boolean(
      formData.fullName.trim() ||
      formData.email.trim() ||
      formData.location.trim() ||
      formData.photoUrl
    );
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
      <div className="my-2.5 rounded-xl border border-border bg-muted/50 p-4 font-sans shadow-sm no-print sm:p-5">
        {/* Title */}
        <div className="mb-5 border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-foreground">
            Header & contact
          </h3>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-foreground">
                Full name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Your Name"
                aria-label="Full name"
                className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-foreground">
                Location <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. City, State/Country"
                aria-label="Location"
                className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. email@address.com"
                aria-label="Email"
                className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-foreground">
                Phone number <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +65 1234 5678"
                aria-label="Phone number"
                className="w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
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
              className="h-3.5 w-3.5 cursor-pointer rounded border-input text-primary focus:ring-primary/30"
            />
            <label htmlFor="relocateCheck" className="cursor-pointer select-none text-xs font-medium text-foreground">
              Willing to relocate
            </label>
          </div>

          {/* Profile Photo (3:4 ratio for modern-photo layout) */}
          {layoutId === 'modern-photo' && (
            <div className="border-t border-border pt-2">
              <label className="mb-2 block text-[11px] font-semibold text-foreground">
                Profile photo <span className="font-normal text-muted-foreground">(formal portrait, 3:4 aspect ratio)</span>
              </label>

              <div className="flex items-center gap-4">
                {/* 3:4 Preview Container */}
                <div className="flex h-[88px] w-[66px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover block"
                    />
                  ) : (
                    <UserIcon size={28} className="text-muted-foreground/50" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    aria-label="Upload profile photo"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-foreground/30"
                    >
                      <Upload size={13} />
                      <span>{formData.photoUrl ? 'Change photo' : 'Upload photo'}</span>
                    </button>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        className="cursor-pointer rounded-lg border border-border p-1.5 text-destructive transition hover:bg-destructive/10"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] leading-normal text-muted-foreground">
                    Auto-compressed to ~30 KB for clean vector PDF export.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Roles (Max 4, automatically joined with |) */}
          <div className="border-t border-border pt-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-foreground">
                Target roles <span className="font-normal text-muted-foreground">(up to 4, separated by "|")</span>
              </label>
              {(formData.roles || []).length < 4 && (
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80"
                >
                  <Plus size={12} /> Add role ({(formData.roles || []).length}/4)
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
                    aria-label={`Target role ${idx + 1}`}
                    placeholder={`Role ${idx + 1} (e.g. ${idx === 0 ? 'UI/UX Designer' : idx === 1 ? 'Product Designer' : idx === 2 ? 'UX Researcher' : 'Product Manager'})`}
                    className="flex-1 rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  {(formData.roles || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="rounded-lg border border-border p-1.5 text-destructive transition hover:bg-destructive/10"
                      title="Delete role"
                      aria-label="Delete role"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social / Portfolio Links */}
          <div className="border-t border-border pt-2">
            <label className="mb-2 block text-[11px] font-semibold text-foreground">
              Portfolio and profile links
            </label>

            <div className="space-y-2.5">
              {formData.links.map((link) => (
                <div key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)}
                    aria-label="Link label"
                    placeholder="Display name (e.g. linkedin.com/in/your_linkedin)"
                    className="w-full sm:w-1/3 rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <div className="flex items-center gap-2 sm:flex-1">
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                      aria-label="Link URL"
                      placeholder="URL (https://...)"
                      className="flex-1 min-w-0 rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link.id)}
                      className="flex-shrink-0 rounded-lg border border-border p-1.5 text-destructive transition hover:bg-destructive/10"
                      title="Delete link"
                      aria-label="Delete link"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={handleAddLink}
            className="inline-flex items-center gap-1 rounded-lg border border-primary px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-accent"
          >
            <Plus size={13} />
            <span>Add link</span>
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
    );
  }

  if (layoutId === 'modern-photo') {
    return (
      <div className="resume-header group relative mb-0 pb-0.5">
        {/* Edit trigger button */}
        <button
          type="button"
          data-editor-control="true"
          onClick={() => {
            setFormData(getCleanFormData());
            setIsEditing(true);
          }}
          className="absolute right-0 top-0 flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-1 text-muted-foreground opacity-100 shadow-sm transition [@media(hover:hover)]:hover:text-foreground no-print lg:opacity-0 lg:group-hover:opacity-100"
          title="Edit contact information"
          aria-label="Edit contact information"
        >
          <Pencil size={13} />
        </button>

        <div className="flex items-center gap-4 text-left">
          {/* 3:4 Profile Photo */}
          <div className="w-[66px] h-[88px] sm:w-[72px] sm:h-[96px] aspect-[3/4] rounded-sm overflow-hidden border border-slate-300 bg-slate-100 flex-shrink-0">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt={data.fullName || 'Profile photo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 select-none">
                <UserIcon size={32} />
              </div>
            )}
          </div>

          {/* Right Text Block (Left-Aligned) */}
          <div className="flex-1 min-w-0">
            {/* Full Name */}
            <h1
              className={`text-[17pt] font-bold tracking-tight mb-0.5 leading-tight ${
                isPlaceholder ? 'text-slate-400' : 'text-slate-900'
              }`}
            >
              {data.fullName || 'Your Name'}
            </h1>

            {/* Optional Roles */}
            {displayedRoles && (
              <div className="text-[8.5pt] text-slate-800 font-normal leading-tight mb-1">
                {displayedRoles}
              </div>
            )}

            {/* Contact Line */}
            <div
              className={`text-[8.5pt] flex flex-wrap items-center justify-start gap-x-1 leading-tight ${
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
        </div>
      </div>
    );
  }

  return (
    <div className="resume-header group relative text-center mb-0 pb-0.5">
      {/* Edit trigger button */}
      <button
        type="button"
        data-editor-control="true"
        onClick={() => {
          setFormData(getCleanFormData());
          setIsEditing(true);
        }}
        className="absolute right-0 top-0 flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-1 text-muted-foreground opacity-100 shadow-sm transition [@media(hover:hover)]:hover:text-foreground no-print lg:opacity-0 lg:group-hover:opacity-100"
        title="Edit contact information"
          aria-label="Edit contact information"
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

