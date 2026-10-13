export interface ContactLink {
  id: string;
  label: string;
  url: string;
}

export interface HeaderData {
  fullName: string;
  roles?: string[]; // Max 4 target roles, automatically joined with " | "
  headline?: string; // Fallback string
  location: string;
  willingToRelocate?: boolean; // Checklist: if true, outputs "(Willing to relocate)"
  relocationStatus?: string;
  email: string;
  phone: string;
  links: ContactLink[];
  photoUrl?: string; // Optional profile photo (compressed Base64/URL)
  isPlaceholder?: boolean; // If true, renders "Your Name" etc. in muted slate-400
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string;
}

export interface ExperiencePosition {
  id: string;
  role: string;
  period: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string; // Displayed string e.g. "Aug 2025 - Dec 2025"
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string; // HTML string for rich list
  positions?: ExperiencePosition[]; // For multiple positions / promotions in 1 company
}

export interface ProjectItem {
  id: string;
  name: string;
  url?: string;
  period: string;
  startDate?: string;
  endDate?: string;
  bullets: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  period?: string;
  issueDate?: string; // Certifications: issue date (used with expiryDate to build period)
  expiryDate?: string; // Certifications: optional expiry date
  description?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export type SectionType =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'custom_text'
  | 'custom_list';

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string; // Customizable title!
  showTitle?: boolean; // Can be hidden (e.g. for summary)
  isPlaceholder?: boolean; // When newly added, shows dummy template in view mode and empty inputs in edit mode
  data: any;
}

export interface ResumeContent {
  header: HeaderData;
  sections: ResumeSection[];
}

export interface ResumeDocument {
  id: string;
  title: string;
  layoutId?: string; // Layout selector e.g. 'classic-ats' | 'modern-sidebar'
  createdAt?: string; // ISO timestamp when the resume was first created
  updatedAt: string;
  content: ResumeContent;
}
