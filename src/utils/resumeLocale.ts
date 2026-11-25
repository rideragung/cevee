import {
  CustomSectionItem,
  EducationItem,
  ExperienceItem,
  ExperiencePosition,
  HeaderData,
  ProjectItem,
  ResumeDocument,
  ResumeLanguage,
  ResumeSection,
  ResumeSectionPresetKey,
  SectionType,
} from '../types/resume';

export interface ResumeLanguageOption {
  id: ResumeLanguage;
  label: string;
  shortLabel: string;
}

export const RESUME_LANGUAGE_OPTIONS: readonly ResumeLanguageOption[] = [
  {
    id: 'en',
    label: 'English',
    shortLabel: 'EN',
  },
  {
    id: 'id',
    label: 'Bahasa Indonesia',
    shortLabel: 'ID',
  },
];

export const DEFAULT_RESUME_LANGUAGE: ResumeLanguage = 'en';

export const normalizeResumeLanguage = (lang?: string | null): ResumeLanguage =>
  lang === 'id' ? 'id' : 'en';

export const SECTION_PRESET_TITLES: Record<
  Exclude<ResumeSectionPresetKey, 'custom'>,
  Record<ResumeLanguage, string>
> = {
  summary: {
    en: 'SUMMARY',
    id: 'RINGKASAN',
  },
  experience: {
    en: 'WORK EXPERIENCE',
    id: 'PENGALAMAN KERJA',
  },
  education: {
    en: 'EDUCATION',
    id: 'PENDIDIKAN',
  },
  projects: {
    en: 'PROJECTS',
    id: 'PROYEK',
  },
  skills: {
    en: 'SKILLS',
    id: 'KEAHLIAN',
  },
  certifications: {
    en: 'CERTIFICATIONS',
    id: 'SERTIFIKASI',
  },
  languages: {
    en: 'LANGUAGES',
    id: 'BAHASA',
  },
  publications: {
    en: 'PUBLICATIONS',
    id: 'PUBLIKASI',
  },
  awards: {
    en: 'AWARDS',
    id: 'PENGHARGAAN',
  },
  volunteering: {
    en: 'ORGANIZATIONAL & VOLUNTEERING EXPERIENCE',
    id: 'PENGALAMAN ORGANISASI & RELAWAN',
  },
  references: {
    en: 'REFERENCES',
    id: 'REFERENSI',
  },
};

const KNOWN_STANDARD_TITLES: Record<Exclude<ResumeSectionPresetKey, 'custom'>, readonly string[]> = {
  summary: ['SUMMARY', 'PROFESSIONAL SUMMARY', 'RINGKASAN', 'RINGKASAN PROFIL'],
  experience: ['WORK EXPERIENCE', 'EXPERIENCE', 'PENGALAMAN KERJA'],
  education: ['EDUCATION', 'PENDIDIKAN'],
  projects: ['PROJECTS', 'PROYEK'],
  skills: ['SKILLS', 'KEAHLIAN', 'KETERAMPILAN'],
  certifications: ['CERTIFICATIONS', 'SERTIFIKASI'],
  languages: ['LANGUAGES', 'BAHASA'],
  publications: ['PUBLICATIONS', 'PUBLIKASI'],
  awards: ['AWARDS', 'PENGHARGAAN'],
  volunteering: [
    'ORGANIZATIONAL & VOLUNTEERING EXPERIENCE',
    'PENGALAMAN ORGANISASI & RELAWAN',
    'PENGALAMAN ORGANISASI & SUKARELAWAN',
  ],
  references: ['REFERENCES', 'REFERENSI'],
};

