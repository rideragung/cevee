import {
  ResumeDocument,
  ResumeSection,
  HeaderData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillCategory,
  CustomSectionItem,
  ContactLink,
  ResumeLayoutId,
} from '../../types/resume';
import { ParsedResumeRaw } from './types';
import { DEFAULT_LAYOUT_ID } from '../../layouts/registry';

function bulletsToHtml(bullets?: string[]): string {
  if (!bullets || bullets.length === 0) return '';
  const liElements = bullets
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .map((b) => `<li>${b}</li>`)
    .join('');
  return liElements ? `<ul>${liElements}</ul>` : '';
}

function formatPeriod(start?: string, end?: string, current?: boolean): string {
  const s = start?.trim() || '';
  let e = end?.trim() || '';
  if (current) {
    e = 'Present';
  }
  if (s && e) return `${s} - ${e}`;
  return s || e || '';
}

export function adaptParsedResumeToDocument(
  parsed: ParsedResumeRaw,
  layoutId: ResumeLayoutId = DEFAULT_LAYOUT_ID,
  customTitle?: string
): ResumeDocument {
  const timestamp = Date.now();
  const id = `resume-${timestamp}`;
  const nowIso = new Date().toISOString();

  // 1. Header mapping
  const rawHeader = parsed.header || {};
  const links: ContactLink[] = (rawHeader.links || []).map((lnk, idx) => ({
    id: `l-${timestamp}-${idx + 1}`,
    label: lnk.label || lnk.url || 'Link',
    url: lnk.url.startsWith('http') ? lnk.url : `https://${lnk.url}`,
  }));

  const fullName = rawHeader.fullName?.trim() || 'Your Name';
  const isHeaderPlaceholder = !rawHeader.fullName;

  const header: HeaderData = {
    fullName,
    isPlaceholder: isHeaderPlaceholder,
    roles: (rawHeader.roles || []).slice(0, 4),
    headline: rawHeader.roles?.[0] || '',
    location: rawHeader.location?.trim() || 'City, Country',
    willingToRelocate: false,
    relocationStatus: '',
    email: rawHeader.email?.trim() || 'email@example.com',
    phone: rawHeader.phone?.trim() || '+62 812 3456 7890',
    links: links.length > 0 ? links : [
      { id: `l-${timestamp}-1`, label: 'linkedin.com/in/profile', url: 'https://linkedin.com' },
    ],
  };

  // 2. Core Sections
  const sections: ResumeSection[] = [];

  // Summary
  const summaryHtml = parsed.summary?.trim()
    ? `<p>${parsed.summary.trim()}</p>`
    : '';
  sections.push({
    id: `sec-summary-${timestamp}`,
    type: 'summary',
    title: 'SUMMARY',
    showTitle: false,
    isPlaceholder: !summaryHtml,
    data: { html: summaryHtml },
  });

  // Work Experience
  const expItems: ExperienceItem[] = (parsed.workExperience || []).map((exp, idx) => {
    const itemId = `exp-${timestamp}-${idx + 1}`;
    const period = formatPeriod(exp.startDate, exp.endDate, exp.current);
    const bulletsHtml = bulletsToHtml(exp.bullets);

    return {
      id: itemId,
      role: exp.role || 'Job Role',
      company: exp.company || 'Company Name',
      location: exp.location || '',
      period,
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: Boolean(exp.current),
      bullets: bulletsHtml,
      positions: [
        {
          id: `pos-${itemId}-0`,
          role: exp.role || 'Job Role',
          period,
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: Boolean(exp.current),
          bullets: bulletsHtml,
        },
      ],
    };
  });

  sections.push({
    id: `sec-exp-${timestamp}`,
    type: 'experience',
    title: 'WORK EXPERIENCE',
    isPlaceholder: expItems.length === 0,
    data: { items: expItems },
  });

  // Education
  const eduItems: EducationItem[] = (parsed.education || []).map((edu, idx) => ({
    id: `edu-${timestamp}-${idx + 1}`,
    degree: edu.degree || 'Degree / Major',
    institution: edu.institution || 'University / Institution',
    period: formatPeriod(edu.startDate, edu.endDate, edu.current),
    startDate: edu.startDate || '',
    endDate: edu.endDate || '',
    current: Boolean(edu.current),
    gpa: edu.gpa || '',
    description: edu.description || '',
  }));

  sections.push({
    id: `sec-edu-${timestamp}`,
    type: 'education',
    title: 'EDUCATION',
    isPlaceholder: eduItems.length === 0,
    data: { items: eduItems },
  });

  // Projects
  const projItems: ProjectItem[] = (parsed.projects || []).map((proj, idx) => ({
    id: `proj-${timestamp}-${idx + 1}`,
    name: proj.name || 'Project Name',
    url: proj.url || '',
    period: formatPeriod(proj.startDate, proj.endDate),
    startDate: proj.startDate || '',
    endDate: proj.endDate || '',
    bullets: bulletsToHtml(proj.bullets),
  }));

  sections.push({
    id: `sec-proj-${timestamp}`,
    type: 'projects',
    title: 'PROJECTS',
    isPlaceholder: projItems.length === 0,
    data: { items: projItems },
  });

  // Skills
  const skillCategories: SkillCategory[] = (parsed.skills || []).map((sk, idx) => ({
    id: `sk-${timestamp}-${idx + 1}`,
    category: sk.category || 'Skills',
    items: sk.items || '',
  }));

  sections.push({
    id: `sec-skills-${timestamp}`,
    type: 'skills',
    title: 'SKILLS',
    isPlaceholder: skillCategories.length === 0,
    data: { categories: skillCategories },
  });

  // 3. Optional Presets (Added only if present in extracted document)

  // Volunteering & Organization
  if (parsed.volunteering && parsed.volunteering.length > 0) {
    const orgItems: ExperienceItem[] = parsed.volunteering.map((v, idx) => {
      const vId = `vol-${timestamp}-${idx + 1}`;
      const period = formatPeriod(v.startDate, v.endDate, v.current);
      const bulletsHtml = bulletsToHtml(v.bullets);
      return {
        id: vId,
        role: v.role || 'Member / Role',
        company: v.company || 'Organization Name',
        location: v.location || '',
        period,
        startDate: v.startDate || '',
        endDate: v.endDate || '',
        current: Boolean(v.current),
        bullets: bulletsHtml,
        positions: [
          {
            id: `pos-${vId}-0`,
            role: v.role || 'Member / Role',
            period,
            startDate: v.startDate || '',
            endDate: v.endDate || '',
            current: Boolean(v.current),
            bullets: bulletsHtml,
          },
        ],
      };
    });

    sections.push({
      id: `sec-vol-${timestamp}`,
      type: 'experience',
      title: 'ORGANIZATIONAL & VOLUNTEERING EXPERIENCE',
      isPlaceholder: false,
      data: { items: orgItems },
    });
  }

  // Certifications
  if (parsed.certifications && parsed.certifications.length > 0) {
    const certItems: CustomSectionItem[] = parsed.certifications.map((c, idx) => {
      const issue = c.issueDate || '';
      const expiry = c.expiryDate || '';
      const period = issue && expiry ? `${issue} - ${expiry}` : issue || expiry || c.period || '';
      return {
        id: `cert-${timestamp}-${idx + 1}`,
        title: c.title || 'Certification',
        subtitle: c.subtitle || '',
        period,
        issueDate: issue,
        expiryDate: expiry,
        credentialId: c.credentialId || '',
        credentialUrl: c.credentialUrl || '',
        description: c.description || '',
      };
    });

    sections.push({
      id: `sec-cert-${timestamp}`,
      type: 'custom_list',
      title: 'CERTIFICATIONS',
      isPlaceholder: false,
      data: { items: certItems },
    });
  }

  // Languages
  if (parsed.languages && parsed.languages.length > 0) {
    const langItems: CustomSectionItem[] = parsed.languages.map((l, idx) => ({
      id: `lang-${timestamp}-${idx + 1}`,
      title: l.title || 'Language',
      subtitle: l.subtitle || 'Proficiency',
      period: '',
      description: '',
    }));

    sections.push({
      id: `sec-lang-${timestamp}`,
      type: 'custom_list',
      title: 'LANGUAGES',
      isPlaceholder: false,
      data: { items: langItems },
    });
  }

  // Awards
  if (parsed.awards && parsed.awards.length > 0) {
    const awardItems: CustomSectionItem[] = parsed.awards.map((a, idx) => ({
      id: `award-${timestamp}-${idx + 1}`,
      title: a.title || 'Award Title',
      subtitle: a.subtitle || '',
      period: a.period || '',
      description: a.description || '',
    }));

    sections.push({
      id: `sec-award-${timestamp}`,
      type: 'custom_list',
      title: 'AWARDS',
      isPlaceholder: false,
      data: { items: awardItems },
    });
  }

  // Publications
  if (parsed.publications && parsed.publications.length > 0) {
    const pubItems: CustomSectionItem[] = parsed.publications.map((p, idx) => ({
      id: `pub-${timestamp}-${idx + 1}`,
      title: p.title || 'Publication Title',
      subtitle: p.subtitle || '',
      period: p.period || '',
      credentialUrl: p.credentialUrl || '',
      description: p.description || '',
    }));

    sections.push({
      id: `sec-pub-${timestamp}`,
      type: 'custom_list',
      title: 'PUBLICATIONS',
      isPlaceholder: false,
      data: { items: pubItems },
    });
  }

  // References
  if (parsed.references && parsed.references.length > 0) {
    const refItems: CustomSectionItem[] = parsed.references.map((r, idx) => ({
      id: `ref-${timestamp}-${idx + 1}`,
      title: r.title || 'Referee Name',
      subtitle: r.subtitle || 'Role & Company',
      period: r.period || '',
      description: r.description || '',
    }));

    sections.push({
      id: `sec-ref-${timestamp}`,
      type: 'custom_list',
      title: 'REFERENCES',
      isPlaceholder: false,
      data: { items: refItems },
    });
  }

  const generatedTitle = customTitle || (rawHeader.fullName ? `${rawHeader.fullName}'s Resume (Scanned)` : 'Imported Resume');

  return {
    id,
    title: generatedTitle,
    layoutId,
    createdAt: nowIso,
    updatedAt: nowIso,
    content: {
      header,
      sections,
    },
  };
}
