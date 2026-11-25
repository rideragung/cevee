import React from 'react';
import type { ReactNode } from 'react';
import {
  ResumeDocument,
  HeaderData,
  ResumeLanguage,
  ResumeSection,
  SkillCategory,
  ExperienceItem,
  ExperiencePosition,
  ProjectItem,
  EducationItem,
  CustomSectionItem,
} from '../../types/resume';
import { IconExternalLink as ExternalLink } from '@tabler/icons-react';
import { getWhatsAppUrl } from '../../utils/whatsApp';
import { sortByPeriodDesc } from '../../utils/periodSort';
import { sanitizeHtml } from '../../utils/sanitize';
import {
  detectSectionPresetKey,
  getResumeLocale,
  isHeaderRelocating,
  normalizeResumeLanguage,
  stripCredentialIdPrefix,
  stripGpaPrefix,
} from '../../utils/resumeLocale';
import { parseContentParts, renderContentPart, stripHtml } from '../core/content';
import type { ContentBlock } from '../core/types';
import {
  estimateStandardAtsV2HeaderHeight,
  estimateStandardAtsV2ContentPartHeight,
  estimateStandardAtsV2SummaryHeight,
  estimateStandardAtsV2SkillsCategoryHeight,
} from './metrics';

const REF_CONTENT_PART_CLASSES = {
  list: 'ref-bullet-list',
  orderedList: 'ref-ordered-list',
  paragraph: 'ref-para',
} as const;

const REF_EDU_CONTENT_PART_CLASSES = {
  list: 'ref-bullet-list',
  orderedList: 'ref-ordered-list',
  paragraph: 'ref-para ref-edu-para',
} as const;

const estimateStandardAtsV2CustomItemHeight = (
  item: CustomSectionItem,
  section: Pick<ResumeSection, 'title' | 'type' | 'presetKey'>,
  isPlaceholder?: boolean
): number => {
  if (isPlaceholder) return 25.22;
  const presetKey = detectSectionPresetKey(section);
  if (
    presetKey === 'certifications' ||
    presetKey === 'languages' ||
    presetKey === 'references'
  ) {
    return 16.8135;
  }
  const text = stripHtml(item?.description || '');
  const lines = text ? Math.max(1, Math.ceil(text.length / 134)) : 0;
  return 16.8135 + lines * 16.8135;
};