export const detectSectionPresetKey = (section: {
  type?: SectionType | string;
  title?: string;
  presetKey?: ResumeSectionPresetKey;
}): ResumeSectionPresetKey => {
  if (section.presetKey) return section.presetKey;

  if (section.type === 'summary') return 'summary';
  if (section.type === 'education') return 'education';
  if (section.type === 'projects') return 'projects';
  if (section.type === 'skills') return 'skills';

  const upper = (section.title || '').trim().toUpperCase();

  if (
    upper.includes('ORGANIZATIONAL') ||
    upper.includes('VOLUNTEER') ||
    upper.includes('ORGANISASI') ||
    upper.includes('RELAWAN') ||
    upper.includes('SUKARELAWAN') ||
    upper.includes('KEORGANISASIAN')
  ) {
    return 'volunteering';
  }

  if (section.type === 'experience') {
    return 'experience';
  }

  if (
    upper.includes('CERTIFICATION') ||
    upper.includes('SERTIFIKASI') ||
    upper.includes('SERTIFIKAT') ||
    upper.includes('LISENSI')
  ) {
    return 'certifications';
  }

  if (upper.includes('LANGUAGE') || upper.includes('BAHASA')) {
    return 'languages';
  }

  if (upper.includes('PUBLICATION') || upper.includes('PUBLIKASI')) {
    return 'publications';
  }

  if (upper.includes('AWARD') || upper.includes('PENGHARGAAN') || upper.includes('PRESTASI')) {
    return 'awards';
  }

  if (upper.includes('REFERENCE') || upper.includes('REFERENSI')) {
    return 'references';
  }

  return 'custom';
};

export const translateStandardSectionTitle = (
  section: { type?: SectionType | string; title: string; presetKey?: ResumeSectionPresetKey },
  targetLang: ResumeLanguage
): string => {
  const key = detectSectionPresetKey(section);
  if (key === 'custom') return section.title;

  const currentUpper = section.title.trim().toUpperCase();
  const known = KNOWN_STANDARD_TITLES[key];
  if (known.includes(currentUpper)) {
    return SECTION_PRESET_TITLES[key][targetLang];
  }
  return section.title;
};

export const MONTHS_SHORT_BY_LANG: Record<ResumeLanguage, readonly string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
};

export const MONTH_TOKEN_TO_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  januari: 0,
  feb: 1,
  february: 1,
  februari: 1,
  mar: 2,
  march: 2,
  maret: 2,
  apr: 3,
  april: 3,
  may: 4,
  mei: 4,
  jun: 5,
  june: 5,
  juni: 5,
  jul: 6,
  july: 6,
  juli: 6,
  aug: 7,
  august: 7,
  agu: 7,
  agt: 7,
  agustus: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  okt: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
  des: 11,
  desember: 11,
};

export const PRESENT_BY_LANG: Record<ResumeLanguage, string> = {
  en: 'Present',
  id: 'Sekarang',
};

export const getShortMonths = (lang?: ResumeLanguage): readonly string[] =>
  MONTHS_SHORT_BY_LANG[normalizeResumeLanguage(lang)];

export const getPresentLabel = (lang?: ResumeLanguage): string =>
  PRESENT_BY_LANG[normalizeResumeLanguage(lang)];

export const isPresentToken = (value?: string): boolean =>
  /^(present|current|now|ongoing|sekarang|saat ini|hingga kini)$/i.test((value || '').trim());

export const containsPresentToken = (value?: string): boolean =>
  /\b(present|current|now|ongoing|sekarang|saat ini|hingga kini)\b/i.test(value || '');

export const localizeDateString = (value: string | undefined, lang: ResumeLanguage): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  const months = MONTHS_SHORT_BY_LANG[lang];
  const presentLabel = PRESENT_BY_LANG[lang];

  // Replace multi-word Indonesian present variants first
  let result = trimmed.replace(/\b(saat ini|hingga kini)\b/gi, presentLabel);

  // Replace single-word present variants
  result = result.replace(/\b(present|current|sekarang)\b/gi, presentLabel);

  // Replace month words followed by a 4-digit year (e.g. "Aug 2025", "Agustus 2025")
  result = result.replace(/\b([A-Za-z]+)(\s+(?:19|20)\d{2})\b/g, (full, word: string, yearPart: string) => {
    const idx = MONTH_TOKEN_TO_INDEX[word.toLowerCase()];
    if (idx === undefined) return full;
    return `${months[idx]}${yearPart}`;
  });

  return result;
};

