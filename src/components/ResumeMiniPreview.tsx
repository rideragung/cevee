import React from 'react';
import { ResumeLayoutId } from '../types/resume';

interface ResumeMiniPreviewProps {
  layoutId?: ResumeLayoutId | string;
  className?: string;
}

export const ResumeMiniPreview: React.FC<ResumeMiniPreviewProps> = ({
  layoutId = 'classic-ats',
  className = '',
}) => {
  const isModernPhoto = layoutId === 'modern-photo';
  // Unique per-instance ids: several mini previews can render on one page.
  const uid = React.useId().replace(/:/g, '');
  const photoClipId = `photoClip-${uid}`;
  const photoGradId = `photoGrad-${uid}`;

  return (
    <div
      className={`aspect-[210/297] bg-white rounded-lg border border-slate-200/90 overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 210 297"
        className="w-full h-full block"
        style={{
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <defs>
          <clipPath id={photoClipId}>
            <rect x="13" y="10" width="16.5" height="22" rx="1.5" />
          </clipPath>
          <linearGradient id={photoGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* 1. HEADER */}
        {isModernPhoto ? (
          // Modern Photo Layout Header (Left-aligned with 3:4 profile frame)
          <g>
            {/* 3:4 Portrait Profile Photo Frame */}
            <rect
              x="13"
              y="10"
              width="16.5"
              height="22"
              rx="1.5"
              fill={`url(#${photoGradId})`}
              stroke="#94a3b8"
              strokeWidth="0.4"
            />
            {/* Elegant Portrait Silhouette */}
            <g clipPath={`url(#${photoClipId})`}>
              <circle cx="21.25" cy="18" r="3.8" fill="#64748b" />
              <path
                d="M 14.5 30 C 14.5 24.2, 28 24.2, 28 30 Z"
                fill="#475569"
              />
            </g>

            {/* Left-Aligned Contact Details */}
            <text
              x="33.5"
              y="16.5"
              fontSize="7.8"
              fontWeight="700"
              fill="#0f172a"
              letterSpacing="-0.1"
            >
              ALEXANDER MORGAN
            </text>
            <text
              x="33.5"
              y="21.5"
              fontSize="4.2"
              fontWeight="500"
              fill="#334155"
            >
              Lead Product Designer | UI/UX &amp; Design Systems
            </text>
            <text
              x="33.5"
              y="26"
              fontSize="3.4"
              fontWeight="400"
              fill="#475569"
            >
              Jakarta, Indonesia • alex@example.com • +62 812-3456-7890
            </text>
            <text
              x="33.5"
              y="30"
              fontSize="3.4"
              fontWeight="400"
              fill="#3b82f6"
              textDecoration="underline"
            >
              linkedin.com/in/alexmorgan • github.com/alexmorgan
            </text>
          </g>
        ) : (
          // Classic ATS Layout Header (Centered, balanced single-column)
          <g>
            <text
              x="105"
              y="18"
              fontSize="8.5"
              fontWeight="700"
              fill="#0f172a"
              textAnchor="middle"
              letterSpacing="-0.1"
            >
              ALEXANDER MORGAN
            </text>
            <text
              x="105"
              y="23.5"
              fontSize="4.4"
              fontWeight="500"
              fill="#334155"
              textAnchor="middle"
            >
              Lead Product Designer | UI/UX &amp; Design Systems
            </text>
            <text
              x="105"
              y="28.5"
              fontSize="3.5"
              fontWeight="400"
              fill="#475569"
              textAnchor="middle"
            >
              Jakarta, Indonesia • alex@example.com • +62 812-3456-7890 • linkedin.com/in/alexmorgan
            </text>
          </g>
        )}

        {/* 2. SUMMARY (3 Dense Justified Lines without Title) */}
        <g>
          <text x="13" y="36.5" fontSize="3.4" fill="#334155" fontWeight="400">
            Results-driven Senior Product Designer with 6+ years of experience leading cross-functional design teams and scaling design systems
          </text>
          <text x="13" y="41" fontSize="3.4" fill="#334155" fontWeight="400">
            across high-growth enterprise platforms. Specialized in conversion rate optimization, data-dense interfaces, and user research workflows.
          </text>
          <text x="13" y="45.5" fontSize="3.4" fill="#334155" fontWeight="400">
            Proven track record improving core product engagement by 35% through scalable component architectures and cohesive user journeys.
          </text>
        </g>

        {/* 3. WORK EXPERIENCE */}
        <g>
          <text
            x="13"
            y="53"
            fontSize="4.8"
            fontWeight="700"
            fill="#0f172a"
            letterSpacing="0.8"
          >
            WORK EXPERIENCE
          </text>
          <line
            x1="13"
            y1="55"
            x2="197"
            y2="55"
            stroke="#0f172a"
            strokeWidth="0.5"
          />

          {/* Job 1 */}
          <text x="13" y="61" fontSize="4.4" fontWeight="700" fill="#0f172a">
            Senior Product Designer
          </text>
          <text
            x="197"
            y="61"
            fontSize="4.0"
            fontWeight="600"
            fill="#1e293b"
            textAnchor="end"
          >
            Aug 2022 – Present
          </text>

          <text x="13" y="65.5" fontSize="3.9" fontWeight="600" fill="#334155">
            TechScale Innovations
          </text>
          <text
            x="197"
            y="65.5"
            fontSize="3.8"
            fontWeight="400"
            fill="#64748b"
            textAnchor="end"
          >
            Jakarta, Indonesia
          </text>

          {/* Bullets */}
          <circle cx="15.5" cy="70" r="0.75" fill="#0f172a" />
          <text x="18" y="71" fontSize="3.4" fill="#334155">
            Led end-to-end redesign of checkout workflows, improving mobile conversion rates by 24% within 3 months.
          </text>

          <circle cx="15.5" cy="74.5" r="0.75" fill="#0f172a" />
          <text x="18" y="75.5" fontSize="3.4" fill="#334155">
            Architected design system tokens adopted across 14 squads, reducing front-end handoff cycle time by 40%.
          </text>

          <circle cx="15.5" cy="79" r="0.75" fill="#0f172a" />
          <text x="18" y="80" fontSize="3.4" fill="#334155">
            Conducted discovery research and usability tests with 150+ B2B customers to shape core product roadmap.
          </text>

          {/* Job 2 */}
          <text x="13" y="86.5" fontSize="4.4" fontWeight="700" fill="#0f172a">
            UI/UX Designer
          </text>
          <text
            x="197"
            y="86.5"
            fontSize="4.0"
            fontWeight="600"
            fill="#1e293b"
            textAnchor="end"
          >
            Jan 2020 – Jul 2022
          </text>

          <text x="13" y="91" fontSize="3.9" fontWeight="600" fill="#334155">
            Apex Digital Studio
          </text>
          <text
            x="197"
            y="91"
            fontSize="3.8"
            fontWeight="400"
            fill="#64748b"
            textAnchor="end"
          >
            Singapore (Remote)
          </text>

          <circle cx="15.5" cy="95.5" r="0.75" fill="#0f172a" />
          <text x="18" y="96.5" fontSize="3.4" fill="#334155">
            Delivered 20+ responsive web and mobile application prototypes for enterprise fintech and analytics clients.
          </text>

          <circle cx="15.5" cy="100" r="0.75" fill="#0f172a" />
          <text x="18" y="101" fontSize="3.4" fill="#334155">
            Collaborated closely with engineering squads to enforce WCAG AA accessibility compliance across products.
          </text>
        </g>

        {/* 4. EDUCATION */}
        <g>
          <text
            x="13"
            y="108"
            fontSize="4.8"
            fontWeight="700"
            fill="#0f172a"
            letterSpacing="0.8"
          >
            EDUCATION
          </text>
          <line
            x1="13"
            y1="110"
            x2="197"
            y2="110"
            stroke="#0f172a"
            strokeWidth="0.5"
          />

          <text x="13" y="116" fontSize="4.4" fontWeight="700" fill="#0f172a">
            Bachelor of Computer Science
          </text>
          <text
            x="197"
            y="116"
            fontSize="4.0"
            fontWeight="600"
            fill="#1e293b"
            textAnchor="end"
          >
            2016 – 2020
          </text>

          <text x="13" y="120.5" fontSize="3.9" fontWeight="600" fill="#334155">
            State University of Technology
          </text>
          <text
            x="197"
            y="120.5"
            fontSize="3.8"
            fontWeight="600"
            fill="#0f172a"
            textAnchor="end"
          >
            GPA: 3.92 / 4.00
          </text>

          <text x="13" y="125" fontSize="3.3" fill="#64748b">
            Focus on Human-Computer Interaction, Information Systems, and Software Engineering. Dean&apos;s Honor List.
          </text>
        </g>

        {/* 5. PROJECTS */}
        <g>
          <text
            x="13"
            y="132"
            fontSize="4.8"
            fontWeight="700"
            fill="#0f172a"
            letterSpacing="0.8"
          >
            PROJECTS
          </text>
          <line
            x1="13"
            y1="134"
            x2="197"
            y2="134"
            stroke="#0f172a"
            strokeWidth="0.5"
          />

          <text x="13" y="140" fontSize="4.4" fontWeight="700" fill="#0f172a">
            OpenDesign Component Library (opendesign.dev)
          </text>
          <text
            x="197"
            y="140"
            fontSize="4.0"
            fontWeight="600"
            fill="#1e293b"
            textAnchor="end"
          >
            2023 – 2024
          </text>

          <circle cx="15.5" cy="144.5" r="0.75" fill="#0f172a" />
          <text x="18" y="145.5" fontSize="3.4" fill="#334155">
            Engineered open-source accessible React design system with 35+ components, earning 2,500+ GitHub stars.
          </text>

          <circle cx="15.5" cy="149" r="0.75" fill="#0f172a" />
          <text x="18" y="150" fontSize="3.4" fill="#334155">
            Built interactive documentation with Storybook, automated visual regression tests, and zero-runtime CSS.
          </text>
        </g>

        {/* 6. SKILLS */}
        <g>
          <text
            x="13"
            y="157"
            fontSize="4.8"
            fontWeight="700"
            fill="#0f172a"
            letterSpacing="0.8"
          >
            SKILLS
          </text>
          <line
            x1="13"
            y1="159"
            x2="197"
            y2="159"
            stroke="#0f172a"
            strokeWidth="0.5"
          />

          <text x="13" y="165" fontSize="3.4">
            <tspan fontWeight="700" fill="#0f172a">
              Design &amp; Research:{' '}
            </tspan>
            <tspan fill="#334155">
              Design Systems, Wireframing, Rapid Prototyping, Usability Testing, Figma, User Flows
            </tspan>
          </text>

          <text x="13" y="169.5" fontSize="3.4">
            <tspan fontWeight="700" fill="#0f172a">
              Technical &amp; Code:{' '}
            </tspan>
            <tspan fill="#334155">
              React, TypeScript, Tailwind CSS, HTML5, CSS Grid, Responsive Web, Git, Next.js
            </tspan>
          </text>

          <text x="13" y="174" fontSize="3.4">
            <tspan fontWeight="700" fill="#0f172a">
              Tools &amp; Languages:{' '}
            </tspan>
            <tspan fill="#334155">
              English (Professional Working), Indonesian (Native), Jira, Linear, Notion, Adobe Creative Cloud
            </tspan>
          </text>
        </g>

        {/* 7. CERTIFICATIONS */}
        <g>
          <text
            x="13"
            y="181"
            fontSize="4.8"
            fontWeight="700"
            fill="#0f172a"
            letterSpacing="0.8"
          >
            CERTIFICATIONS
          </text>
          <line
            x1="13"
            y1="183"
            x2="197"
            y2="183"
            stroke="#0f172a"
            strokeWidth="0.5"
          />

          <text x="13" y="189" fontSize="3.4">
            <tspan fontWeight="700" fill="#0f172a">
              Enterprise Design Specialist (Credential ID: DS-98241)
            </tspan>
            <tspan fontWeight="400" fill="#64748b">
              {' '}
              by{' '}
            </tspan>
            <tspan fontWeight="700" fill="#0f172a">
              Design Systems Institute
            </tspan>
          </text>
          <text
            x="197"
            y="189"
            fontSize="3.8"
            fontWeight="700"
            fill="#0f172a"
            textAnchor="end"
          >
            Jan 2024
          </text>

          <text x="13" y="193.5" fontSize="3.4">
            <tspan fontWeight="700" fill="#0f172a">
              Professional Scrum Master I (PSM I)
            </tspan>
            <tspan fontWeight="400" fill="#64748b">
              {' '}
              by{' '}
            </tspan>
            <tspan fontWeight="700" fill="#0f172a">
              Scrum.org
            </tspan>
          </text>
          <text
            x="197"
            y="193.5"
            fontSize="3.8"
            fontWeight="700"
            fill="#0f172a"
            textAnchor="end"
          >
            Aug 2023
          </text>
        </g>
      </svg>
    </div>
  );
};
