import React, { useMemo } from 'react';
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
  render: () => React.ReactNode;
}

// Content-aware realistic height estimator (consistent across preview and print)
const estimateBlockHeight = (block: ContentBlock): number => {
  if (block.type === 'header') return 110;
  if (block.type === 'section-title') return 35;
  if (block.type === 'summary') return 85;
  if (block.type === 'skills') return 90;
  if (block.type === 'item') return 135;
  return 50;
};

// Available printable content height in A4 (297mm - 10mm top - 12mm bottom = ~1032px, safe threshold 990px)
const PAGE_CONTENT_MAX_HEIGHT_PX = 990;

// Item-level pagination: pack items into current page, moving only overflowing items to next page
const paginateBlocks = (blocks: ContentBlock[]): ContentBlock[][] => {
  const calculatedPages: ContentBlock[][] = [];
  let currentPageBlocks: ContentBlock[] = [];
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const h = estimateBlockHeight(b);

    // Anti-orphan rule for Section Titles:
    // If block is a section title, ensure both title AND its first item fit on current page.
    if (b.type === 'section-title') {
      const nextBlock = i + 1 < blocks.length ? blocks[i + 1] : null;
      const nextH = nextBlock ? estimateBlockHeight(nextBlock) : 0;

      // If title + first item doesn't fit on current page and page already has content:
      if (currentHeight + h + nextH * 0.4 > PAGE_CONTENT_MAX_HEIGHT_PX && currentPageBlocks.length > 0) {
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
      // Point/item exceeds current page: move only this item (and subsequent items) to next page
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
};

export const PaginatedResumeView: React.FC<PaginatedResumeViewProps> = ({
  resume,
  scale = 1,
  showPageNumbers = true,
}) => {
  const { header, sections } = resume.content;

  // Flatten into atomic blocks (header, section titles, individual items)
  const allBlocks: ContentBlock[] = useMemo(() => {
    const list: ContentBlock[] = [];

    // Header Block
    list.push({
      id: 'block-header',
      type: 'header',
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

    // Sections
    sections.forEach((section) => {
      const shouldShowTitle = section.showTitle ?? section.type !== 'summary';

      // Section title
      if (shouldShowTitle) {
        list.push({
          id: `title-${section.id}`,
          type: 'section-title',
          render: () => (
            <div className="resume-section-divider border-b-[0.5px] border-slate-900 pb-0.5 mb-1.5 mt-2.5 first:mt-0.5">
              <h2 className="text-[9pt] font-bold tracking-wider text-slate-900 uppercase">
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
          render: () => (
            <div className="mb-2">
              {section.isPlaceholder ? (
                <p className="text-slate-400 text-justify text-[9pt] leading-normal">
                  A summary includes short, concise and targeted statements to summarize your skills and experiences. Mostly people will start with why they are here. What is the reason why they do what they do. Followed by “how” they do it and close it with “what” is the thing that they currently doing right now with respect to the ‘why’ and the ‘how’.
                </p>
              ) : (
                <div
                  className="text-justify text-[9pt] leading-normal text-slate-800"
                  dangerouslySetInnerHTML={{ __html: section.data.html }}
                />
              )}
            </div>
          ),
        });
      } else if (section.type === 'skills') {
        list.push({
          id: `content-${section.id}`,
          type: 'skills',
          render: () => (
            <div className="mb-2">
              {section.isPlaceholder ? (
                <div className="leading-snug text-slate-400">
                  <span className="font-bold text-slate-400">Skill Category: </span>
                  <span>Skill Name 1, Skill Name 2, Skill Name 3, Skill Name 4, Skill Name 5, etc</span>
                </div>
              ) : (
                <div className="space-y-0.5 leading-snug">
                  {section.data.categories?.map((cat: any) => (
                    <div key={cat.id} className="text-slate-800">
                      <span className="font-bold text-slate-900">{cat.category}: </span>
                      <span>{cat.items}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        });
      } else if (section.type === 'experience') {
        if (section.isPlaceholder) {
          list.push({
            id: `item-${section.id}-placeholder`,
            type: 'item',
            render: () => (
              <div className="mb-2 text-slate-400">
                <div className="flex justify-between items-baseline font-bold leading-snug">
                  <span className="text-slate-400">Position</span>
                  <span className="text-[9pt] font-semibold text-slate-400">May 2022 - Present</span>
                </div>
                <div className="flex justify-between items-baseline leading-snug text-[9.5pt]">
                  <span className="font-semibold text-slate-400">Company Name</span>
                  <span className="text-slate-400">City, State/Country</span>
                </div>
                <div className="text-slate-400 text-justify mt-0.5">
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
              render: () => (
                <div className="mb-2">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                    <span>{item.role}</span>
                    <span className="text-[9pt] font-semibold text-slate-800">{item.period}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 leading-snug text-[9.5pt]">
                    <span className="font-semibold">{item.company}</span>
                    <span className="text-slate-700">{item.location}</span>
                  </div>
                  <div
                    className="text-slate-800 text-justify mt-0.5"
                    dangerouslySetInnerHTML={{ __html: item.bullets }}
                  />
                </div>
              ),
            });
          });
        }
      } else if (section.type === 'projects') {
        if (section.isPlaceholder) {
          list.push({
            id: `item-${section.id}-placeholder`,
            type: 'item',
            render: () => (
              <div className="mb-2 text-slate-400">
                <div className="flex justify-between items-baseline leading-snug">
                  <span className="font-bold text-slate-400 inline-flex items-center gap-1">
                    <span>Project Name</span>
                    <span className="text-[8pt] underline">(project link)</span>
                    <ExternalLink size={11} className="inline opacity-70 flex-shrink-0 text-slate-400" />
                  </span>
                  <span className="text-[9pt] font-semibold text-slate-400">May 2022 - Present</span>
                </div>
                <div className="text-slate-400 text-justify mt-0.5">
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
                    <span className="text-[9pt] font-semibold text-slate-800">{item.period}</span>
                  </div>
                  <div
                    className="text-slate-800 text-justify mt-0.5"
                    dangerouslySetInnerHTML={{ __html: item.bullets }}
                  />
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
            render: () => (
              <div className="mb-1.5 text-slate-400 space-y-0.5">
                <div className="flex justify-between items-baseline leading-snug">
                  <span className="font-bold text-slate-400">Bachelor of Computer Science</span>
                  <span className="text-[9pt] font-semibold text-slate-400">May 2022 - Present</span>
                </div>
                <div className="flex justify-between items-baseline leading-snug text-[9.5pt]">
                  <span>Name of the Educational Institution</span>
                  <span className="font-medium text-slate-400">GPA: 4.0 of 4.0</span>
                </div>
                <div className="text-slate-400 text-[9pt] leading-snug">
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
              render: () => (
                <div className="mb-1.5">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 leading-snug">
                    <span>{item.degree}</span>
                    <span className="text-[9pt] font-semibold text-slate-800">{item.period}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 leading-snug text-[9.5pt]">
                    <span>{item.institution}</span>
                    {item.gpa && <span className="font-medium text-slate-800">{item.gpa}</span>}
                  </div>
                  {item.description && (
                    <div className="text-slate-700 text-[9pt] leading-snug mt-0.5">
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
            render: () => (
              <div className="mb-2 text-slate-400 space-y-1">
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
            ),
          });
        } else {
          section.data.items?.forEach((item: any) => {
            list.push({
              id: `item-${section.id}-${item.id}`,
              type: 'item',
              render: () => {
                if (isCert) {
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
                    <div className="mb-1.5 flex justify-between items-baseline leading-snug">
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
                        <span className="text-[9pt] font-bold text-slate-900 whitespace-nowrap ml-4">
                          {item.period}
                        </span>
                      )}
                    </div>
                  );
                }

                if (isLang) {
                  return (
                    <div className="mb-1.5 text-slate-800 text-[9pt] leading-snug">
                      <span className="font-bold">{item.title}</span>
                      {item.subtitle && ` (${item.subtitle})`}
                    </div>
                  );
                }

                if (isRef) {
                  return (
                    <div className="mb-1.5 text-slate-800 text-[9pt] leading-snug">
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
              },
            });
          });
        }
      }
    });

    return list;
  }, [header, sections]);

  // Pure deterministic item-level pagination (100% identical in preview and download)
  const pages = useMemo(() => paginateBlocks(allBlocks), [allBlocks]);

  return (
    <div
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
      className="transition-transform duration-100 ease-out flex flex-col items-center"
    >
      {pages.map((pageBlocks, pageIdx) => (
        <div
          key={pageIdx}
          className="a4-page-sheet shadow-2xl relative border border-slate-300/80 bg-white"
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
  );
};