export const formatComputedPeriod = (
  item: {
    startDate?: string;
    endDate?: string;
    current?: boolean;
    period?: string;
  },
  lang?: ResumeLanguage
): string => {
  const normalizedLang = normalizeResumeLanguage(lang);
  const present = PRESENT_BY_LANG[normalizedLang];
  const start = localizeDateString(item.startDate, normalizedLang);
  const end = localizeDateString(item.endDate, normalizedLang);

  if (item.current) {
    return start ? `${start} - ${present}` : present;
  }
  if (start && end) {
    return `${start} - ${end}`;
  }
  return start || end || localizeDateString(item.period, normalizedLang);
};

export const isHeaderRelocating = (header: HeaderData): boolean =>
  Boolean(
    header.willingToRelocate ??
      (header.relocationStatus && /(willing|bersedia)/i.test(header.relocationStatus))
  );

export const stripGpaPrefix = (gpa: string): string => gpa.replace(/^\s*(GPA|IPK)\s*:\s*/i, '');

export const stripCredentialIdPrefix = (value: string): string =>
  value.replace(/^(Credential ID|ID Kredensial)\s*:\s*/i, '');

export interface ResumeLocaleStrings {
  present: string;
  relocateParen: string;
  relocatePipe: string;
  gpaLabel: string;
  relatedCourseworkLabel: string;
  finalThesisLabel: string;
  credentialIdLabel: string;
  certByConnector: string;
  defaultBulletPrompt: string;
  defaultRoleBulletPrompt: string;
  defaultProjectBulletPrompt: string;
  placeholderName: string;
  placeholderLocation: string;
  placeholderEmail: string;
  placeholderPhone: string;
  placeholderSummary: string;
  placeholderSkillCategory: string;
  placeholderSkillItems: string;
  placeholderPosition: string;
  placeholderPeriod: string;
  placeholderCompany: string;
  placeholderExpDesc: string;
  placeholderProjectName: string;
  placeholderProjectLink: string;
  placeholderProjectDesc: string;
  placeholderDegree: string;
  placeholderTranscript: string;
  placeholderInstitution: string;
  placeholderGpa: string;
  placeholderCoursework: string;
  placeholderThesis: string;
  placeholderEduNote: string;
  placeholderCertTitle: string;
  placeholderCertIssuer: string;
  placeholderCertPeriod: string;
  placeholderLanguages: readonly { name: string; proficiency: string }[];
  placeholderPubTitle: string;
  placeholderPubPeriod: string;
  placeholderPubDesc: string;
  placeholderAwardTitle: string;
  placeholderAwardPeriod: string;
  placeholderAwardDesc: string;
  placeholderRefName: string;
  placeholderRefRole: string;
  placeholderRefContact: string;
}

