import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { ResumeDocument } from '../types/resume';
import { getWhatsAppUrl } from './ResumeHeader';
import { ExternalLink } from 'lucide-react';

interface PaginatedResumeViewProps {
  resume: ResumeDocument;
  scale?: number;
  showPageNumbers?: boolean;
}

interface ContentBlock {
  id: string;
  type: 'header' | 'section-title' | 'summary' | 'skills' | 'item';
  height: number;
  render: () => React.ReactNode;
}

// Helper stripping HTML
const stripHtml = (html: string): string => {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
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

const estimateHeaderHeight = (header: any): number => {
  let height = 32; // Nama
  if (header.headline || (header.roles && header.roles.length > 0)) {
    height += 18;
  }
  const linksCount = header.links?.length || 0;
  const contactTextLen =
    (header.location?.length || 0) +
    (header.email?.length || 0) +
    (header.phone?.length || 0) +
    linksCount * 22;
  const contactLines = Math.max(1, Math.ceil(contactTextLen / 95));
  height += contactLines * 16;
  height += 10; // mb-2 + pb-0.5
  return Math.max(55, height);
};

const estimateSummaryHeight = (html: string, isPlaceholder?: boolean): number => {
  if (isPlaceholder) return 48;
  const text = stripHtml(html);
  if (!text) return 0;
  // Font 7.75pt (10.33px) memiliki rata-rata ~135 karakter per baris pada lebar 184mm
  const lines = Math.max(1, Math.ceil(text.length / 135));
  return lines * 15.3 + 4;
};

const estimateSkillsCategoryHeight = (category: string, items: string, isLast: boolean): number => {
  const text = `${category}: ${items}`;
  const lines = Math.max(1, Math.ceil(text.length / 95));
  return lines * 15.5 + (isLast ? 8 : 2);
};

const estimateExperienceItemHeight = (item: any, isPlaceholder?: boolean): number => {
  if (isPlaceholder) return 60;
  if (item?.positions && item.positions.length > 1) {
    let height = 20; // Company name + location line
    for (const pos of item.positions) {
      height += 16; // Position role + period line
      if (pos.bullets) {
        height += estimateHtmlHeight(pos.bullets);
      }
      height += 6; // spacing between positions
    }
    height += 6; // mb-2
    return Math.max(40, height);
  }
  let height = 34; // Role line + company line
  if (item?.bullets) {
    height += estimateHtmlHeight(item.bullets);
  }
  height += 8; // mb-2
  return Math.max(36, height);
};

const estimateProjectItemHeight = (item: any, isPlaceholder?: boolean): number => {
  if (isPlaceholder) return 55;
  let height = 20; // Title + period line
  if (item?.bullets) {
    height += estimateHtmlHeight(item.bullets);
  }
  height += 8; // mb-2
  return Math.max(28, height);
};

const estimateEducationItemHeight = (item: any, isPlaceholder?: boolean): number => {
  if (isPlaceholder) return 40;
  let height = 34; // Degree line + institution line
  if (item?.description) {
    height += estimateHtmlHeight(item.description);
  }
  height += 6; // mb-1.5
  return Math.max(34, height);
};

const estimateCustomItemHeight = (item: any, sectionTitle: string, isPlaceholder?: boolean): number => {
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

// Available printable content height in A4 (297mm - 10mm top - 12mm bottom padding = ~1039.4px at 96 DPI, safe threshold 1020px)
const PAGE_CONTENT_MAX_HEIGHT_PX = 1020;

// Pure deterministic item-level packing engine
function runPagination(
  blocks: ContentBlock[],
  measuredHeights?: Record<string, number>
): ContentBlock[][] {
  const calculatedPages: ContentBlock[][] = [];
  let currentPageBlocks: ContentBlock[] = [];
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const h = measuredHeights && measuredHeights[b.id] !== undefined
      ? measuredHeights[b.id]
      : b.height;

    // Anti-orphan rule for Section Titles:
    // Pastikan judul section DAN seluruh blok pertama di bawahnya muat bersama di halaman ini.
    if (b.type === 'section-title') {
      const nextBlock = i + 1 < blocks.length ? blocks[i + 1] : null;
      const nextH = nextBlock
        ? (measuredHeights && measuredHeights[nextBlock.id] !== undefined
            ? measuredHeights[nextBlock.id]
            : nextBlock.height)
        : 0;

      if (currentHeight + h + nextH > PAGE_CONTENT_MAX_HEIGHT_PX && currentPageBlocks.length > 0) {
        calculatedPages.push(currentPageBlocks);
        currentPageBlocks = [b];
        currentHeight = h;
        continue;
      }
    }

    // Normal item-level packing:
    if (currentHeight + h <= PAGE_CONTENT_MAX_HEIGHT_PX) {
      currentPageBlocks.push(b);
      currentHeight += h;
    } else {
      // Item melebihi sisa tinggi halaman: pindahkan item ke halaman baru
      if (currentPageBlocks.length > 0) {
        calculatedPages.push(currentPageBlocks);
        currentPageBlocks = [b];
        currentHeight = h;
      } else {
        currentPageBlocks.push(b);
        currentHeight = h;
      }
    }
  }

  if (currentPageBlocks.length > 0) {
    calculatedPages.push(currentPageBlocks);
  }

  return calculatedPages;
}

export const PaginatedResumeView: React.FC<PaginatedResumeViewProps> = ({
  resume,
  scale = 1,
  showPageNumbers = true,
}) => {
  const { header, sections } = resume.content;
  const measureRef = useRef<HTMLDivElement>(null);

  // Flatten into atomic blocks (header, section titles, cohesive items)
  const allBlocks: ContentBlock[] = useMemo(() => {
    const list: ContentBlock[] = [];

    // 1. Header Block
    list.push({
      id: 'block-header',
      type: 'header',
      height: estimateHeaderHeight(header),
      render: () => {
        const activeRoles = (
          header.roles && header.roles.length > 0
            ? header.roles
            : header.headline
            ? header.headline.split('|').map((s) => s.trim())
            : []
        ).filter(Boolean);
        const displayedRoles = activeRoles.join(' | ');
        const isRelocating =
          header.willingToRelocate ??
          (header.relocationStatus && header.relocationStatus.includes('Willing'));

        return (
          <div className="resume-header text-center mb-2 pb-0.5">
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
              className={`text-[8.5pt] flex flex-wrap items-center justify-center gap-x-1 leading-tight ${
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
        );
      },
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
            <div className="resume-section-divider border-b-[0.5px] border-slate-900 pb-0.5 mb-1.5 mt-2.5 first:mt-0.5">
              <h2 className="text-[8.5pt] font-bold tracking-wider text-slate-900 uppercase">
                {section.title}
              </h2>
            </div>
          ),
        });
      }

      if (section.type === 'summary') {
        list.push({
          id: `content-${section.id}`,
          type: 'summary',
          height: estimateSummaryHeight(section.data?.html, section.isPlaceholder),
          render: () => (
            <div className="mb-1">
              {section.isPlaceholder ? (
                <p className="text-slate-400 text-justify text-[7.75pt] leading-[1.48]">
                  A summary includes short, concise and targeted statements to summarize your skills and experiences. Mostly people will start with why they are here. What is the reason why they do what they do. Followed by “how” they do it and close it with “what” is the thing that they currently doing right now with respect to the ‘why’ and the ‘how’.
                </p>
              ) : (
                <div
                  className="resume-summary-text text-justify text-[7.75pt] leading-[1.48] text-slate-800"
                  dangerouslySetInnerHTML={{ __html: section.data.html }}
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
          const cats = section.data.categories || [];
          cats.forEach((cat: any, catIdx: number) => {
            const isLastCat = catIdx === cats.length - 1;
            const catHeight = estimateSkillsCategoryHeight(cat.category || '', cat.items || '', isLastCat);

            list.push({
              id: `content-${section.id}-cat-${cat.id || catIdx}`,
              type: 'skills',
              height: catHeight,
              render: () => (
                <div className={`text-slate-800 leading-snug ${isLastCat ? 'mb-2' : 'mb-0.5'}`}>
                  <span className="font-bold text-slate-900">{cat.category}: </span>
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
          section.data.items?.forEach((item: any) => {
            list.push({
              id: `item-${section.id}-${item.id}`,
              type: 'item',
              height: estimateExperienceItemHeight(item, false),
              render: () => {
                if (item.positions && item.positions.length > 1) {
                  return (
                    <div className="mb-2">
                      <div className="flex justify-between items-baseline leading-snug">
                        <span className="font-bold text-slate-900 text-[8pt]">{item.company}</span>
                        <span className="text-slate-700 text-[8pt]">{item.location}</span>
                      </div>
                      <div className="space-y-1.5 mt-0.5">
                        {item.positions.map((pos: any, posIdx: number) => (
                          <div key={pos.id || posIdx}>
                            <div className="flex justify-between items-baseline leading-snug">
                              <span className="font-semibold text-slate-900 text-[7.75pt]">{pos.role}</span>
                              <span className="text-[7.75pt] font-semibold text-slate-800">{pos.period}</span>
                            </div>
                            {pos.bullets && (
                              <div
                                className="text-slate-800 text-justify mt-0.5 text-[7.75pt] leading-[1.48]"
                                dangerouslySetInnerHTML={{ __html: pos.bullets }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="mb-2">
                    <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                      <span>{item.role}</span>
                      <span className="text-[7.75pt] font-semibold text-slate-800">{item.period}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-slate-800 leading-snug text-[8pt]">
                      <span className="font-semibold">{item.company}</span>
                      <span className="text-slate-700">{item.location}</span>
                    </div>
                    {item.bullets && (
                      <div
                        className="text-slate-800 text-justify mt-0.5 text-[7.75pt] leading-[1.48]"
                        dangerouslySetInnerHTML={{ __html: item.bullets }}
                      />
                    )}
                  </div>
                );
              },
            });
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
                  <span className="text-[7.75pt] font-semibold text-slate-400">May 2022 - Present</span>
                </div>
                <div className="text-slate-400 text-justify mt-0.5 text-[7.75pt] leading-[1.48]">
                  State your tasks and accomplishments including name of the project and position of responsibility held.
                </div>
              </div>
            ),
          });
        } else {
          section.data.items?.forEach((item: any) => {
            list.push({
              id: `item-${section.id}-${item.id}`,
              type: 'item',
              height: estimateProjectItemHeight(item, false),
              render: () => (
                <div className="mb-2">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:text-blue-700 inline-flex items-center gap-1 group/link"
                        title={item.url}
                      >
                        <span className="group-hover/link:underline">{item.name}</span>
                        <ExternalLink size={11} className="inline opacity-80 group-hover/link:opacity-100 flex-shrink-0 text-slate-700" />
                      </a>
                    ) : (
                      <span>{item.name}</span>
                    )}
                    <span className="text-[7.75pt] font-semibold text-slate-800">{item.period}</span>
                  </div>
                  {item.bullets && (
                    <div
                      className="text-slate-800 text-justify mt-0.5 text-[7.75pt] leading-[1.48]"
                      dangerouslySetInnerHTML={{ __html: item.bullets }}
                    />
                  )}
                </div>
              ),
            });
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
                  <span className="text-[7.75pt] font-semibold text-slate-400">May 2022 - Present</span>
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
          section.data.items?.forEach((item: any) => {
            list.push({
              id: `item-${section.id}-${item.id}`,
              type: 'item',
              height: estimateEducationItemHeight(item, false),
              render: () => (
                <div className="mb-1.5">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                    <span>{item.degree}</span>
                    <span className="text-[7.75pt] font-semibold text-slate-800">{item.period}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 leading-snug text-[8pt]">
                    <span>{item.institution}</span>
                    {item.gpa && <span className="font-medium text-slate-800">{item.gpa}</span>}
                  </div>
                  {item.description && (
                    <div className="text-slate-700 text-[7.75pt] leading-snug mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              ),
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
          section.data.items?.forEach((item: any) => {
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
                        <div className="text-slate-900 leading-snug">{certContent}</div>
                      )}
                      {item.period && (
                        <span className="text-[7.75pt] font-bold text-slate-900 whitespace-nowrap ml-4">
                          {item.period}
                        </span>
                      )}
                    </div>
                  );
                }

                if (isLang) {
                  return (
                    <div className="mb-1.5 text-slate-800 text-[7.75pt] leading-snug">
                      <span className="font-bold">{item.title}</span>
                      {item.subtitle && ` (${item.subtitle})`}
                    </div>
                  );
                }

                if (isRef) {
                  return (
                    <div className="mb-1.5 text-slate-800 text-[7.75pt] leading-snug">
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
                        <span className="text-[7.75pt] font-semibold text-slate-800">{item.period}</span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-slate-800 text-[7.75pt] leading-relaxed mt-0.5">
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
  }, [header, sections]);

  // Initial deterministic pagination
  const [pages, setPages] = useState<ContentBlock[][]>(() => runPagination(allBlocks));

  // Dynamic real DOM measurement via useLayoutEffect (zero-flicker subpixel precision)
  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const heights: Record<string, number> = {};
    const nodes = measureRef.current.children;
    let hasPositiveHeights = false;

    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i] as HTMLElement;
      const id = el.getAttribute('data-measure-id');
      if (id) {
        const rect = el.getBoundingClientRect();
        let h = rect.height;

        // Pastikan margin atas dan bawah elemen dihitung secara presisi
        if (el.firstElementChild) {
          const comp = window.getComputedStyle(el.firstElementChild);
          const mt = parseFloat(comp.marginTop) || 0;
          const mb = parseFloat(comp.marginBottom) || 0;
          const childRect = el.firstElementChild.getBoundingClientRect();
          h = Math.max(h, childRect.height + mt + mb);
        }

        if (h > 0) {
          heights[id] = Math.ceil(h);
          hasPositiveHeights = true;
        }
      }
    }

    // Only update pages if we measured real, non-zero DOM heights!
    if (hasPositiveHeights) {
      const measuredPages = runPagination(allBlocks, heights);
      setPages(measuredPages);
    }
  }, [allBlocks]);

  return (
    <>
      {/* Hidden 1:1 A4 Measurement Container - ensures browser engine computes exact layout */}
      <div
        ref={measureRef}
        aria-hidden="true"
        data-a4-measure="true"
        className="a4-measure-container no-print"
        style={{
          position: 'absolute',
          top: -99999,
          left: -99999,
          width: '184mm',
          visibility: 'hidden',
          pointerEvents: 'none',
          boxSizing: 'border-box',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          fontSize: '7.75pt',
          lineHeight: '1.48',
          color: '#111827',
          zIndex: -999,
        }}
      >
        {allBlocks.map((b) => (
          <div key={b.id} data-measure-id={b.id} style={{ display: 'flow-root' }}>
            {b.render()}
          </div>
        ))}
      </div>

      {/* Visible Paginated Pages */}
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        className="transition-transform duration-100 ease-out flex flex-col items-center"
      >
        {pages.map((pageBlocks, pageIdx) => (
          <div
            key={pageIdx}
            className="a4-page-sheet shadow-2xl relative border border-slate-300/80 bg-white overflow-hidden"
            style={{ marginBottom: '48px' }}
          >
            {/* Page Content */}
            <div className="w-full h-full flex flex-col justify-start">
              {pageBlocks.map((b) => (
                <React.Fragment key={b.id}>{b.render()}</React.Fragment>
              ))}
            </div>

            {/* Page Number Badge (only on screen preview, hidden in print) */}
            {showPageNumbers && (
              <div className="absolute bottom-2.5 right-4 text-[8pt] text-slate-400 font-mono select-none no-print">
                Page {pageIdx + 1} of {pages.length}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
