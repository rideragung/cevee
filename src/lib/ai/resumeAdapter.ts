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
  ResumeLanguage,
} from '../../types/resume';
import { ParsedResumeRaw } from './types';
import { DEFAULT_LAYOUT_ID } from '../../layouts/ids';
import {
  DEFAULT_RESUME_LANGUAGE,
  SECTION_PRESET_TITLES,
  formatComputedPeriod,
  getResumeLocale,
  isPresentToken,
  localizeDateString,
  normalizeResumeLanguage,
  stripGpaPrefix,
} from '../../utils/resumeLocale';

function bulletsToHtml(bullets?: string[]): string {
  if (!bullets || bullets.length === 0) return '';
  const liElements = bullets
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .map((b) => `<li>${b}</li>`)
    .join('');
  return liElements ? `<ul>${liElements}</ul>` : '';
}

function formatPeriod(
  lang: ResumeLanguage,
  start?: string,
  end?: string,
  current?: boolean
): string {
  return formatComputedPeriod({ startDate: start, endDate: end, current }, lang);
}

export function adaptParsedResumeToDocument(
  parsed: ParsedResumeRaw,
  layoutId: ResumeLayoutId = DEFAULT_LAYOUT_ID,
  customTitle?: string,
  language: ResumeLanguage = DEFAULT_RESUME_LANGUAGE
): ResumeDocument {
  const normalizedLang = normalizeResumeLanguage(language);
  const locale = getResumeLocale(normalizedLang);
  const titles = SECTION_PRESET_TITLES;
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

  const fullName = rawHeader.fullName?.trim() || locale.placeholderName;
  const isHeaderPlaceholder = !rawHeader.fullName;

  const header: HeaderData = {
    fullName,
    isPlaceholder: isHeaderPlaceholder,
    roles: (rawHeader.roles || []).slice(0, 4),
    headline: rawHeader.roles?.[0] || '',
    location: rawHeader.location?.trim() || locale.placeholderLocation,
    willingToRelocate: false,
    relocationStatus: '',
    email: rawHeader.email?.trim() || locale.placeholderEmail,
    phone: rawHeader.phone?.trim() || locale.placeholderPhone,
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
    presetKey: 'summary',
    title: titles.summary[normalizedLang],
    showTitle: false,
    isPlaceholder: !summaryHtml,
    data: { html: summaryHtml },
  });

  // Work Experience
  const expItems: ExperienceItem[] = (parsed.workExperience || []).map((exp, idx) => {
    const itemId = `exp-${timestamp}-${idx + 1}`;
    const isCurrent = Boolean(exp.current) || isPresentToken(exp.endDate);
    const startDate = localizeDateString(exp.startDate, normalizedLang);
    const endDate = isCurrent ? '' : localizeDateString(exp.endDate, normalizedLang);
    const period = formatPeriod(normalizedLang, startDate, endDate, isCurrent);
    const bulletsHtml = bulletsToHtml(exp.bullets);
    const fallbackRole = normalizedLang === 'id' ? 'Posisi Pekerjaan' : 'Job Role';

    return {
      id: itemId,
      role: exp.role || fallbackRole,
      company: exp.company || locale.placeholderCompany,
      location: exp.location || '',
      period,
      startDate,
      endDate,
      current: isCurrent,
      bullets: bulletsHtml,
      positions: [
        {
          id: `pos-${itemId}-0`,
          role: exp.role || fallbackRole,
          period,
          startDate,
          endDate,
          current: isCurrent,
          bullets: bulletsHtml,
        },
      ],
    };
  });

  sections.push({
    id: `sec-exp-${timestamp}`,
    type: 'experience',
    presetKey: 'experience',
    title: titles.experience[normalizedLang],
    isPlaceholder: expItems.length === 0,
    data: { items: expItems },
  });

  // Education
  const eduItems: EducationItem[] = (parsed.education || []).map((edu, idx) => {
    const isCurrent = Boolean(edu.current) || isPresentToken(edu.endDate);
    const startDate = localizeDateString(edu.startDate, normalizedLang);
    const endDate = isCurrent ? '' : localizeDateString(edu.endDate, normalizedLang);
    return {
      id: `edu-${timestamp}-${idx + 1}`,
      degree: edu.degree || (normalizedLang === 'id' ? 'Gelar / Jurusan' : 'Degree / Major'),
      institution:
        edu.institution ||
        (normalizedLang === 'id' ? 'Universitas / Institusi' : 'University / Institution'),
      period: formatPeriod(normalizedLang, startDate, endDate, isCurrent),
      startDate,
      endDate,
      current: isCurrent,
      gpa: edu.gpa ? stripGpaPrefix(edu.gpa) : '',
      url: edu.url || '',
      urlLabel: edu.urlLabel || '',
      relatedCoursework: edu.relatedCoursework || '',
      thesisTitle: edu.thesisTitle || '',
      thesisUrl: edu.thesisUrl || '',
      description: edu.description || '',
    };
  });

  sections.push({
    id: `sec-edu-${timestamp}`,
    type: 'education',
    presetKey: 'education',
    title: titles.education[normalizedLang],
    isPlaceholder: eduItems.length === 0,
    data: { items: eduItems },
  });

  // Projects
  const projItems: ProjectItem[] = (parsed.projects || []).map((proj, idx) => {
    const startDate = localizeDateString(proj.startDate, normalizedLang);
    const endDate = localizeDateString(proj.endDate, normalizedLang);
    return {
      id: `proj-${timestamp}-${idx + 1}`,
      name: proj.name || locale.placeholderProjectName,
      url: proj.url || '',
      period: formatPeriod(normalizedLang, startDate, endDate),
      startDate,
      endDate,
      bullets: bulletsToHtml(proj.bullets),
    };
  });

  sections.push({
    id: `sec-proj-${timestamp}`,
    type: 'projects',
    presetKey: 'projects',
    title: titles.projects[normalizedLang],
    isPlaceholder: projItems.length === 0,
    data: { items: projItems },
  });

  // Skills
  const skillCategories: SkillCategory[] = (parsed.skills || []).map((sk, idx) => ({
    id: `sk-${timestamp}-${idx + 1}`,
    category: sk.category || (normalizedLang === 'id' ? 'Keahlian' : 'Skills'),
    items: sk.items || '',
  }));

  sections.push({
    id: `sec-skills-${timestamp}`,
    type: 'skills',
    presetKey: 'skills',
    title: titles.skills[normalizedLang],
    isPlaceholder: skillCategories.length === 0,
    data: { categories: skillCategories },
  });

  // 3. Optional Presets (Added only if present in extracted document)

  // Volunteering & Organization
  if (parsed.volunteering && parsed.volunteering.length > 0) {
    const orgItems: ExperienceItem[] = parsed.volunteering.map((v, idx) => {
      const vId = `vol-${timestamp}-${idx + 1}`;
      const isCurrent = Boolean(v.current) || isPresentToken(v.endDate);
      const startDate = localizeDateString(v.startDate, normalizedLang);
      const endDate = isCurrent ? '' : localizeDateString(v.endDate, normalizedLang);
      const period = formatPeriod(normalizedLang, startDate, endDate, isCurrent);
      const bulletsHtml = bulletsToHtml(v.bullets);
      const fallbackRole = normalizedLang === 'id' ? 'Anggota / Peran' : 'Member / Role';
      return {
        id: vId,
        role: v.role || fallbackRole,
        company: v.company || (normalizedLang === 'id' ? 'Nama Organisasi' : 'Organization Name'),
        location: v.location || '',
        period,
        startDate,
        endDate,
        current: isCurrent,
        bullets: bulletsHtml,
        positions: [
          {
            id: `pos-${vId}-0`,
            role: v.role || fallbackRole,
            period,
            startDate,
            endDate,
            current: isCurrent,
            bullets: bulletsHtml,
          },
        ],
      };
    });

    sections.push({
      id: `sec-vol-${timestamp}`,
      type: 'experience',
      presetKey: 'volunteering',
      title: titles.volunteering[normalizedLang],
      isPlaceholder: false,
      data: { items: orgItems },
    });
  }

  // Certifications
  if (parsed.certifications && parsed.certifications.length > 0) {
    const certItems: CustomSectionItem[] = parsed.certifications.map((c, idx) => {
      const issue = localizeDateString(c.issueDate, normalizedLang);
      const expiry = localizeDateString(c.expiryDate, normalizedLang);
      const period =
        issue && expiry
          ? `${issue} - ${expiry}`
          : issue || expiry || localizeDateString(c.period, normalizedLang);
      return {
        id: `cert-${timestamp}-${idx + 1}`,
        title: c.title || (normalizedLang === 'id' ? 'Sertifikasi' : 'Certification'),
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
      presetKey: 'certifications',
      title: titles.certifications[normalizedLang],
      isPlaceholder: false,
      data: { items: certItems },
    });
  }

  // Languages
  if (parsed.languages && parsed.languages.length > 0) {
    const langItems: CustomSectionItem[] = parsed.languages.map((l, idx) => ({
      id: `lang-${timestamp}-${idx + 1}`,
      title: l.title || (normalizedLang === 'id' ? 'Bahasa' : 'Language'),
      subtitle: l.subtitle || (normalizedLang === 'id' ? 'Tingkat kemahiran' : 'Proficiency'),
      period: '',
      description: '',
    }));

    sections.push({
      id: `sec-lang-${timestamp}`,
      type: 'custom_list',
      presetKey: 'languages',
      title: titles.languages[normalizedLang],
      isPlaceholder: false,
      data: { items: langItems },
    });
  }

  // Awards
  if (parsed.awards && parsed.awards.length > 0) {
    const awardItems: CustomSectionItem[] = parsed.awards.map((a, idx) => ({
      id: `award-${timestamp}-${idx + 1}`,
      title: a.title || (normalizedLang === 'id' ? 'Nama Penghargaan' : 'Award Title'),
      subtitle: a.subtitle || '',
      period: localizeDateString(a.period, normalizedLang),
      description: a.description || '',
    }));

    sections.push({
      id: `sec-award-${timestamp}`,
      type: 'custom_list',
      presetKey: 'awards',
      title: titles.awards[normalizedLang],
      isPlaceholder: false,
      data: { items: awardItems },
    });
  }

  // Publications
  if (parsed.publications && parsed.publications.length > 0) {
    const pubItems: CustomSectionItem[] = parsed.publications.map((p, idx) => ({
      id: `pub-${timestamp}-${idx + 1}`,
      title: p.title || (normalizedLang === 'id' ? 'Judul Publikasi' : 'Publication Title'),
      subtitle: p.subtitle || '',
      period: localizeDateString(p.period, normalizedLang),
      credentialUrl: p.credentialUrl || '',
      description: p.description || '',
    }));

    sections.push({
      id: `sec-pub-${timestamp}`,
      type: 'custom_list',
      presetKey: 'publications',
      title: titles.publications[normalizedLang],
      isPlaceholder: false,
      data: { items: pubItems },
    });
  }

  // References
  if (parsed.references && parsed.references.length > 0) {
    const refItems: CustomSectionItem[] = parsed.references.map((r, idx) => ({
      id: `ref-${timestamp}-${idx + 1}`,
      title: r.title || (normalizedLang === 'id' ? 'Nama Referensi' : 'Referee Name'),
      subtitle: r.subtitle || (normalizedLang === 'id' ? 'Jabatan & Perusahaan' : 'Role & Company'),
      period: r.period || '',
      description: r.description || '',
    }));

    sections.push({
      id: `sec-ref-${timestamp}`,
      type: 'custom_list',
      presetKey: 'references',
      title: titles.references[normalizedLang],
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
      language: normalizedLang,
      header,
      sections,
    },
  };
}