const RESUME_LOCALES: Record<ResumeLanguage, ResumeLocaleStrings> = {
  en: {
    present: 'Present',
    relocateParen: ' (Willing to relocate)',
    relocatePipe: ' | Willing to relocate',
    gpaLabel: 'GPA: ',
    relatedCourseworkLabel: 'Related Coursework: ',
    finalThesisLabel: 'Final Thesis: ',
    credentialIdLabel: 'Credential ID',
    certByConnector: ' by ',
    defaultBulletPrompt: '<ul><li>Describe your responsibilities and achievements...</li></ul>',
    defaultRoleBulletPrompt:
      '<ul><li>Describe your responsibilities and achievements for this role...</li></ul>',
    defaultProjectBulletPrompt:
      '<ul><li>Describe project goals, technical highlights, and key results...</li></ul>',
    placeholderName: 'Your Name',
    placeholderLocation: 'City, State/Country',
    placeholderEmail: 'email@address.com',
    placeholderPhone: '+65 1234 5678',
    placeholderSummary:
      'Results-driven professional with proven experience delivering impactful solutions and collaborating across multidisciplinary teams. Skilled in problem-solving, project execution, and standardizing workflows that drive measurable business outcomes. Passionate about continuous learning and contributing to high-performing product environments.',
    placeholderSkillCategory: 'Skill Category: ',
    placeholderSkillItems: 'Skill Name 1, Skill Name 2, Skill Name 3, Skill Name 4, Skill Name 5, etc',
    placeholderPosition: 'Position',
    placeholderPeriod: 'May 2022 - Present',
    placeholderCompany: 'Company Name',
    placeholderExpDesc:
      'State your tasks and accomplishments including name of the project and position of responsibility held.',
    placeholderProjectName: 'Project Name',
    placeholderProjectLink: 'project link',
    placeholderProjectDesc:
      'State your tasks and accomplishments including name of the project and position of responsibility held.',
    placeholderDegree: 'Bachelor of Computer Science',
    placeholderTranscript: '(Transcript)',
    placeholderInstitution: 'Name of the Educational Institution',
    placeholderGpa: 'GPA: 4.0 of 4.0',
    placeholderCoursework: 'Data Structures, Algorithms, Software Engineering, Database Systems',
    placeholderThesis: 'Design and Implementation of Distributed Real-Time Systems',
    placeholderEduNote: 'E.g., info about scholarships, student activity, etc.',
    placeholderCertTitle: 'Learn Basic AI (Credential ID: 6RPNR3EJ9X2M)',
    placeholderCertIssuer: 'Dicoding Indonesia',
    placeholderCertPeriod: 'Jan 2025 - Jan 2028',
    placeholderLanguages: [
      { name: 'Bahasa Indonesia', proficiency: 'Native proficiency' },
      { name: 'Vietnamese', proficiency: 'Full working proficiency' },
      { name: 'English', proficiency: 'Professional working proficiency' },
    ],
    placeholderPubTitle: 'Publication Title (Publisher)',
    placeholderPubPeriod: 'May 2022',
    placeholderPubDesc:
      'Provide a brief overview of the research, emphasizing significant findings...',
    placeholderAwardTitle: 'Title (Issuer)',
    placeholderAwardPeriod: 'May 2022',
    placeholderAwardDesc:
      'Write a concise description of the award, highlighting key achievements...',
    placeholderRefName: 'Richard Hendricks',
    placeholderRefRole: 'Co-founder of Pied Piper',
    placeholderRefContact: 'richard@piedpiper.com',
  },
  id: {
    present: 'Sekarang',
    relocateParen: ' (Bersedia relokasi)',
    relocatePipe: ' | Bersedia relokasi',
    gpaLabel: 'IPK: ',
    relatedCourseworkLabel: 'Mata Kuliah Relevan: ',
    finalThesisLabel: 'Tugas Akhir: ',
    credentialIdLabel: 'ID Kredensial',
    certByConnector: ' oleh ',
    defaultBulletPrompt: '<ul><li>Jelaskan tanggung jawab dan pencapaian utama Anda...</li></ul>',
    defaultRoleBulletPrompt:
      '<ul><li>Jelaskan tanggung jawab dan pencapaian untuk peran ini...</li></ul>',
    defaultProjectBulletPrompt:
      '<ul><li>Jelaskan tujuan proyek, sorotan teknis, dan hasil utama...</li></ul>',
    placeholderName: 'Nama Lengkap',
    placeholderLocation: 'Kota, Provinsi/Negara',
    placeholderEmail: 'email@alamat.com',
    placeholderPhone: '+62 812 3456 7890',
    placeholderSummary:
      'Profesional berorientasi hasil dengan pengalaman teruji dalam menghadirkan solusi berdampak dan berkolaborasi lintas tim multidisiplin. Terampil dalam pemecahan masalah, eksekusi proyek, serta standarisasi alur kerja yang mendorong capaian bisnis terukur. Berkomitmen pada pembelajaran berkelanjutan dan kontribusi di lingkungan produk berkinerja tinggi.',
    placeholderSkillCategory: 'Kategori Keahlian: ',
    placeholderSkillItems: 'Keahlian 1, Keahlian 2, Keahlian 3, Keahlian 4, Keahlian 5, dst.',
    placeholderPosition: 'Posisi / Jabatan',
    placeholderPeriod: 'Mei 2022 - Sekarang',
    placeholderCompany: 'Nama Perusahaan',
    placeholderExpDesc:
      'Uraikan tugas dan pencapaian Anda beserta nama proyek serta tanggung jawab yang diemban.',
    placeholderProjectName: 'Nama Proyek',
    placeholderProjectLink: 'tautan proyek',
    placeholderProjectDesc:
      'Uraikan tugas dan pencapaian Anda beserta nama proyek serta tanggung jawab yang diemban.',
    placeholderDegree: 'Sarjana Ilmu Komputer',
    placeholderTranscript: '(Transkrip)',
    placeholderInstitution: 'Nama Institusi Pendidikan',
    placeholderGpa: 'IPK: 4.00 / 4.00',
    placeholderCoursework:
      'Struktur Data, Algoritma, Rekayasa Perangkat Lunak, Sistem Basis Data',
    placeholderThesis: 'Perancangan dan Implementasi Sistem Real-Time Terdistribusi',
    placeholderEduNote: 'Contoh: penerima beasiswa prestasi, aktivitas organisasi mahasiswa, dll.',
    placeholderCertTitle: 'Belajar Dasar AI (ID Kredensial: 6RPNR3EJ9X2M)',
    placeholderCertIssuer: 'Dicoding Indonesia',
    placeholderCertPeriod: 'Jan 2025 - Jan 2028',
    placeholderLanguages: [
      { name: 'Bahasa Indonesia', proficiency: 'Penutur asli' },
      { name: 'Bahasa Inggris', proficiency: 'Kemahiran profesional' },
      { name: 'Bahasa Jepang', proficiency: 'Menengah' },
    ],
    placeholderPubTitle: 'Judul Publikasi (Penerbit)',
    placeholderPubPeriod: 'Mei 2022',
    placeholderPubDesc: 'Tuliskan ringkasan singkat penelitian beserta temuan utamanya...',
    placeholderAwardTitle: 'Nama Penghargaan (Penyelenggara)',
    placeholderAwardPeriod: 'Mei 2022',
    placeholderAwardDesc: 'Tuliskan deskripsi singkat penghargaan serta capaian utamanya...',
    placeholderRefName: 'Budi Santoso',
    placeholderRefRole: 'Head of Engineering di PT Nusantara Digital',
    placeholderRefContact: 'budi@nusantara.id',
  },
};

