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
import { ExternalLink } from 'lucide-react';
import { sortByPeriodDesc } from '../../utils/periodSort';
import { sanitizeHtml } from '../../utils/sanitize';
import { parseContentParts, renderContentPart, stripHtml } from '../core/content';
import type { ContentBlock, ContentPart } from '../core/types';

export interface HeaderBlockSpec {
  estimateHeight: (header: HeaderData) => number;
  render: (header: HeaderData) => ReactNode;
}

const CONTENT_PART_CLASSES = {
  list: 'resume-bullet-single text-slate-800 text-justify',
  paragraph: 'resume-paragraph-single text-slate-800 text-justify',
} as const;

// Estimasi tinggi satu bagian konten (list lebih sempit karena indent)
const estimateContentPartHeight = (part: ContentPart): number => {
  const text = stripHtml(part.html);
  const charsPerLine = part.kind === 'list' ? 92 : 95;
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  const lineH = 15.5;
  return lines * lineH + (part.kind === 'list' ? 2.5 : 4);
};

// Estimasi tinggi teks/HTML realistis berbasis font Inter 7.75pt (lebar 184mm, 1 baris ~ 92-95 karakter)
const estimateHtmlHeight = (html: string): number => {
  if (!html || !html.trim()) return 0;

  const liMatches = html.match(/<li[^>]*>[\s\S]*?<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    let totalHeight = 5; // ul top + bottom margins
    for (const li of liMatches) {
      const text = stripHtml(li);
      // Lebar bullet list indent = 673px. Rata-rata 92 karakter per baris (dengan istilah bold)
      const lines = Math.max(1, Math.ceil(text.length / 92));
      totalHeight += lines * 15.5 + 2.5; // line height + li margin-bottom
    }
    return totalHeight;
  }

  const text = stripHtml(html);
  if (!text) return 0;
  const lines = Math.max(1, Math.ceil(text.length / 95));
  return lines * 15.5 + 4;
};

const estimateSummaryHeight = (html: string, isPlaceholder?: boolean): number => {
  if (isPlaceholder) return 48;
  const text = stripHtml(html);
  if (!text) return 0;
  const lines = Math.max(1, Math.ceil(text.length / 135));
  return lines * 15.3 + 4;
};

const estimateSkillsCategoryHeight = (category: string, items: string, isLast: boolean): number => {
  const text = `${category}: ${items}`;
  const lines = Math.max(1, Math.ceil(text.length / 95));
  return lines * 15.5 + (isLast ? 8 : 2);
};

const estimateCustomItemHeight = (
  item: CustomSectionItem,
  sectionTitle: string,
  isPlaceholder?: boolean
): number => {
  if (isPlaceholder) return 24;
  const upper = (sectionTitle || '').toUpperCase();
  if (upper.includes('CERTIFICATION') || upper.includes('LANGUAGE') || upper.includes('REFERENCE')) {
    return 22; // 1 compact line
  }
  let height = 16;
  if (item?.description) {
    height += estimateHtmlHeight(item.description);
  }
  height += 6;
  return Math.max(22, height);
};

