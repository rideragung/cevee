import type {
  CustomSectionItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeDocument,
  ResumeSection,
  SkillCategory,
} from '../../../types/resume';
import { createItemId } from '../../domain/resumeFactory';
import { normalizeBullets, normalizeText } from './normalize';

export const findSection = (
  resume: ResumeDocument,
  sectionId: string
): ResumeSection | undefined =>
  resume.content.sections.find((section) => section.id === sectionId);

export const sectionItemCount = (section: ResumeSection): number => {
  if (section.type === 'summary' || section.type === 'custom_text') {
    return section.data.html.trim().length > 0 ? 1 : 0;
  }
  if (section.type === 'skills') {
    return section.data.categories.length;
  }
  return section.data.items.length;
};

export const sectionItems = (section: ResumeSection): unknown[] | null => {
  if (section.type === 'summary' || section.type === 'custom_text') return null;
  if (section.type === 'skills') return section.data.categories;
  return section.data.items;
};

export const withSectionItems = (
  section: ResumeSection,
  items: unknown[]
): ResumeSection => {
  if (section.type === 'skills') {
    return {
      ...section,
      data: {
        ...section.data,
        categories: items as SkillCategory[],
      },
    };
  }
  if (section.type === 'experience') {
    return {
      ...section,
      data: {
        ...section.data,
        items: items as ExperienceItem[],
      },
    };
  }
  if (section.type === 'projects') {
    return {
      ...section,
      data: {
        ...section.data,
        items: items as ProjectItem[],
      },
    };
  }
  if (section.type === 'education') {
    return {
      ...section,
      data: {
        ...section.data,
        items: items as EducationItem[],
      },
    };
  }
  if (section.type === 'custom_list') {
    return {
      ...section,
      data: {
        ...section.data,
        items: items as CustomSectionItem[],
      },
    };
  }
  return section;
};

const normalizePosition = (position: unknown): unknown => {
  if (!position || typeof position !== 'object' || Array.isArray(position)) {
    throw new Error('Each position must be an object.');
  }
  const next = { ...(position as Record<string, unknown>) };

  if (typeof next.id !== 'string' || !next.id.trim()) {
    next.id = createItemId('pos');
  }
  next.role = typeof next.role === 'string' ? next.role : '';
  next.period = typeof next.period === 'string' ? next.period : '';

  if (next.bullets !== undefined) {
    if (typeof next.bullets !== 'string' && !Array.isArray(next.bullets)) {
      throw new Error('Position bullets must be a string or a string array.');
    }
    next.bullets =
      normalizeBullets(next.bullets as string | string[] | undefined) ?? '';
  } else {
    next.bullets = '';
  }

  return next;
};

export const normalizeItemForSection = (
  section: ResumeSection,
  item: unknown,
  idPrefix: string
): Record<string, unknown> => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new Error('Each item must be an object.');
  }

  const next: Record<string, unknown> = { ...(item as Record<string, unknown>) };

  if (typeof next.id !== 'string' || !next.id.trim()) {
    next.id = createItemId(idPrefix);
  }

  if (section.type === 'experience' || section.type === 'projects') {
    if (next.bullets !== undefined) {
      if (typeof next.bullets !== 'string' && !Array.isArray(next.bullets)) {
        throw new Error('bullets must be a string or a string array.');
      }
      next.bullets = normalizeBullets(next.bullets as string | string[] | undefined) ?? '';
    }
  }

  if (section.type === 'experience') {
    next.role = typeof next.role === 'string' ? next.role : '';
    next.company = typeof next.company === 'string' ? next.company : '';
    next.location = typeof next.location === 'string' ? next.location : '';
    next.period = typeof next.period === 'string' ? next.period : '';
    if (next.bullets === undefined) next.bullets = '';
    if (Array.isArray(next.positions)) {
      next.positions = next.positions.map(normalizePosition);
    }
  }

  if (section.type === 'projects') {
    next.name = typeof next.name === 'string' ? next.name : '';
    next.period = typeof next.period === 'string' ? next.period : '';
    if (next.bullets === undefined) next.bullets = '';
  }

  if (section.type === 'education') {
    next.degree = typeof next.degree === 'string' ? next.degree : '';
    next.institution = typeof next.institution === 'string' ? next.institution : '';
    next.period = typeof next.period === 'string' ? next.period : '';
  }

  if (section.type === 'custom_list') {
    next.title = typeof next.title === 'string' ? next.title : '';
  }

  if (section.type === 'skills') {
    next.category = typeof next.category === 'string' ? next.category : '';
    next.items = typeof next.items === 'string' ? next.items : '';
  }

  return next;
};

export const normalizeSectionDataPatch = (
  section: ResumeSection,
  data: unknown
): Record<string, unknown> => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('data must be an object.');
  }

  const patch = { ...(data as Record<string, unknown>) };

  if (section.type === 'summary' || section.type === 'custom_text') {
    if (patch.html !== undefined) {
      throw new Error('Send plain text in data.text. Raw HTML is not accepted.');
    }
    if (patch.text !== undefined) {
      if (typeof patch.text !== 'string') {
        throw new Error('data.text must be a string.');
      }
      return { html: normalizeText(patch.text) ?? '' };
    }
    return {};
  }

  if (section.type === 'experience' && patch.items !== undefined) {
    if (!Array.isArray(patch.items)) {
      throw new Error('data.items must be an array.');
    }
    return {
      items: patch.items.map((item) => normalizeItemForSection(section, item, 'exp')),
    };
  }

  if (section.type === 'projects' && patch.items !== undefined) {
    if (!Array.isArray(patch.items)) {
      throw new Error('data.items must be an array.');
    }
    return {
      items: patch.items.map((item) => normalizeItemForSection(section, item, 'proj')),
    };
  }

  return patch;
};