export const getResumeLocale = (lang?: ResumeLanguage | string | null): ResumeLocaleStrings =>
  RESUME_LOCALES[normalizeResumeLanguage(lang)];

export const buildDefaultHeader = (
  lang: ResumeLanguage,
  idPrefix: string,
  roles: string[] = [],
  headline = ''
): HeaderData => {
  const locale = getResumeLocale(lang);
  return {
    fullName: locale.placeholderName,
    isPlaceholder: true,
    roles,
    headline,
    location: locale.placeholderLocation,
    willingToRelocate: false,
    relocationStatus: '',
    email: locale.placeholderEmail,
    phone: locale.placeholderPhone,
    links: [
      {
        id: `${idPrefix}-1`,
        label: 'linkedin.com/in/your_linkedin',
        url: 'https://linkedin.com',
      },
      {
        id: `${idPrefix}-2`,
        label: 'github.com/username',
        url: 'https://github.com',
      },
      {
        id: `${idPrefix}-3`,
        label: 'otherlink.com',
        url: 'https://example.com',
      },
    ],
  };
};

export const buildDefaultSections = (
  lang: ResumeLanguage,
  idPrefix: string
): ResumeSection[] => {
  const titles = SECTION_PRESET_TITLES;
  return [
    {
      id: `${idPrefix}-summary`,
      type: 'summary',
      presetKey: 'summary',
      title: titles.summary[lang],
      showTitle: false,
      isPlaceholder: true,
      data: { html: '' },
    },
    {
      id: `${idPrefix}-experience`,
      type: 'experience',
      presetKey: 'experience',
      title: titles.experience[lang],
      isPlaceholder: true,
      data: { items: [] },
    },
    {
      id: `${idPrefix}-education`,
      type: 'education',
      presetKey: 'education',
      title: titles.education[lang],
      isPlaceholder: true,
      data: { items: [] },
    },
    {
      id: `${idPrefix}-projects`,
      type: 'projects',
      presetKey: 'projects',
      title: titles.projects[lang],
      isPlaceholder: true,
      data: { items: [] },
    },
    {
      id: `${idPrefix}-skills`,
      type: 'skills',
      presetKey: 'skills',
      title: titles.skills[lang],
      isPlaceholder: true,
      data: { categories: [] },
    },
  ];
};

