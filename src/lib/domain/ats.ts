import type {
  CustomSectionItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeDocument,
  ResumeSection,
} from '../../types/resume';
import { getPeriodSortKey } from '../../utils/periodSort';
import { countWords, extractBullets, htmlToPlainText } from './html';

export type AtsSeverity = 'critical' | 'warning' | 'info';

export interface AtsIssue {
  code: string;
  severity: AtsSeverity;
  message: string;
  hint?: string;
  sectionId?: string;
  itemId?: string;
}

export interface AtsAuditSummary {
  sectionCount: number;
  experienceCount: number;
  educationCount: number;
  projectCount: number;
  skillCategoryCount: number;
  bulletCount: number;
  wordCount: number;
}

export interface AtsAuditResult {
  score: number;
  issues: AtsIssue[];
  summary: AtsAuditSummary;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIRST_PERSON_PATTERN = /\b(i|me|my|mine|saya|aku)\b/i;
const WEAK_PHRASE_PATTERN = /(responsible for|bertanggung jawab atas)/i;
const PLACEHOLDER_NAMES = new Set(['', 'your name', 'nama lengkap']);

const ACTION_VERBS = new Set([
  'achieved',
  'analyzed',
  'automated',
  'built',
  'collaborated',
  'created',
  'delivered',
  'designed',
  'developed',
  'drove',
  'established',
  'generated',
  'implemented',
  'improved',
  'increased',
  'launched',
  'led',
  'managed',
  'mentored',
  'migrated',
  'optimized',
  'organized',
  'reduced',
  'resolved',
  'scaled',
  'shipped',
  'streamlined',
  'supported',
  'trained',
  'transformed',
  'mencapai',
  'menganalisis',
  'membangun',
  'berkolaborasi',
  'membuat',
  'menghadirkan',
  'merancang',
  'mengembangkan',
  'mendorong',
  'membangun',
  'mengimplementasikan',
  'meningkatkan',
  'meluncurkan',
  'memimpin',
  'mengelola',
  'membimbing',
  'memigrasikan',
  'mengoptimalkan',
  'mengorganisir',
  'mengurangi',
  'menyelesaikan',
  'mengembangkan',
  'melatih',
  'mentransformasi',
]);

const severityWeight: Record<AtsSeverity, number> = {
  critical: 18,
  warning: 6,
  info: 2,
};

const severityOrder: Record<AtsSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const sectionToPlainText = (section: ResumeSection): string => {
  if (section.type === 'summary' || section.type === 'custom_text') {
    return htmlToPlainText(section.data.html);
  }

  if (section.type === 'skills') {
    return section.data.categories.map((category) => `${category.category} ${category.items}`).join(' ');
  }

  if (section.type === 'experience') {
    return section.data.items
      .map((item) => `${item.role} ${item.company} ${item.location} ${htmlToPlainText(item.bullets)}`)
      .join(' ');
  }

  if (section.type === 'projects') {
    return section.data.items
      .map((item) => `${item.name} ${htmlToPlainText(item.bullets)}`)
      .join(' ');
  }

  if (section.type === 'education') {
    return section.data.items
      .map(
        (item) =>
          `${item.degree} ${item.institution} ${item.gpa || ''} ${item.relatedCoursework || ''} ${
            item.description || ''
          }`
      )
      .join(' ');
  }

  if (section.type === 'custom_list') {
    return section.data.items
      .map((item) => `${item.title} ${item.subtitle || ''} ${item.description || ''}`)
      .join(' ');
  }

  return '';
};

const isExperienceItem = (item: ExperienceItem): boolean =>
  Boolean(item.role || item.company || item.bullets);

const isEducationItem = (item: EducationItem): boolean =>
  Boolean(item.degree || item.institution);

const isProjectItem = (item: ProjectItem): boolean => Boolean(item.name || item.bullets);

const isCustomItem = (item: CustomSectionItem): boolean => Boolean(item.title || item.subtitle);

const isReverseChronological = <T extends { period?: string; startDate?: string; endDate?: string; current?: boolean }>(
  items: T[]
): boolean => {
  for (let index = 1; index < items.length; index += 1) {
    const previous = getPeriodSortKey(items[index - 1]);
    const current = getPeriodSortKey(items[index]);
    if (current.end > previous.end) return false;
    if (current.end === previous.end && current.start > previous.start) return false;
  }
  return true;
};

const auditExperienceItem = (
  item: ExperienceItem,
  sectionId: string,
  issues: AtsIssue[]
): number => {
  let bulletCount = 0;

  if (!item.role.trim()) {
    issues.push({
      code: 'experience.role.missing',
      severity: 'critical',
      message: 'An experience entry has no role title.',
      sectionId,
      itemId: item.id,
      hint: 'Add the job title so ATS parsers can match the entry.',
    });
  }

  if (!item.company.trim()) {
    issues.push({
      code: 'experience.company.missing',
      severity: 'critical',
      message: 'An experience entry has no company name.',
      sectionId,
      itemId: item.id,
    });
  }

  if (!item.period.trim() && !item.startDate && !item.endDate) {
    issues.push({
      code: 'experience.period.missing',
      severity: 'warning',
      message: 'An experience entry has no dates.',
      sectionId,
      itemId: item.id,
      hint: 'Use a month-year range, for example "Jan 2024 - Present".',
    });
  }

  const bullets = extractBullets(item.bullets);
  bulletCount += bullets.length;

  if (bullets.length === 0) {
    issues.push({
      code: 'experience.bullets.missing',
      severity: 'warning',
      message: 'An experience entry has no bullet points.',
      sectionId,
      itemId: item.id,
      hint: 'Add two to six achievement-focused bullets.',
    });
  } else if (bullets.length < 2) {
    issues.push({
      code: 'experience.bullets.few',
      severity: 'info',
      message: 'An experience entry has only one bullet.',
      sectionId,
      itemId: item.id,
    });
  } else if (bullets.length > 8) {
    issues.push({
      code: 'experience.bullets.many',
      severity: 'warning',
      message: 'An experience entry has more than eight bullets.',
      sectionId,
      itemId: item.id,
      hint: 'Keep the strongest two to six bullets per role.',
    });
  }

  bullets.forEach((bullet, index) => {
    if (bullet.length > 220) {
      issues.push({
        code: 'experience.bullet.long',
        severity: 'warning',
        message: `Bullet ${index + 1} is longer than 220 characters.`,
        sectionId,
        itemId: item.id,
        hint: 'Split it into two shorter achievement statements.',
      });
    }
    if (WEAK_PHRASE_PATTERN.test(bullet)) {
      issues.push({
        code: 'experience.bullet.weak',
        severity: 'warning',
        message: `Bullet ${index + 1} uses a passive phrase ("responsible for").`,
        sectionId,
        itemId: item.id,
        hint: 'Start with an action verb and state the outcome.',
      });
    }
    if (FIRST_PERSON_PATTERN.test(bullet)) {
      issues.push({
        code: 'experience.bullet.firstPerson',
        severity: 'info',
        message: `Bullet ${index + 1} uses first-person wording.`,
        sectionId,
        itemId: item.id,
      });
    }
    const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord && firstWord.length > 2 && !ACTION_VERBS.has(firstWord)) {
      issues.push({
        code: 'experience.bullet.verb',
        severity: 'info',
        message: `Bullet ${index + 1} may not start with an action verb ("${firstWord}").`,
        sectionId,
        itemId: item.id,
        hint: 'Start with a verb such as led, built, improved, or delivered.',
      });
    }
  });

