import React from 'react';
import type { ReactNode } from 'react';
import { HeaderData } from '../../types/resume';
import { User as UserIcon } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/whatsApp';

export const estimateModernPhotoHeaderHeight = (header: HeaderData): number => {
  let height = 32; // Nama
  if (header.headline || (header.roles && header.roles.length > 0)) {
    height += 18;
  }
  const linksCount = header.links?.length || 0;
  const contactTextLen =
    (header.location?.length || 0) + (header.email?.length || 0) + (header.phone?.length || 0) + linksCount * 22;
  const contactLines = Math.max(1, Math.ceil(contactTextLen / 76));
  height += contactLines * 16;
  height += 2; // pb-0.5
  return Math.max(104, height);
};

export const renderModernPhotoHeader = (header: HeaderData): ReactNode => {
  const activeRoles = (
    header.roles && header.roles.length > 0
      ? header.roles
      : header.headline
        ? header.headline.split('|').map((s) => s.trim())
        : []
  ).filter(Boolean);
  const displayedRoles = activeRoles.join(' | ');
  const isRelocating =
    header.willingToRelocate ?? (header.relocationStatus && header.relocationStatus.includes('Willing'));

  return (
    <div className="resume-header mb-0 pb-0.5">
      <div className="flex items-center gap-4 text-left">
        {/* 3:4 Profile Photo */}
        <div className="w-[66px] h-[88px] sm:w-[72px] sm:h-[96px] aspect-[3/4] rounded-sm overflow-hidden border border-slate-300 bg-slate-100 flex-shrink-0">
          {header.photoUrl ? (
            <img
              src={header.photoUrl}
              alt={header.fullName || 'Profile photo'}
              className="w-full h-full object-cover block"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 select-none">
              <UserIcon size={32} />
            </div>
          )}
        </div>

        {/* Right Text Block (Left-Aligned) */}
        <div className="flex-1 min-w-0">
          <h1
            className={`text-[17pt] font-bold tracking-tight mb-0.5 leading-tight ${
              header.isPlaceholder ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            {header.fullName || 'Your Name'}
          </h1>

          {displayedRoles && (
            <div className="text-[8.5pt] text-slate-800 font-normal leading-tight mb-1">
              {displayedRoles}
            </div>
          )}

          <div
            className={`text-[8.5pt] flex flex-wrap items-center justify-start gap-x-1 leading-tight ${
              header.isPlaceholder ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            <span>{header.location || 'City, State/Country'}</span>
            {isRelocating && ' (Willing to relocate)'}

            <span>•</span>
            <a
              href={header.email ? `mailto:${header.email}` : '#'}
              className={`underline ${header.isPlaceholder ? 'text-slate-400' : 'text-slate-800'}`}
            >
              {header.email || 'email@address.com'}
            </a>

            <span>•</span>
            <a
              href={header.phone ? getWhatsAppUrl(header.phone) : '#'}
              target="_blank"
              rel="noreferrer"
              className={`underline ${header.isPlaceholder ? 'text-slate-400' : 'text-slate-800'}`}
              title="Contact via WhatsApp"
            >
              {header.phone || '+65 1234 5678'}
            </a>

            {header.links &&
              header.links.map((link) => (
                <React.Fragment key={link.id}>
                  <span>•</span>
                  <a
                    href={link.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`underline inline-flex items-center ${
                      header.isPlaceholder ? 'text-slate-400' : 'text-slate-800'
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
};