const ALL_DEFAULT_BULLET_PROMPTS = new Set([
  RESUME_LOCALES.en.defaultBulletPrompt,
  RESUME_LOCALES.id.defaultBulletPrompt,
  RESUME_LOCALES.en.defaultRoleBulletPrompt,
  RESUME_LOCALES.id.defaultRoleBulletPrompt,
  RESUME_LOCALES.en.defaultProjectBulletPrompt,
  RESUME_LOCALES.id.defaultProjectBulletPrompt,
]);

const localizePosition = (pos: ExperiencePosition, lang: ResumeLanguage): ExperiencePosition => {
  const locale = getResumeLocale(lang);
  const startDate = localizeDateString(pos.startDate, lang);
  const endDate = pos.current && isPresentToken(pos.endDate) ? '' : localizeDateString(pos.endDate, lang);
  const period = formatComputedPeriod({ ...pos, startDate, endDate }, lang);
  const bullets = ALL_DEFAULT_BULLET_PROMPTS.has(pos.bullets)
    ? locale.defaultBulletPrompt
    : pos.bullets;
  return {
    ...pos,
    startDate,
    endDate,
    period,
    bullets,
  };
};

const localizeExperienceItem = (item: ExperienceItem, lang: ResumeLanguage): ExperienceItem => {
  const locale = getResumeLocale(lang);
  const startDate = localizeDateString(item.startDate, lang);
  const endDate =
    item.current && isPresentToken(item.endDate) ? '' : localizeDateString(item.endDate, lang);
  const period = formatComputedPeriod({ ...item, startDate, endDate }, lang);
  const bullets = ALL_DEFAULT_BULLET_PROMPTS.has(item.bullets)
    ? locale.defaultBulletPrompt
    : item.bullets;
  const positions = item.positions?.map((p) => localizePosition(p, lang));

  return {
    ...item,
    startDate,
    endDate,
    period,
    bullets,
    positions,
  };
};

const localizeEducationItem = (item: EducationItem, lang: ResumeLanguage): EducationItem => {
  const startDate = localizeDateString(item.startDate, lang);
  const endDate =
    item.current && isPresentToken(item.endDate) ? '' : localizeDateString(item.endDate, lang);
  const period = formatComputedPeriod({ ...item, startDate, endDate }, lang);
  const gpa = item.gpa ? stripGpaPrefix(item.gpa) : item.gpa;

  return {
    ...item,
    startDate,
    endDate,
    period,
    gpa,
  };
};

