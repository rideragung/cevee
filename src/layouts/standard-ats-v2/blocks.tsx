import React from 'react';
import type { ReactNode } from 'react';
import {
  ResumeDocument,
  HeaderData,
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
import { formatDisplayUrl } from '../../utils/formatUrl';
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

const estimateStandardAtsV2CustomItemHeight = (
  item: CustomSectionItem,
  sectionTitle: string,
  isPlaceholder?: boolean
): number => {
  if (isPlaceholder) return 25.22;
  const upper = (sectionTitle || '').toUpperCase();
  if (upper.includes('CERTIFICATION') || upper.includes('LANGUAGE') || upper.includes('REFERENCE')) {
    return 16.8135;
  }
  const text = stripHtml(item?.description || '');
  const lines = text ? Math.max(1, Math.ceil(text.length / 134)) : 0;
  return 16.8135 + lines * 16.8135;
};

const renderStandardAtsV2Header = (header: HeaderData): ReactNode => {
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
  const usableLinks = (header.links || []).filter((l) => l.label || l.url);
  const placeholderClass = header.isPlaceholder ? ' text-slate-400' : '';

  return (
    <div className="ref-header">
      <h1 className={`ref-name${placeholderClass}`}>{header.fullName || 'Your Name'}</h1>

      {displayedRoles && <div className={`ref-roles${placeholderClass}`}>{displayedRoles}</div>}

      <div className={`ref-contact-row${placeholderClass}`}>
        <span>{header.location || 'City, State/Country'}</span>
        {isRelocating && ' | Willing to relocate'}

        <span className="ref-sep"> • </span>
        <a href={header.email ? `mailto:${header.email}` : '#'} className="ref-mail">
          {header.email || 'email@address.com'}
        </a>

        <span className="ref-sep"> • </span>
        <a
          href={header.phone ? getWhatsAppUrl(header.phone) : '#'}
          target="_blank"
          rel="noreferrer"
          className="ref-mail"
          title="Contact via WhatsApp"
        >
          {header.phone || '+65 1234 5678'}
        </a>

        {usableLinks.map((link, idx) => (
          <React.Fragment key={link.id || idx}>
            <span className="ref-sep"> • </span>
            <a href={link.url || '#'} target="_blank" rel="noreferrer" className="ref-link">
              {formatDisplayUrl(link.url, link.label)}
            </a>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const buildStandardAtsV2Blocks = (resume: ResumeDocument): ContentBlock[] => {
  const { header, sections } = resume.content;
  const list: ContentBlock[] = [];

  // 1. Header Block
  list.push({
    id: 'block-header',
    type: 'header',
    height: estimateStandardAtsV2HeaderHeight(header),
    render: () => renderStandardAtsV2Header(header),
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
                Results-driven professional with proven experience delivering impactful solutions and collaborating across multidisciplinary teams. Skilled in problem-solving, project execution, and standardizing workflows that drive measurable business outcomes. Passionate about continuous learning and contributing to high-performing product environments.
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
              <span className="ref-skill-label">Skill Category: </span>
              <span>Skill Name 1, Skill Name 2, Skill Name 3, Skill Name 4, Skill Name 5, etc</span>
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
                <span className="text-slate-400">Position</span>
                <span className="text-[7.75pt] font-semibold text-slate-400">May 2022 - Present</span>
              </div>
              <div className="flex justify-between items-baseline leading-snug text-[8pt]">
                <span className="font-semibold text-slate-400">Company Name</span>
                <span className="text-slate-400">City, State/Country</span>
              </div>
              <div className="text-slate-400 text-justify mt-0.5 text-[7.75pt] leading-[1.48]">
                State your tasks and accomplishments including name of the project and position of responsibility held.
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
                  <span>Project Name</span>
                  <span className="text-[7.75pt] underline">(project link)</span>
                  <ExternalLink size={11} className="inline opacity-70 flex-shrink-0 text-slate-400" />
                </span>
                <span className="font-semibold text-slate-400 text-[8.41pt]">May 2022 - Present</span>
              </div>
              <div className="text-slate-400 mt-0.5 text-left text-[8.41pt] leading-[12.61pt]">
                State your tasks and accomplishments including name of the project and position of responsibility held.
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
              <div className="flex justify-between items-baseline leading-snug">
                <span className="font-bold text-slate-400 inline-flex items-center gap-1">
                  <span>Bachelor of Computer Science</span>
                  <span className="font-normal text-slate-400">•</span>
                  <span className="text-[7.75pt] underline font-normal">(Transcript)</span>
                  <ExternalLink size={11} className="inline opacity-70 flex-shrink-0 text-slate-400" />
                </span>
                <span className="font-semibold text-slate-400 text-[8.41pt]">May 2022 - Present</span>
              </div>
              <div className="flex justify-between items-baseline leading-snug text-[8.41pt]">
                <span>Name of the Educational Institution</span>
                <span className="font-medium text-slate-400">GPA: 4.0 of 4.0</span>
              </div>
              <div className="text-slate-400 text-justify text-[8.41pt] leading-[12.61pt]">
                <span className="font-bold text-slate-400">Related Coursework: </span>
                Data Structures, Algorithms, Software Engineering, Database Systems
              </div>
              <div className="text-slate-400 text-justify text-[8.41pt] leading-[12.61pt]">
                <span className="font-bold text-slate-400">Final Thesis: </span>
                <span className="underline">Design and Implementation of Distributed Real-Time Systems</span>
              </div>
              <div className="text-slate-400 text-[8.41pt] leading-[12.61pt]">
                E.g., info about scholarships, student activity, etc.
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
                      <span className="ref-gpa-label">GPA: </span>
                      {item.gpa.replace(/^\s*GPA\s*:\s*/i, '')}
                    </span>
                  )}
                </div>
              </>
            ),
          });

          if (item.relatedCoursework) {
            const cwText = `Related Coursework: ${item.relatedCoursework}`;
            const lines = Math.max(1, Math.ceil(cwText.length / 134));
            list.push({
              id: `item-${section.id}-${item.id}-coursework`,
              type: 'item-bullet',
              height: lines * 16.8135,
              render: () => (
                <div className="ref-part">
                  <div className="ref-para text-justify">
                    <span className="font-bold">Related Coursework: </span>
                    <span>{item.relatedCoursework}</span>
                  </div>
                </div>
              ),
            });
          }

          if (item.thesisTitle) {
            const thText = `Final Thesis: ${item.thesisTitle}`;
            const lines = Math.max(1, Math.ceil(thText.length / 134));
            list.push({
              id: `item-${section.id}-${item.id}-thesis`,
              type: 'item-bullet',
              height: lines * 16.8135,
              render: () => (
                <div className="ref-part">
                  <div className="ref-para text-justify">
                    <span className="font-bold">Final Thesis: </span>
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
                <div className="ref-part">{renderContentPart(part, REF_CONTENT_PART_CLASSES)}</div>
              ),
            });
          });
        });
      }
    } else {
      // Custom Section (Certifications, Languages, Publications, Awards, References, etc.)
      const isCert = section.title.toUpperCase().includes('CERTIFICATION');
      const isLang = section.title.toUpperCase().includes('LANGUAGE');
      const isPub = section.title.toUpperCase().includes('PUBLICATION');
      const isAward = section.title.toUpperCase().includes('AWARD');
      const isRef = section.title.toUpperCase().includes('REFERENCE');

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
                    <span className="font-bold text-slate-400">Learn Basic AI (Credential ID: 6RPNR3EJ9X2M)</span>
                    <span className="font-normal text-slate-400"> by </span>
                    <span className="font-bold text-slate-400">Dicoding Indonesia</span>
                  </div>
                  <span className="text-[7.75pt] font-bold text-slate-400">Jan 2025 – Jan 2028</span>
                </div>
              )}
              {isLang && (
                <div className="text-slate-400 text-[7.75pt] leading-snug">
                  <span className="font-bold text-slate-400">Bahasa Indonesia</span> (Native proficiency) •{' '}
                  <span className="font-bold text-slate-400">Vietnamese</span> (Full working proficiency) •{' '}
                  <span className="font-bold text-slate-400">English</span> (Professional working proficiency)
                </div>
              )}
              {isPub && (
                <div>
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span className="text-slate-400">Publication Title (Publisher)</span>
                    <span className="text-[7.75pt] font-semibold text-slate-400">May 2022</span>
                  </div>
                  <div className="text-slate-400 text-[7.75pt] leading-relaxed mt-0.5">
                    Provide a brief overview of the research, emphasizing significant findings...
                  </div>
                </div>
              )}
              {isAward && (
                <div>
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span className="text-slate-400">Title (Issuer)</span>
                    <span className="text-[7.75pt] font-semibold text-slate-400">May 2022</span>
                  </div>
                  <div className="text-slate-400 text-[7.75pt] leading-relaxed mt-0.5">
                    Write a concise description of the award, highlighting key achievements...
                  </div>
                </div>
              )}
              {isRef && (
                <div className="text-slate-400 text-[7.75pt] leading-snug">
                  <span className="font-bold text-slate-400">Richard Hendricks</span> (Co-founder of Pipe Piper) • richard@piedpiper.com
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
            height: estimateStandardAtsV2CustomItemHeight(item, section.title, false),
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
                  item.credentialId || (!isUrlDesc ? rawDesc.replace(/^Credential ID:\s*/i, '') : '');

                const certContent = (
                  <>
                    <span className="font-bold">{item.title}</span>
                    {rawCredId && <span className="font-bold"> (Credential ID: {rawCredId})</span>}
                    {item.subtitle && (
                      <>
                        <span className="font-normal"> by </span>
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
