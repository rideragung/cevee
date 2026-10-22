export interface ParsedHeaderRaw {
  fullName?: string;
  roles?: string[];
  location?: string;
  email?: string;
  phone?: string;
  links?: Array<{ label: string; url: string }>;
}

export interface ParsedSkillCategoryRaw {
  category: string;
  items: string;
}

export interface ParsedExperienceItemRaw {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets?: string[];
}

export interface ParsedEducationItemRaw {
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  description?: string;
}

export interface ParsedProjectItemRaw {
  name: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
}

export interface ParsedCustomItemRaw {
  title: string;
  subtitle?: string;
  period?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

export interface ParsedResumeRaw {
  header?: ParsedHeaderRaw;
  summary?: string;
  skills?: ParsedSkillCategoryRaw[];
  workExperience?: ParsedExperienceItemRaw[];
  education?: ParsedEducationItemRaw[];
  projects?: ParsedProjectItemRaw[];
  volunteering?: ParsedExperienceItemRaw[];
  certifications?: ParsedCustomItemRaw[];
  languages?: ParsedCustomItemRaw[];
  awards?: ParsedCustomItemRaw[];
  publications?: ParsedCustomItemRaw[];
  references?: ParsedCustomItemRaw[];
}