const localizeProjectItem = (item: ProjectItem, lang: ResumeLanguage): ProjectItem => {
  const locale = getResumeLocale(lang);
  const startDate = localizeDateString(item.startDate, lang);
  const endDate = localizeDateString(item.endDate, lang);
  const period =
    startDate && endDate
      ? `${startDate} - ${endDate}`
      : startDate || endDate || localizeDateString(item.period, lang);
  const bullets = ALL_DEFAULT_BULLET_PROMPTS.has(item.bullets)
    ? locale.defaultProjectBulletPrompt
    : item.bullets;

  return {
    ...item,
    startDate,
    endDate,
    period,
    bullets,
  };
};

const localizeCustomItem = (
  item: CustomSectionItem,
  presetKey: ResumeSectionPresetKey,
  lang: ResumeLanguage
): CustomSectionItem => {
  // References store contact/email in `period`; Languages have no date period
  if (presetKey === 'references' || presetKey === 'languages') {
    return item;
  }

  const issueDate = item.issueDate ? localizeDateString(item.issueDate, lang) : item.issueDate;
  const expiryDate = item.expiryDate ? localizeDateString(item.expiryDate, lang) : item.expiryDate;
  const period =
    presetKey === 'certifications' && (issueDate || expiryDate)
      ? issueDate && expiryDate
        ? `${issueDate} - ${expiryDate}`
        : issueDate || expiryDate || ''
      : localizeDateString(item.period, lang);

  return {
    ...item,
    issueDate,
    expiryDate,
    period,
  };
};

export const switchResumeLanguage = (
  resume: ResumeDocument,
  targetLang: ResumeLanguage
): ResumeDocument => {
  const prevLang = normalizeResumeLanguage(resume.content.language);
  const prevLocale = getResumeLocale(prevLang);
  const nextLocale = getResumeLocale(targetLang);

  const prevHeader = resume.content.header;
  const relocating = isHeaderRelocating(prevHeader);

  const updatedHeader: HeaderData = {
    ...prevHeader,
    fullName:
      prevHeader.isPlaceholder && prevHeader.fullName === prevLocale.placeholderName
        ? nextLocale.placeholderName
        : prevHeader.fullName,
    location:
      prevHeader.isPlaceholder && prevHeader.location === prevLocale.placeholderLocation
        ? nextLocale.placeholderLocation
        : prevHeader.location,
    email:
      prevHeader.isPlaceholder && prevHeader.email === prevLocale.placeholderEmail
        ? nextLocale.placeholderEmail
        : prevHeader.email,
    phone:
      prevHeader.isPlaceholder && prevHeader.phone === prevLocale.placeholderPhone
        ? nextLocale.placeholderPhone
        : prevHeader.phone,
    willingToRelocate: relocating,
    relocationStatus: relocating ? nextLocale.relocateParen.trim() : '',
  };

  const updatedSections: ResumeSection[] = resume.content.sections.map((sec) => {
    const presetKey = detectSectionPresetKey(sec);
    const nextTitle = translateStandardSectionTitle(sec, targetLang);

    if (sec.type === 'experience') {
      return {
        ...sec,
        presetKey,
        title: nextTitle,
        data: {
          items: (sec.data.items || []).map((it) => localizeExperienceItem(it, targetLang)),
        },
      };
    }

    if (sec.type === 'education') {
      return {
        ...sec,
        presetKey,
        title: nextTitle,
        data: {
          items: (sec.data.items || []).map((it) => localizeEducationItem(it, targetLang)),
        },
      };
    }

    if (sec.type === 'projects') {
      return {
        ...sec,
        presetKey,
        title: nextTitle,
        data: {
          items: (sec.data.items || []).map((it) => localizeProjectItem(it, targetLang)),
        },
      };
    }

    if (sec.type === 'custom_list') {
      return {
        ...sec,
        presetKey,
        title: nextTitle,
        data: {
          items: (sec.data.items || []).map((it) => localizeCustomItem(it, presetKey, targetLang)),
        },
      };
    }

    return {
      ...sec,
      presetKey,
      title: nextTitle,
    };
  });

  return {
    ...resume,
    content: {
      ...resume.content,
      language: targetLang,
      header: updatedHeader,
      sections: updatedSections,
    },
  };
};