export const buildSingleColumnBlocks = (
  resume: ResumeDocument,
  headerSpec: HeaderBlockSpec
): ContentBlock[] => {
  const { header, sections } = resume.content;
  const list: ContentBlock[] = [];

  // 1. Header Block
  list.push({
    id: 'block-header',
    type: 'header',
    height: headerSpec.estimateHeight(header),
    render: () => headerSpec.render(header),
  });

  // 2. Sections
  sections.forEach((section) => {
    const shouldShowTitle = section.showTitle ?? section.type !== 'summary';

    // Section title
    if (shouldShowTitle) {
      list.push({
        id: `title-${section.id}`,
        type: 'section-title',
        height: 25,
        render: () => (
          <div className="resume-section-divider pb-0.5 mb-1.5 mt-2.5 first:mt-0.5 border-b-[0.5px] border-slate-900">
            <h2 className="font-bold uppercase text-[8.5pt] tracking-wider text-slate-900">{section.title}</h2>
          </div>
        ),
      });
    }

    if (section.type === 'summary') {
      const summaryData = section.data;
      list.push({
        id: `content-${section.id}`,
        type: 'summary',
        height: estimateSummaryHeight(summaryData.html, section.isPlaceholder),
        render: () => (
          <div className="mb-1">
            {section.isPlaceholder ? (
              <p className="text-slate-400 text-justify text-[7.75pt] leading-[1.48]">
                Results-driven professional with proven experience delivering impactful solutions and collaborating across multidisciplinary teams. Skilled in problem-solving, project execution, and standardizing workflows that drive measurable business outcomes. Passionate about continuous learning and contributing to high-performing product environments.
              </p>
            ) : (
              <div
                className="resume-summary-text text-justify text-[7.75pt] leading-[1.48] text-slate-800"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(summaryData.html) }}
              />
            )}
          </div>
        ),
      });
    } else if (section.type === 'skills') {
      if (section.isPlaceholder) {
        list.push({
          id: `content-${section.id}`,
          type: 'skills',
          height: 36,
          render: () => (
            <div className="mb-2 leading-snug text-slate-400">
              <span className="font-bold text-slate-400">Skill Category: </span>
              <span>Skill Name 1, Skill Name 2, Skill Name 3, Skill Name 4, Skill Name 5, etc</span>
            </div>
          ),
        });
      } else {
        const cats = (section.data as { categories?: SkillCategory[] }).categories || [];
        cats.forEach((cat: SkillCategory, catIdx: number) => {
          const isLastCat = catIdx === cats.length - 1;
          const catHeight = estimateSkillsCategoryHeight(cat.category || '', cat.items || '', isLastCat);

          list.push({
            id: `content-${section.id}-cat-${cat.id || catIdx}`,
            type: 'skills',
            height: catHeight,
            render: () => (
              <div className={`text-slate-800 leading-snug ${isLastCat ? 'mb-2' : 'mb-0.5'}`}>
                <span className="font-bold text-slate-900">{cat.category}:{' '}</span>
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
          height: 60,
          render: () => (
            <div className="mb-2 text-slate-400">
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
            // Blok 1: nama perusahaan + lokasi (sticky dengan posisi pertama)
            list.push({
              id: `item-${section.id}-${item.id}-company`,
              type: 'item-head',
              height: 20,
              render: () => (
                <div className="flex justify-between items-baseline leading-snug font-bold text-slate-900 text-[8pt]">
                  <span>{item.company}</span>
                  <span className="text-slate-700 text-[8pt]">{item.location}</span>
                </div>
              ),
            });

            sortedPositions.forEach((pos: ExperiencePosition, posIdx: number) => {
              const positionBullets = parseContentParts(pos.bullets || '');
              const isLastPosition = posIdx === sortedPositions.length - 1;

              // Sub-header posisi (role + periode) — sticky dengan bullet pertama
              list.push({
                id: `item-${section.id}-${item.id}-pos-${pos.id || posIdx}-head`,
                type: 'item-subhead',
                height: 16,
                render: () => (
                  <div
                    className={`flex justify-between items-baseline leading-snug ${
                      posIdx > 0 ? 'mt-1.5' : 'mt-0.5'
                    }`}
                  >
                    <span className="font-semibold text-slate-900 text-[7.75pt]">{pos.role}</span>
                    <span className="font-semibold text-slate-800 text-[7.75pt]">{pos.period}</span>
                  </div>
                ),
              });

              positionBullets.forEach((part, bIdx: number) => {
                const isLastBulletOfItem = isLastPosition && bIdx === positionBullets.length - 1;
                list.push({
                  id: `item-${section.id}-${item.id}-pos-${pos.id || posIdx}-b-${bIdx}`,
                  type: 'item-bullet',
                  height: estimateContentPartHeight(part),
                  render: () => (
                    <div className={`${bIdx === 0 ? 'mt-0.5' : ''} ${isLastBulletOfItem ? 'mb-2' : ''}`}>
                      {renderContentPart(part, CONTENT_PART_CLASSES)}
                    </div>
                  ),
                });
              });

              if (positionBullets.length === 0 && isLastPosition) {
                list.push({
                  id: `item-${section.id}-${item.id}-pos-${pos.id || posIdx}-spacer`,
                  type: 'item-bullet',
                  height: 8,
                  render: () => <div className="mb-2" />,
                });
              }
            });
            return;
          }

          const itemBullets = parseContentParts(item.bullets || '');

          // Blok header: role + company (sticky dengan bullet pertama)
          list.push({
            id: `item-${section.id}-${item.id}-head`,
            type: 'item-head',
            height: 34,
            render: () => (
              <>
                <div className="flex justify-between items-baseline font-bold leading-snug text-slate-900">
                  <span>{item.role}</span>
                  <span className="font-semibold text-slate-800 text-[7.75pt]">{item.period}</span>
                </div>
                <div className="flex justify-between items-baseline leading-snug text-slate-800 text-[8pt]">
                  <span className="font-semibold">{item.company}</span>
                  <span className="text-slate-700">{item.location}</span>
                </div>
              </>
            ),
          });

          itemBullets.forEach((part, bIdx: number) => {
            const isLastBulletOfItem = bIdx === itemBullets.length - 1;
            list.push({
              id: `item-${section.id}-${item.id}-b-${bIdx}`,
              type: 'item-bullet',
              height: estimateContentPartHeight(part),
              render: () => (
                <div className={`${bIdx === 0 ? 'mt-0.5' : ''} ${isLastBulletOfItem ? 'mb-2' : ''}`}>
                  {renderContentPart(part, CONTENT_PART_CLASSES)}
                </div>
              ),
            });
          });

          if (itemBullets.length === 0) {
            list.push({
              id: `item-${section.id}-${item.id}-spacer`,
              type: 'item-bullet',
              height: 8,
              render: () => <div className="mb-2" />,
            });
          }
        });
      }
    } else if (section.type === 'projects') {
      if (section.isPlaceholder) {
        list.push({
          id: `item-${section.id}-placeholder`,
          type: 'item',
          height: 55,
          render: () => (
            <div className="mb-2 text-slate-400">
              <div className="flex justify-between items-baseline leading-snug">
                <span className="font-bold text-slate-400 inline-flex items-center gap-1">
                  <span>Project Name</span>
                  <span className="text-[7.75pt] underline">(project link)</span>
                  <ExternalLink size={11} className="inline opacity-70 flex-shrink-0 text-slate-400" />
                </span>
                <span className="font-semibold text-slate-400 text-[7.75pt]">May 2022 - Present</span>
              </div>
              <div className="text-slate-400 mt-0.5 text-justify text-[7.75pt] leading-[1.48]">
                State your tasks and accomplishments including name of the project and position of responsibility held.
              </div>
            </div>
          ),
        });
      } else {
        sortByPeriodDesc((section.data as { items?: ProjectItem[] }).items || []).forEach((item: ProjectItem) => {
          const itemBullets = parseContentParts(item.bullets || '');

          // Blok header proyek: nama + periode (sticky dengan bullet pertama)
          list.push({
            id: `item-${section.id}-${item.id}-head`,
            type: 'item-head',
            height: 20,
            render: () => (
              <div className="flex justify-between items-baseline font-bold leading-snug text-slate-900">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold inline-flex items-center gap-1 group/link text-slate-900 hover:text-blue-700"
                    title={item.url}
                  >
                    <span className="group-hover/link:underline">{item.name}</span>
                    <ExternalLink
                      size={10}
                      className="inline opacity-80 group-hover/link:opacity-100 flex-shrink-0 text-slate-700"
                    />
                  </a>
                ) : (
                  <span>{item.name}</span>
                )}
                <span className="font-semibold text-[7.75pt] text-slate-800">{item.period}</span>
              </div>
            ),
          });

          itemBullets.forEach((part, bIdx: number) => {
            const isLastBulletOfItem = bIdx === itemBullets.length - 1;
            list.push({
              id: `item-${section.id}-${item.id}-b-${bIdx}`,
              type: 'item-bullet',
              height: estimateContentPartHeight(part),
              render: () => (
                <div className={`${bIdx === 0 ? 'mt-0.5' : ''} ${isLastBulletOfItem ? 'mb-2' : ''}`}>
                  {renderContentPart(part, CONTENT_PART_CLASSES)}
                </div>
              ),
            });
          });

          if (itemBullets.length === 0) {
            list.push({
              id: `item-${section.id}-${item.id}-spacer`,
              type: 'item-bullet',
              height: 8,
              render: () => <div className="mb-2" />,
            });
          }
        });
      }
    } else if (section.type === 'education') {
      if (section.isPlaceholder) {
        list.push({
          id: `item-${section.id}-placeholder`,
          type: 'item',
          height: 40,
          render: () => (
            <div className="mb-1.5 text-slate-400 space-y-0.5">
              <div className="flex justify-between items-baseline leading-snug">
                <span className="font-bold text-slate-400">Bachelor of Computer Science</span>
                <span className="font-semibold text-slate-400 text-[7.75pt]">May 2022 - Present</span>
              </div>
              <div className="flex justify-between items-baseline leading-snug text-[8pt]">
                <span>Name of the Educational Institution</span>
                <span className="font-medium text-slate-400">GPA: 4.0 of 4.0</span>
              </div>
              <div className="text-slate-400 text-[7.75pt] leading-snug">
                E.g., info about scholarships, student activity, etc.
              </div>
            </div>
          ),
        });
      } else {
        sortByPeriodDesc((section.data as { items?: EducationItem[] }).items || []).forEach((item: EducationItem) => {
          const descBlocks = parseContentParts(item.description || '');

          // Blok header pendidikan: degree + institution (sticky dengan deskripsi pertama)
          list.push({
            id: `item-${section.id}-${item.id}-head`,
            type: 'item-head',
            height: 34,
            render: () => (
              <>
                <div className="flex justify-between items-baseline font-bold leading-snug text-slate-900">
                  <span>{item.degree}</span>
                  <span className="font-semibold text-[7.75pt] text-slate-800">{item.period}</span>
                </div>
                <div className="flex justify-between items-baseline leading-snug text-slate-800 text-[8pt]">
                  <span>{item.institution}</span>
                  {item.gpa && <span className="font-medium text-slate-800">{item.gpa}</span>}
                </div>
              </>
            ),
          });

          descBlocks.forEach((part, bIdx: number) => {
            const isLast = bIdx === descBlocks.length - 1;
            list.push({
              id: `item-${section.id}-${item.id}-d-${bIdx}`,
              type: 'item-bullet',
              height: estimateContentPartHeight(part),
              render: () => (
                <div className={`${bIdx === 0 ? 'mt-0.5' : ''} ${isLast ? 'mb-1.5' : ''}`}>
                  {renderContentPart(part, CONTENT_PART_CLASSES)}
                </div>
              ),
            });
          });

          if (descBlocks.length === 0) {
            list.push({
              id: `item-${section.id}-${item.id}-spacer`,
              type: 'item-bullet',
              height: 6,
              render: () => <div className="mb-1.5" />,
            });
          }
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
          height: 24,
          render: () => (
            <div className="mb-2 text-slate-400 space-y-1">
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
            height: estimateCustomItemHeight(item, section.title, false),
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
                  <div className="mb-1.5 flex justify-between items-baseline leading-snug text-[7.75pt]">
                    {credUrl ? (
                      <a
                        href={credUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 hover:text-blue-700 leading-snug"
                        title={credUrl}
                      >
                        {certContent}
                      </a>
                    ) : (
                      <div className="text-slate-900">{certContent}</div>
                    )}
                    {item.period && (
                      <span className="font-bold whitespace-nowrap ml-4 text-[7.75pt] text-slate-900">
                        {item.period}
                      </span>
                    )}
                  </div>
                );
              }

              if (isLang) {
                return (
                  <div className="mb-1.5 leading-snug text-slate-800 text-[7.75pt]">
                    <span className="font-bold">{item.title}</span>
                    {item.subtitle && ` (${item.subtitle})`}
                  </div>
                );
              }

              if (isRef) {
                return (
                  <div className="mb-1.5 leading-snug text-slate-800 text-[7.75pt]">
                    <span className="font-bold">{item.title}</span>
                    {item.subtitle && ` (${item.subtitle})`}
                    {item.period && ` • ${item.period}`}
                  </div>
                );
              }

              return (
                <div className="mb-2">
                  <div className="flex justify-between items-baseline font-bold leading-snug">
                    <span>
                      {item.title}
                      {item.subtitle && ` (${item.subtitle})`}
                    </span>
                    {item.period && (
                      <span className="font-semibold text-[7.75pt] text-slate-800">{item.period}</span>
                    )}
                  </div>
                  {item.description && (
                    <div className="mt-0.5 text-slate-800 text-[7.75pt] leading-relaxed">
                      {item.description}
                    </div>
                  )}
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