const renderStandardAtsV2Header = (header: HeaderData, language?: ResumeLanguage): ReactNode => {
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
  const usableLinks = (header.links || []).filter((l) => l.label || l.url);
  const placeholderClass = header.isPlaceholder ? ' text-slate-400' : '';

  return (
    <div className="ref-header">
      <h1 className={`ref-name${placeholderClass}`}>{header.fullName || locale.placeholderName}</h1>

      {displayedRoles && <div className={`ref-roles${placeholderClass}`}>{displayedRoles}</div>}

      <div className={`ref-contact-row${placeholderClass}`}>
        <span>{header.location || locale.placeholderLocation}</span>
        {isRelocating && locale.relocatePipe}

        <span className="ref-sep"> • </span>
        <a href={header.email ? `mailto:${header.email}` : '#'} className="ref-mail">
          {header.email || locale.placeholderEmail}
        </a>

        <span className="ref-sep"> • </span>
        <a
          href={header.phone ? getWhatsAppUrl(header.phone) : '#'}
          target="_blank"
          rel="noreferrer"
          className="ref-mail"
          title="Contact via WhatsApp"
        >
          {header.phone || locale.placeholderPhone}
        </a>

        {usableLinks.map((link, idx) => (
          <React.Fragment key={link.id || idx}>
            <span className="ref-sep"> • </span>
            <a
              href={link.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="ref-link"
              title={link.url || link.label}
              aria-label={link.url ? `${link.label || 'Link'}: ${link.url}` : link.label}
            >
              {link.label || link.url}
            </a>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const buildStandardAtsV2Blocks = (resume: ResumeDocument): ContentBlock[] => {
  const { header, sections } = resume.content;
  const language = normalizeResumeLanguage(resume.content.language);
  const locale = getResumeLocale(language);
  const list: ContentBlock[] = [];

  // 1. Header Block
  list.push({
    id: 'block-header',
    type: 'header',
    height: estimateStandardAtsV2HeaderHeight(header, language),
    render: () => renderStandardAtsV2Header(header, language),
  });

  // 2. Sections
  sections.forEach((section) => {
    const shouldShowTitle = section.showTitle ?? section.type !== 'summary';

    // Section title
    if (shouldShowTitle) {
      list.push({
        id: `title-${section.id}`,
        type: 'section-title',
        height: 32.56,
        render: () => (
          <div className="ref-heading-wrap">
            <h2 className="ref-heading">{section.title}</h2>
          </div>
        ),
      });
    }

    if (section.type === 'summary') {
      const summaryData = section.data;
      list.push({
        id: `content-${section.id}`,
        type: 'summary',
        height: estimateStandardAtsV2SummaryHeight(summaryData.html, section.isPlaceholder),
        render: () => (
          <div className="">
            {section.isPlaceholder ? (
              <p className="text-slate-400">
                {locale.placeholderSummary}
              </p>
            ) : (
              <div className="ref-para" dangerouslySetInnerHTML={{ __html: sanitizeHtml(summaryData.html) }} />
            )}
          </div>
        ),
      });
    } else if (section.type === 'skills') {
      if (section.isPlaceholder) {
        list.push({
          id: `content-${section.id}`,
          type: 'skills',
          height: 37.83,
          render: () => (
            <div className="ref-skill-cat text-slate-400">
              <span className="ref-skill-label">{locale.placeholderSkillCategory}</span>
              <span>{locale.placeholderSkillItems}</span>
            </div>
          ),
        });
      } else {
        const cats = (section.data as { categories?: SkillCategory[] }).categories || [];
        cats.forEach((cat: SkillCategory, catIdx: number) => {
          const catHeight = estimateStandardAtsV2SkillsCategoryHeight(cat.category || '', cat.items || '');

          list.push({
            id: `content-${section.id}-cat-${cat.id || catIdx}`,
            type: 'skills',
            height: catHeight,
            render: () => (
              <div className="ref-skill-cat">
                <span className="ref-skill-label">{cat.category}:{' '}</span>
                <span>{cat.items}</span>
              </div>
            ),
          });
        });
      }
    } else if (section.type === 'experience') {
      if (section.isPlaceholder) {
        list.push({
          id: `item-${section.id}-placeholder`,
          type: 'item',
          height: 42.44,
          render: () => (
            <div className="text-slate-400">
              <div className="flex justify-between items-baseline font-bold leading-snug">
                <span className="text-slate-400">{locale.placeholderPosition}</span>
                <span className="text-[7.75pt] font-semibold text-slate-400">{locale.placeholderPeriod}</span>
              </div>
              <div className="flex justify-between items-baseline leading-snug text-[8pt]">
                <span className="font-semibold text-slate-400">{locale.placeholderCompany}</span>
                <span className="text-slate-400">{locale.placeholderLocation}</span>
              </div>
              <div className="text-slate-400 text-justify mt-0.5 text-[7.75pt] leading-[1.48]">
                {locale.placeholderExpDesc}
              </div>
            </div>
          ),
        });
      } else {
        sortByPeriodDesc((section.data as { items?: ExperienceItem[] }).items || []).forEach((item: ExperienceItem) => {
          const hasMultiPositions = item.positions && item.positions.length > 1;

          if (hasMultiPositions) {
            const sortedPositions = sortByPeriodDesc(item.positions || []);
            list.push({
              id: `item-${section.id}-${item.id}-company`,
              type: 'item-head',
              height: 17,
              render: () => (
                <div className="ref-row">
                  <span>{item.company}</span>
                  <span>{item.location}</span>
                </div>
              ),
            });

            sortedPositions.forEach((pos: ExperiencePosition, posIdx: number) => {
              const positionBullets = parseContentParts(pos.bullets || '');

              list.push({
                id: `item-${section.id}-${item.id}-pos-${pos.id || posIdx}-head`,
                type: 'item-subhead',
                height: 17,
                render: () => (
                  <div className="ref-row">
                    <span>{pos.role}</span>
                    <span>{pos.period}</span>
                  </div>
                ),
              });

              positionBullets.forEach((part, bIdx: number) => {
                list.push({
                  id: `item-${section.id}-${item.id}-pos-${pos.id || posIdx}-b-${bIdx}`,
                  type: 'item-bullet',
                  height: estimateStandardAtsV2ContentPartHeight(part),
                  render: () => (
                    <div className="ref-part">{renderContentPart(part, REF_CONTENT_PART_CLASSES)}</div>
                  ),
                });
              });
            });
            return;
          }

          const itemBullets = parseContentParts(item.bullets || '');

          list.push({
            id: `item-${section.id}-${item.id}-head`,
            type: 'item-head',
            height: 34,
            render: () => (
              <>
                <div className="ref-row">
                  <span>{item.role}</span>
                  <span>{item.period}</span>
                </div>
                <div className="ref-row">
                  <span>{item.company}</span>
                  <span>{item.location}</span>
                </div>
              </>
            ),
          });

          itemBullets.forEach((part, bIdx: number) => {
            list.push({
              id: `item-${section.id}-${item.id}-b-${bIdx}`,
              type: 'item-bullet',
              height: estimateStandardAtsV2ContentPartHeight(part),
              render: () => (
                <div className="ref-part">{renderContentPart(part, REF_CONTENT_PART_CLASSES)}</div>
              ),
            });
          });
        });
      }
    } else if (section.type === 'projects') {
      if (section.isPlaceholder) {
        list.push({
          id: `item-${section.id}-placeholder`,
          type: 'item',
          height: 29.83,
          render: () => (
            <div className="text-slate-400">
              <div className="flex justify-between items-baseline leading-snug">
                <span className="font-bold text-slate-400 inline-flex items-center gap-1">
                  <span>{locale.placeholderProjectName}</span>
                  <span className="text-[7.75pt] underline">({locale.placeholderProjectLink})</span>
                  <ExternalLink size={11} className="inline opacity-70 flex-shrink-0 text-slate-400" />
                </span>
                <span className="font-semibold text-slate-400 text-[8.41pt]">{locale.placeholderPeriod}</span>
              </div>
              <div className="text-slate-400 mt-0.5 text-left text-[8.41pt] leading-[12.61pt]">
                {locale.placeholderProjectDesc}
              </div>
            </div>
          ),
        });
      } else {
        sortByPeriodDesc((section.data as { items?: ProjectItem[] }).items || []).forEach((item: ProjectItem) => {
          const itemBullets = parseContentParts(item.bullets || '');

          list.push({
            id: `item-${section.id}-${item.id}-head`,
            type: 'item-head',
            height: 17,
            render: () => (
              <div className="ref-row">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ref-mail hover:underline"
                    title={item.url}
                  >
                    <span>{item.name}</span>{' '}
                    <ExternalLink size={10.72} className="ref-ext-icon" />
                  </a>
                ) : (
                  <span>{item.name}</span>
                )}
                <span>{item.period}</span>
              </div>
            ),
          });

          itemBullets.forEach((part, bIdx: number) => {
            list.push({
              id: `item-${section.id}-${item.id}-b-${bIdx}`,
              type: 'item-bullet',
              height: estimateStandardAtsV2ContentPartHeight(part),
              render: () => (
                <div className="ref-part">{renderContentPart(part, REF_CONTENT_PART_CLASSES)}</div>
              ),
            });
          });
        });
      }
    } else if (section.type === 'education') {
      if (section.isPlaceholder) {
        list.push({
          id: `item-${section.id}-placeholder`,
          type: 'item',
          height: 69.66,
          render: () => (
            <div className="text-slate-400 space-y-0.5">
              <div className="ref-row">
                <span className="font-bold text-slate-400 inline-flex items-center gap-1">
                  <span>{locale.placeholderDegree}</span>
                  <span className="font-normal text-slate-400">•</span>
                  <span className="text-[7.75pt] underline font-normal">{locale.placeholderTranscript}</span>
                  <ExternalLink size={11} className="inline opacity-70 flex-shrink-0 text-slate-400" />
                </span>
                <span className="font-semibold text-slate-400 text-[8.41pt]">{locale.placeholderPeriod}</span>
              </div>
              <div className="ref-row ref-row-plain">
                <span>{locale.placeholderInstitution}</span>
                <span className="font-medium text-slate-400">{locale.placeholderGpa}</span>
              </div>
              <div className="ref-para ref-edu-para text-justify text-slate-400 text-[8.41pt] leading-[12.61pt]">
                <span className="font-bold text-slate-400">{locale.relatedCourseworkLabel}</span>
                {locale.placeholderCoursework}
              </div>
              <div className="ref-para ref-edu-para text-justify text-slate-400 text-[8.41pt] leading-[12.61pt]">
                <span className="font-bold text-slate-400">{locale.finalThesisLabel}</span>
                <span className="underline">{locale.placeholderThesis}</span>
              </div>
              <div className="ref-para ref-edu-para text-slate-400 text-[8.41pt] leading-[12.61pt]">
                {locale.placeholderEduNote}
              </div>
            </div>
          ),
        });
      } else {
        sortByPeriodDesc((section.data as { items?: EducationItem[] }).items || []).forEach((item: EducationItem) => {
          const descBlocks = parseContentParts(item.description || '');

          list.push({
            id: `item-${section.id}-${item.id}-head`,
            type: 'item-head',
            height: 34,
            render: () => (
              <>
                <div className="ref-row">
                  <span>
                    <span>{item.degree}</span>
                    {item.url && (
                      <>
                        {item.urlLabel ? (
                          <>
                            <span className="ref-sep"> • </span>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="ref-mail hover:underline inline-flex items-center gap-0.5"
                              title={item.url}
                              aria-label={item.urlLabel}
                            >
                              <span>{item.urlLabel}</span>
                              <ExternalLink size={10.72} className="ref-ext-icon" />
                            </a>
                          </>
                        ) : (
                          <>
                            {' '}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="ref-mail hover:underline inline-flex items-center"
                              title={item.url}
                              aria-label="Education document link"
                            >
                              <ExternalLink size={10.72} className="ref-ext-icon" />
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </span>
                  <span>{item.period}</span>
                </div>
                <div className="ref-row ref-row-plain">
                  <span>{item.institution}</span>
                  {item.gpa && (
                    <span>
                      <span className="ref-gpa-label">{locale.gpaLabel}</span>
                      {stripGpaPrefix(item.gpa)}
                    </span>
                  )}
                </div>
              </>
            ),
          });

          if (item.relatedCoursework) {
            const cwText = `${locale.relatedCourseworkLabel}${item.relatedCoursework}`;
            const lines = Math.max(1, Math.ceil(cwText.length / 134));
            list.push({
              id: `item-${section.id}-${item.id}-coursework`,
              type: 'item-bullet',
              height: lines * 16.8135,
              render: () => (
                <div className="ref-part">
                  <div className="ref-para ref-edu-para text-justify">
                    <span className="font-bold">{locale.relatedCourseworkLabel}</span>
                    <span>{item.relatedCoursework}</span>
                  </div>
                </div>
              ),
            });
          }

          if (item.thesisTitle) {
            const thText = `${locale.finalThesisLabel}${item.thesisTitle}`;
            const lines = Math.max(1, Math.ceil(thText.length / 134));
            list.push({
              id: `item-${section.id}-${item.id}-thesis`,
              type: 'item-bullet',
              height: lines * 16.8135,
              render: () => (
                <div className="ref-part">
                  <div className="ref-para ref-edu-para text-justify">
                    <span className="font-bold">{locale.finalThesisLabel}</span>
                    {item.thesisUrl ? (
                      <a
                        href={item.thesisUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ref-mail hover:underline"
                        title={item.thesisUrl}
                      >
                        {item.thesisTitle}
                      </a>
                    ) : (
                      <span>{item.thesisTitle}</span>
                    )}
                  </div>
                </div>
              ),
            });
          }

          descBlocks.forEach((part, bIdx: number) => {
            list.push({
              id: `item-${section.id}-${item.id}-d-${bIdx}`,
              type: 'item-bullet',
              height: estimateStandardAtsV2ContentPartHeight(part),
              render: () => (
                <div className="ref-part">{renderContentPart(part, REF_EDU_CONTENT_PART_CLASSES)}</div>
              ),
            });
          });
        });
      }
    } else {
      // Custom Section (Certifications, Languages, Publications, Awards, References, etc.)
      const presetKey = detectSectionPresetKey(section);
      const isCert = presetKey === 'certifications';
      const isLang = presetKey === 'languages';
      const isPub = presetKey === 'publications';
      const isAward = presetKey === 'awards';
      const isRef = presetKey === 'references';

      if (section.isPlaceholder) {
        list.push({
          id: `item-${section.id}-placeholder`,
          type: 'item',
          height: 17.22,
          render: () => (
            <div className="text-slate-400 space-y-1">
              {isCert && (
                <div className="flex justify-between items-baseline leading-snug">
                  <div>
                    <span className="font-bold text-slate-400">{locale.placeholderCertTitle}</span>
                    <span className="font-normal text-slate-400">{locale.certByConnector}</span>
                    <span className="font-bold text-slate-400">{locale.placeholderCertIssuer}</span>
                  </div>
                  <span className="text-[7.75pt] font-bold text-slate-400">{locale.placeholderCertPeriod}</span>
                </div>
              )}
              {isLang && (
                <div className="text-slate-400 text-[7.75pt] leading-snug">
                  {locale.placeholderLanguages.map((langItem, lIdx) => (
                    <React.Fragment key={langItem.name}>
                      {lIdx > 0 && ' • '}
                      <span className="font-bold text-slate-400">{langItem.name}</span> ({langItem.proficiency})
                    </React.Fragment>
                  ))}
                </div>
              )}
              {isPub && (
                <div>
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span className="text-slate-400">{locale.placeholderPubTitle}</span>
                    <span className="text-[7.75pt] font-semibold text-slate-400">{locale.placeholderPubPeriod}</span>
                  </div>
                  <div className="text-slate-400 text-[7.75pt] leading-relaxed mt-0.5">
                    {locale.placeholderPubDesc}
                  </div>
                </div>
              )}
              {isAward && (
                <div>
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span className="text-slate-400">{locale.placeholderAwardTitle}</span>
                    <span className="text-[7.75pt] font-semibold text-slate-400">{locale.placeholderAwardPeriod}</span>
                  </div>
                  <div className="text-slate-400 text-[7.75pt] leading-relaxed mt-0.5">
                    {locale.placeholderAwardDesc}
                  </div>
                </div>
              )}
              {isRef && (
                <div className="text-slate-400 text-[7.75pt] leading-snug">
                  <span className="font-bold text-slate-400">{locale.placeholderRefName}</span> ({locale.placeholderRefRole}) • {locale.placeholderRefContact}
                </div>
              )}
              {!isCert && !isLang && !isPub && !isAward && !isRef && (
                <div>
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span className="text-slate-400">{locale.placeholderAwardTitle}</span>
                    <span className="text-[7.75pt] font-semibold text-slate-400">{locale.placeholderAwardPeriod}</span>
                  </div>
                </div>
              )}
            </div>
          ),
        });
      } else {
        sortByPeriodDesc((section.data as { items?: CustomSectionItem[] }).items || []).forEach((item: CustomSectionItem) => {
          list.push({
            id: `item-${section.id}-${item.id}`,
            type: 'item',
            height: estimateStandardAtsV2CustomItemHeight(item, section, false),
            render: () => {
              if (isCert) {
                const rawDesc = item.description || '';
                const isUrlDesc =
                  rawDesc.startsWith('http') ||
                  rawDesc.includes('.com') ||
                  rawDesc.includes('.id') ||
                  rawDesc.includes('.org');
                const credUrl = item.credentialUrl || (isUrlDesc ? rawDesc : '');
                const rawCredId =
                  item.credentialId || (!isUrlDesc ? stripCredentialIdPrefix(rawDesc) : '');

                const certContent = (
                  <>
                    <span className="font-bold">{item.title}</span>
                    {rawCredId && <span className="font-bold"> ({locale.credentialIdLabel}: {rawCredId})</span>}
                    {item.subtitle && (
                      <>
                        <span className="font-normal">{locale.certByConnector}</span>
                        <span className="font-bold">{item.subtitle}</span>
                      </>
                    )}
                  </>
                );

                return (
                  <div className="ref-row">
                    {credUrl ? (
                      <a
                        href={credUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ref-mail hover:underline"
                        title={credUrl}
                      >
                        {certContent}
                      </a>
                    ) : (
                      <div className="">{certContent}</div>
                    )}
                    {item.period && <span className="whitespace-nowrap">{item.period}</span>}
                  </div>
                );
              }

              if (isLang) {
                return (
                  <div className="ref-part text-[#1F2937] text-[8.41pt]">
                    <span className="font-bold">{item.title}</span>
                    {item.subtitle && ` (${item.subtitle})`}
                  </div>
                );
              }

              if (isRef) {
                return (
                  <div className="ref-part text-[#1F2937] text-[8.41pt]">
                    <span className="font-bold">{item.title}</span>
                    {item.subtitle && ` (${item.subtitle})`}
                    {item.period && ` • ${item.period}`}
                  </div>
                );
              }

              return (
                <div className="ref-part">
                  <div className="ref-row">
                    <span>
                      {item.title}
                      {item.subtitle && ` (${item.subtitle})`}
                    </span>
                    {item.period && <span className="">{item.period}</span>}
                  </div>
                  {item.description && <div className="ref-para">{item.description}</div>}
                </div>
              );
            },
          });
        });
      }
    }
  });

  return list;
};
