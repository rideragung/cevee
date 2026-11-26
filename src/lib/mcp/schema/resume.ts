import { z } from 'zod';
import type { ResumeDocument } from '../../../types/resume';

export const resumeLanguageSchema = z.enum(['en', 'id']);

export const resumeSectionPresetKeySchema = z.enum([
  'summary',
  'experience',
  'education',
  'projects',
  'skills',
  'certifications',
  'languages',
  'publications',
  'awards',
  'volunteering',
  'references',
  'custom',
]);

export const contactLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
});

export const headerSchema = z.object({
  fullName: z.string(),
  roles: z.array(z.string()).optional(),
  headline: z.string().optional(),
  location: z.string(),
  willingToRelocate: z.boolean().optional(),
  relocationStatus: z.string().optional(),
  email: z.string(),
  phone: z.string(),
  links: z.array(contactLinkSchema),
  photoUrl: z.string().optional(),
  isPlaceholder: z.boolean().optional(),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string(),
  items: z.string(),
});

export const experiencePositionSchema = z.object({
  id: z.string(),
  role: z.string(),
  period: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  bullets: z.string(),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  location: z.string(),
  period: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  bullets: z.string(),
  positions: z.array(experiencePositionSchema).optional(),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional(),
  period: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.string(),
});

export const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  period: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  gpa: z.string().optional(),
  url: z.string().optional(),
  urlLabel: z.string().optional(),
  relatedCoursework: z.string().optional(),
  thesisTitle: z.string().optional(),
  thesisUrl: z.string().optional(),
  description: z.string().optional(),
});

export const customSectionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  period: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const baseSectionShape = {
  id: z.string(),
  title: z.string(),
  presetKey: resumeSectionPresetKeySchema.optional(),
  showTitle: z.boolean().optional(),
  isPlaceholder: z.boolean().optional(),
};

export const summarySectionSchema = z.object({
  ...baseSectionShape,
  type: z.literal('summary'),
  data: z.object({ html: z.string() }),
});

export const skillsSectionSchema = z.object({
  ...baseSectionShape,
  type: z.literal('skills'),
  data: z.object({ categories: z.array(skillCategorySchema) }),
});

export const experienceSectionSchema = z.object({
  ...baseSectionShape,
  type: z.literal('experience'),
  data: z.object({ items: z.array(experienceItemSchema) }),
});

export const projectsSectionSchema = z.object({
  ...baseSectionShape,
  type: z.literal('projects'),
  data: z.object({ items: z.array(projectItemSchema) }),
});

export const educationSectionSchema = z.object({
  ...baseSectionShape,
  type: z.literal('education'),
  data: z.object({ items: z.array(educationItemSchema) }),
});

export const customTextSectionSchema = z.object({
  ...baseSectionShape,
  type: z.literal('custom_text'),
  data: z.object({ html: z.string() }),
});

export const customListSectionSchema = z.object({
  ...baseSectionShape,
  type: z.literal('custom_list'),
  data: z.object({ items: z.array(customSectionItemSchema) }),
});

export const resumeSectionSchema = z.discriminatedUnion('type', [
  summarySectionSchema,
  skillsSectionSchema,
  experienceSectionSchema,
  projectsSectionSchema,
  educationSectionSchema,
  customTextSectionSchema,
  customListSectionSchema,
]);

export const resumeContentSchema = z.object({
  language: resumeLanguageSchema.optional(),
  schemaVersion: z.number().int().optional(),
  header: headerSchema,
  sections: z.array(resumeSectionSchema),
});

/**
 * Compile-time guard: if ResumeDocument changes and this schema does not,
 * `tsc` fails. Keep this annotation instead of inferring the document type.
 */
export const resumeDocumentSchema: z.ZodType<ResumeDocument> = z.object({
  id: z.string(),
  title: z.string(),
  layoutId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string(),
  version: z.number().int().optional(),
  content: resumeContentSchema,
});

export const parseResumeDocument = (input: unknown): ResumeDocument =>
  resumeDocumentSchema.parse(input);

export const safeParseResumeDocument = (input: unknown) => resumeDocumentSchema.safeParse(input);
