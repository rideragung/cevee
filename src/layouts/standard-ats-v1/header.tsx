import React from 'react';
import type { ReactNode } from 'react';
import { HeaderData, ResumeLanguage } from '../../types/resume';
import { getWhatsAppUrl } from '../../utils/whatsApp';
import { getResumeLocale, isHeaderRelocating } from '../../utils/resumeLocale';

export const estimateStandardAtsV1HeaderHeight = (
  header: HeaderData,
  language?: ResumeLanguage
): number => {
  const locale = getResumeLocale(language);
  const isRelocating = isHeaderRelocating(header);
  let height = 32; // Nama
  if (header.headline || (header.roles && header.roles.length > 0)) {
    height += 18;
  }
  const linksCount = header.links?.length || 0;
  const contactTextLen =
    (header.location?.length || locale.placeholderLocation.length) +
    (isRelocating ? locale.relocateParen.length : 0) +
    (header.email?.length || locale.placeholderEmail.length) +
    (header.phone?.length || locale.placeholderPhone.length) +
    linksCount * 22;
  const contactLines = Math.max(1, Math.ceil(contactTextLen / 95));
  height += contactLines * 16;
  height += 2; // pb-0.5
  return Math.max(55, height);
};

export const renderStandardAtsV1Header = (
  header: HeaderData,
  language?: ResumeLanguage
): ReactNode => {
  const locale = getResumeLocale(language);
  const activeRoles = (
    header.roles && header.roles.length > 0
      ? header.roles
      : header.headline
        ? header.headline.split('|').map((s) => s.trim())
        : []
  ).filter(Boolean);
  const displayedRoles = activeRoles.join(' | ');
  const isRelocating = isHeaderRelocating(header);

  return (
    <div className="resume-header text-center mb-0 pb-0.5">
      <h1
        className={`text-[17pt] font-bold tracking-normal mb-0.5 leading-tight ${
          header.isPlaceholder ? 'text-slate-400' : 'text-slate-900'
        }`}
        style={{ letterSpacing: 'normal' }}
      >
        {header.fullName || locale.placeholderName}
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
          {header.location || locale.placeholderLocation}
          {isRelocating && locale.relocateParen}
        </span>

        <span>•</span>
        <a
          href={header.email ? `mailto:${header.email}` : '#'}
          className={`underline ${header.isPlaceholder ? 'text-slate-400' : 'text-slate-800'}`}
        >
          {header.email || locale.placeholderEmail}
        </a>

        <span>•</span>
        <a
          href={header.phone ? getWhatsAppUrl(header.phone) : '#'}
          target="_blank"
          rel="noreferrer"
          className={`underline ${header.isPlaceholder ? 'text-slate-400' : 'text-slate-800'}`}
          title="Contact via WhatsApp"
        >
          {header.phone || locale.placeholderPhone}
        </a>

        {header.links &&
          header.links
            .filter((link) => link.label || link.url)
            .map((link) => (
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