  return bulletCount;
};

export const auditResume = (resume: ResumeDocument): AtsAuditResult => {
  const issues: AtsIssue[] = [];
  const { header, sections } = resume.content;

  const fullName = header.fullName.trim();
  if (PLACEHOLDER_NAMES.has(fullName.toLowerCase())) {
    issues.push({
      code: 'header.name.placeholder',
      severity: 'critical',
      message: 'The resume still uses a placeholder name.',
      hint: 'Replace it with the candidate full name.',
    });
  }

  if (!EMAIL_PATTERN.test(header.email.trim())) {
    issues.push({
      code: 'header.email.invalid',
      severity: 'critical',
      message: 'The email address is missing or invalid.',
      hint: 'Use a professional address such as name@domain.com.',
    });
  }

  if (header.phone.replace(/\D/g, '').length < 7) {
    issues.push({
      code: 'header.phone.invalid',
      severity: 'warning',
      message: 'The phone number is missing or too short.',
    });
  }

  if (!header.location.trim()) {
    issues.push({
      code: 'header.location.missing',
      severity: 'warning',
      message: 'The location is missing.',
    });
  }

  if (header.links.length === 0) {
    issues.push({
      code: 'header.links.missing',
      severity: 'warning',
      message: 'No portfolio, LinkedIn, or GitHub link is present.',
    });
  }

  const experienceSections = sections.filter(
    (section): section is Extract<ResumeSection, { type: 'experience' }> =>
      section.type === 'experience'
  );
  const educationSections = sections.filter(
    (section): section is Extract<ResumeSection, { type: 'education' }> =>
      section.type === 'education'
  );
  const projectSections = sections.filter(
    (section): section is Extract<ResumeSection, { type: 'projects' }> =>
      section.type === 'projects'
  );
  const skillSections = sections.filter(
    (section): section is Extract<ResumeSection, { type: 'skills' }> => section.type === 'skills'
  );
  const customListSections = sections.filter(
    (section): section is Extract<ResumeSection, { type: 'custom_list' }> =>
      section.type === 'custom_list'
  );

  const summarySection = sections.find(
    (section): section is Extract<ResumeSection, { type: 'summary' }> =>
      section.type === 'summary'
  );
  if (summarySection) {
    const summaryText = htmlToPlainText(summarySection.data.html);
    if (summaryText.length === 0) {
      issues.push({
        code: 'summary.missing',
        severity: 'warning',
        message: 'The professional summary is empty.',
        sectionId: summarySection.id,
        hint: 'Write a two to four sentence summary tailored to the target role.',
      });
    } else if (summaryText.length < 40) {
      issues.push({
        code: 'summary.short',
        severity: 'info',
        message: 'The professional summary is very short.',
        sectionId: summarySection.id,
      });
    } else if (summaryText.length > 700) {
      issues.push({
        code: 'summary.long',
        severity: 'warning',
        message: 'The professional summary is longer than 700 characters.',
        sectionId: summarySection.id,
      });
    }
    if (FIRST_PERSON_PATTERN.test(summaryText)) {
      issues.push({
        code: 'summary.firstPerson',
        severity: 'info',
        message: 'The summary uses first-person wording.',
        sectionId: summarySection.id,
      });
    }
  }

  const experienceItems = experienceSections.flatMap((section) => section.data.items);
  if (experienceItems.length === 0) {
    issues.push({
      code: 'experience.missing',
      severity: 'warning',
      message: 'No work experience entries were found.',
      hint: 'Add at least one role, or use a projects section for early-career profiles.',
    });
  }

  let bulletCount = 0;
  experienceSections.forEach((section) => {
    section.data.items.filter(isExperienceItem).forEach((item) => {
      bulletCount += auditExperienceItem(item, section.id, issues);
    });
    if (!isReverseChronological(section.data.items)) {
      issues.push({
        code: 'experience.order',
        severity: 'warning',
        message: 'Experience entries are not in reverse-chronological order.',
        sectionId: section.id,
        hint: 'Put the most recent role first.',
      });
    }
  });

  educationSections.forEach((section) => {
    section.data.items.filter(isEducationItem).forEach((item) => {
      if (!item.degree.trim() || !item.institution.trim()) {
        issues.push({
          code: 'education.entry.incomplete',
          severity: 'critical',
          message: 'An education entry is missing a degree or institution.',
          sectionId: section.id,
          itemId: item.id,
        });
      }
      if (!item.period.trim() && !item.startDate && !item.endDate) {
        issues.push({
          code: 'education.period.missing',
          severity: 'warning',
          message: 'An education entry has no dates.',
          sectionId: section.id,
          itemId: item.id,
        });
      }
    });
  });

  projectSections.forEach((section) => {
    section.data.items.filter(isProjectItem).forEach((item) => {
      if (!item.name.trim()) {
        issues.push({
          code: 'project.name.missing',
          severity: 'warning',
          message: 'A project entry has no name.',
          sectionId: section.id,
          itemId: item.id,
        });
      }
      bulletCount += extractBullets(item.bullets).length;
    });
  });

  const skillCategories = skillSections.flatMap((section) => section.data.categories);
  if (skillCategories.length > 0 && skillCategories.length < 3) {
    issues.push({
      code: 'skills.categories.few',
      severity: 'info',
      message: 'Fewer than three skill categories are present.',
      hint: 'Group skills into categories such as languages, frameworks, and tools.',
    });
  }
  skillCategories.forEach((category) => {
    if (!category.category.trim() || !category.items.trim()) {
      issues.push({
        code: 'skills.category.incomplete',
        severity: 'warning',
        message: 'A skill category is missing its name or items.',
      });
    }
  });

  customListSections.forEach((section) => {
    section.data.items.filter(isCustomItem).forEach((item) => {
      if (!item.title.trim()) {
        issues.push({
          code: 'custom.title.missing',
          severity: 'warning',
          message: 'A custom section entry has no title.',
          sectionId: section.id,
          itemId: item.id,
        });
      }
    });
  });

  const titles = sections.map((section) => section.title.trim().toUpperCase());
  const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
  if (duplicateTitles.length > 0) {
    issues.push({
      code: 'sections.duplicate',
      severity: 'warning',
      message: `Duplicate section title: ${Array.from(new Set(duplicateTitles)).join(', ')}.`,
    });
  }

  const allText = [
    header.fullName,
    header.headline || '',
    header.location,
    header.email,
    header.phone,
    ...sections.map(sectionToPlainText),
  ].join(' ');
  const wordCount = countWords(allText);
  if (wordCount > 1200) {
    issues.push({
      code: 'content.wordCount',
      severity: 'warning',
      message: `The resume is very long (${wordCount} words).`,
      hint: 'Trim older or less relevant content so the document stays easy to scan.',
    });
  }

  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const score = Math.max(
    0,
    Math.min(
      100,
      100 -
        issues.reduce((total, issue) => total + severityWeight[issue.severity], 0)
    )
  );

  return {
    score,
    issues,
    summary: {
      sectionCount: sections.length,
      experienceCount: experienceItems.length,
      educationCount: educationSections.reduce((total, section) => total + section.data.items.length, 0),
      projectCount: projectSections.reduce((total, section) => total + section.data.items.length, 0),
      skillCategoryCount: skillCategories.length,
      bulletCount,
      wordCount,
    },
  };
};
