import React from 'react';
import type { ReactNode } from 'react';
import { HeaderData } from '../../types/resume';
import { getWhatsAppUrl } from '../../utils/whatsApp';

export const estimateStandardAtsV1HeaderHeight = (header: HeaderData): number => {
  let height = 32; // Nama
  if (header.headline || (header.roles && header.roles.length > 0)) {
    height += 18;
  }
  const linksCount = header.links?.length || 0;
  const contactTextLen =
    (header.location?.length || 0) + (header.email?.length || 0) + (header.phone?.length || 0) + linksCount * 22;
  const contactLines = Math.max(1, Math.ceil(contactTextLen / 95));
  height += contactLines * 16;
  height += 2; // pb-0.5
  return Math.max(55, height);
};

export const renderStandardAtsV1Header = (header: HeaderData): ReactNode => {
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
    <div className="resume-header text-center mb-0 pb-0.5">
      <h1
        className={`text-[17pt] font-bold tracking-normal mb-0.5 leading-tight ${
          header.isPlaceholder ? 'text-slate-400' : 'text-slate-900'
        }`}
        style={{ letterSpacing: 'normal' }}
      >
        {header.fullName || 'Your Name'}
      </h1>

      {displayedRoles && (
        <div className="text-[8.5pt] text-slate-800 font-normal leading-tight mb-1">{displayedRoles}</div>
      )}

      <div
        className={`text-[8.5pt] flex flex-wrap items-center justify-center gap-x-1 leading-tight ${
          header.isPlaceholder ? 'text-slate-400' : 'text-slate-700'
        }`}
      >
        <span>
          {header.location || 'City, State/Country'}
          {isRelocating && ' (Willing to relocate)'}
        </span>

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
  );
};
