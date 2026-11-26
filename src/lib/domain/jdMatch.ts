import type { ResumeDocument, ResumeSection } from '../../types/resume';
import { htmlToPlainText } from './html';

export interface JdMatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
}

const STOPWORDS = new Set([
  // English common stopwords & job-post boilerplate
  'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone',
  'along', 'already', 'also', 'although', 'always', 'am', 'among', 'an', 'and', 'another',
  'any', 'anyone', 'anything', 'anywhere', 'applicant', 'applicants', 'application', 'apply',
  'are', 'area', 'areas', 'around', 'as', 'ask', 'asked', 'at', 'available', 'away', 'back',
  'base', 'based', 'be', 'became', 'because', 'become', 'becomes', 'been', 'before', 'began',
  'behind', 'being', 'believe', 'below', 'benefit', 'benefits', 'best', 'better', 'between',
  'beyond', 'big', 'bonus', 'both', 'bring', 'build', 'building', 'business', 'but', 'by',
  'call', 'came', 'can', 'candidate', 'candidates', 'career', 'care', 'Clear', 'clear',
  'client', 'clients', 'close', 'closely', 'collaborate', 'collaboration', 'collaborative',
  'come', 'committed', 'communication', 'companies', 'company', 'compensation', 'competitive',
  'complex', 'comprehensive', 'contribute', 'core', 'could', 'create', 'creating', 'creative',
  'culture', 'current', 'currently', 'customer', 'customers', 'daily', 'day', 'days', 'degree',
  'deliver', 'delivering', 'delivery', 'department', 'depending', 'description', 'desired',
  'detail', 'detailed', 'details', 'develop', 'developing', 'development', 'different',
  'direct', 'directly', 'diverse', 'do', 'does', 'doing', 'done', 'down', 'drive', 'driven',
  'driving', 'during', 'duties', 'each', 'early', 'easy', 'education', 'effective',
  'effectively', 'either', 'email', 'employee', 'employees', 'employer', 'employment',
  'enable', 'end', 'energetic', 'enjoy', 'ensure', 'ensuring', 'environment', 'equal',
  'equivalent', 'essential', 'etc', 'even', 'every', 'everyone', 'everything', 'excellent',
  'exciting', 'existing', 'expect', 'expected', 'experience', 'experienced', 'expertise',
  'Exposure', 'exposure', 'extra', 'familiar', 'familiarity', 'fast', 'fast-paced', 'feature',
  'features', 'field', 'find', 'first', 'fit', 'flexible', 'focus', 'focused', 'following',
  'for', 'form', 'forward', 'found', 'free', 'from', 'full', 'full-time', 'fully', 'fun',
  'function', 'functional', 'functions', 'future', 'gain', 'general', 'get', 'give', 'given',
  'global', 'go', 'goal', 'goals', 'good', 'great', 'grow', 'growing', 'growth', 'guide',
  'had', 'hand', 'hands', 'hands-on', 'hard', 'has', 'have', 'having', 'he', 'health', 'help',
  'helping', 'her', 'here', 'high', 'high-quality', 'highly', 'him', 'hire', 'hiring', 'his',
  'hold', 'home', 'hour', 'hours', 'how', 'however', 'hybrid', 'ideal', 'ideally', 'ideas',
  'identify', 'if', 'impact', 'implement', 'implementing', 'important', 'improve', 'improving',
  'in', 'include', 'includes', 'including', 'inclusive', 'independent', 'independently',
  'individual', 'individuals', 'industry', 'information', 'initiative', 'initiatives',
  'innovation', 'innovative', 'inside', 'instead', 'interest', 'interested', 'internal',
  'into', 'involved', 'is', 'issue', 'issues', 'it', 'its', 'itself', 'job', 'join', 'joining',
  'junior', 'just', 'keep', 'key', 'kind', 'know', 'knowledge', 'known', 'large', 'last',
  'later', 'latest', 'lead', 'leader', 'leaders', 'leadership', 'leading', 'learn', 'learning',
  'least', 'leave', 'less', 'let', 'level', 'life', 'like', 'likely', 'limit', 'limited',
  'line', 'link', 'list', 'little', 'live', 'local', 'located', 'location', 'long', 'look',
  'looking', 'love', 'low', 'made', 'main', 'maintain', 'maintaining', 'major', 'make',
  'making', 'manage', 'management', 'manager', 'managing', 'many', 'market', 'matter', 'may',
  'me', 'mean', 'means', 'medical', 'meet', 'meeting', 'member', 'members', 'mentor', 'might',
  'mind', 'Mindset', 'mindset', 'minimum', 'mission', 'modern', 'month', 'months', 'more',
  'most', 'motivated', 'move', 'moving', 'much', 'multiple', 'must', 'my', 'name', 'national',
  'near', 'necessary', 'need', 'needed', 'needs', 'network', 'never', 'new', 'next', 'nice',
  'no', 'non', 'none', 'not', 'note', 'nothing', 'now', 'number', 'of', 'off', 'offer',
  'offering', 'offers', 'office', 'often', 'on', 'once', 'one', 'online', 'only', 'onsite',
  'open', 'operate', 'operating', 'operation', 'operations', 'opportunity', 'opportunities',
  'option', 'options', 'or', 'order', 'organization', 'organizational', 'other', 'others',
  'our', 'out', 'outside', 'over', 'overall', 'own', 'ownership', 'pace', 'paced', 'package',
  'paid', 'part', 'part-time', 'participate', 'partner', 'partners', 'passion', 'passionate',
  'past', 'path', 'pay', 'people', 'per', 'perform', 'performance', 'performing', 'period',
  'person', 'personal', 'place', 'plan', 'planning', 'plans', 'platform', 'platforms', 'play',
  'player', 'please', 'plus', 'point', 'points', 'policies', 'policy', 'position', 'positions',
  'positive', 'possible', 'post', 'posting', 'potential', 'power', 'powerful', 'practical',
  'practice', 'practices', 'prefer', 'preferred', 'prepare', 'present', 'previous', 'primary',
  'prior', 'priority', 'proactive', 'problem', 'problem-solving', 'problems', 'process',
  'processes', 'produce', 'product', 'production', 'products', 'professional', 'professionals',
  'proficiency', 'proficient', 'program', 'programs', 'progress', 'project', 'projects',
  'provide', 'providing', 'pto', 'public', 'purpose', 'put', 'qualification', 'qualifications',
  'qualified', 'quality', 'question', 'questions', 'quickly', 'range', 'rate', 'rather',
  'reach', 'read', 'ready', 'real', 'really', 'reason', 'receive', 'recent', 'record',
  'reference', 'regard', 'regarding', 'region', 'regular', 'related', 'relationship',
  'relationships', 'relevant', 'reliable', 'relocate', 'remote', 'report', 'reporting',
  'require', 'required', 'requirement', 'requirements', 'requires', 'research', 'resolve',
  'resource', 'resources', 'respect', 'respond', 'responsibilities', 'responsibility',
  'responsible', 'result', 'results', 'resume', 'review', 'rewarding', 'right', 'role',
  'roles', 'room', 'run', 'running', 'safe', 'salary', 'same', 'save', 'scale', 'schedule',
  'school', 'scope', 'search', 'second', 'section', 'sector', 'secure', 'see', 'seek',
  'seeking', 'seem', 'select', 'selected', 'self', 'self-motivated', 'send', 'senior', 'sense',
  'service', 'services', 'set', 'setting', 'several', 'share', 'shared', 'sharing', 'she',
  'shift', 'short', 'should', 'show', 'side', 'similar', 'simple', 'since', 'single', 'site',
  'situation', 'size', 'skill', 'skilled', 'skills', 'small', 'so', 'social', 'solid',
  'solution', 'solutions', 'solve', 'solving', 'some', 'someone', 'something', 'sometimes',
  'soon', 'sort', 'sound', 'source', 'space', 'speak', 'special', 'specific', 'speed', 'spend',
  'spoken', 'staff', 'stage', 'stakeholder', 'stakeholders', 'standard', 'standards', 'start',
  'starting', 'startup', 'state', 'status', 'stay', 'step', 'steps', 'still', 'stop', 'store',
  'strategic', 'strategy', 'strong', 'structure', 'student', 'study', 'style', 'subject',
  'submit', 'success', 'successful', 'successfully', 'such', 'suite', 'summary', 'support',
  'supporting', 'sure', 'system', 'systems', 'table', 'take', 'taking', 'talent', 'talented',
  'talk', 'target', 'task', 'tasks', 'team', 'teams', 'technical', 'technologies',
  'technology', 'tell', 'term', 'terms', 'than', 'that', 'the', 'their', 'them', 'themselves',
  'then', 'there', 'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinking',
  'third', 'this', 'those', 'though', 'thought', 'three', 'through', 'throughout', 'thus',
  'time', 'timely', 'times', 'title', 'to', 'today', 'together', 'too', 'tool', 'tools', 'top',
  'total', 'toward', 'towards', 'track', 'tracking', 'training', 'translate', 'travel',
  'trend', 'trends', 'true', 'trust', 'try', 'turn', 'two', 'type', 'types', 'understand',
  'understanding', 'unique', 'unit', 'university', 'unless', 'until', 'up', 'update',
  'updates', 'upon', 'us', 'use', 'used', 'useful', 'user', 'users', 'using', 'usually',
  'vacation', 'valuable', 'value', 'values', 'variety', 'various', 'verbal', 'very', 'via',
  'view', 'vision', 'visit', 'want', 'wants', 'way', 'ways', 'we', 'web', 'website', 'week',
  'weeks', 'well', 'were', 'what', 'whatever', 'when', 'where', 'whether', 'which', 'while',
  'who', 'whole', 'whom', 'whose', 'why', 'wide', 'will', 'willing', 'win', 'with', 'within',
  'without', 'word', 'words', 'work', 'working', 'workplace', 'works', 'world', 'world-class',
  'would', 'write', 'writing', 'written', 'year', 'years', 'yes', 'yet', 'you', 'young',
  'your', 'yours', 'yourself',
  // Indonesian common stopwords
  'ada', 'adalah', 'agar', 'akan', 'atau', 'bisa', 'dalam', 'dan', 'dari', 'dengan', 'di',
  'divisi', 'gaji', 'harus', 'ini', 'itu', 'jika', 'juga', 'kami', 'kantor', 'karena', 'ke',
  'kerja', 'kandidat', 'kemampuan', 'kepada', 'kualifikasi', 'lain', 'lainnya', 'lamaran',
  'lebih', 'lowongan', 'mampu', 'melakukan', 'melalui', 'membuat', 'memiliki', 'memahami',
  'menjadi', 'minimal', 'oleh', 'pada', 'pekerjaan', 'pengalaman', 'perusahaan', 'posisi',
  'proses', 'minimal', 'menguasai', 'secara', 'sebagai', 'sebuah', 'selama', 'semua',
  'seperti', 'serta', 'sesuai', 'dapat', 'tahun', ' tanggung', 'tim', 'tinggi', 'untuk',
  'utama', 'yang',
]);

// Known multi-word or special-character technical phrases to preserve intact
const KNOWN_PHRASES: readonly string[] = [
  'next.js',
  'node.js',
  'vue.js',
  'nuxt.js',
  'nest.js',
  'express.js',
  'react native',
  'ci/cd',
  'ui/ux',
  'rest api',
  'restful api',
  'graphql',
  'machine learning',
  'deep learning',
  'data science',
  'data analysis',
  'data engineering',
  'product management',
  'project management',
  'design system',
  'design systems',
  'user research',
  'usability testing',
  'wireframing',
  'prototyping',
  'a/b testing',
  'tailwind css',
  'google cloud',
  'amazon web services',
  'spring boot',
  'ruby on rails',
  'c++',
  'c#',
  '.net',
  'power bi',
  'scikit-learn',
  'unit testing',
  'end-to-end testing',
  'system design',
  'distributed systems',
  'agile scrum',
];

const sectionToPlainText = (section: ResumeSection): string => {
  if (section.type === 'summary' || section.type === 'custom_text') {
    return htmlToPlainText(section.data.html);
  }
  if (section.type === 'skills') {
    return section.data.categories.map((c) => `${c.category} ${c.items}`).join(' ');
  }
  if (section.type === 'experience') {
    return section.data.items
      .map((item) => {
        const posText = (item.positions || [])
          .map((p) => `${p.role} ${htmlToPlainText(p.bullets)}`)
          .join(' ');
        return `${item.role} ${item.company} ${htmlToPlainText(item.bullets)} ${posText}`;
      })
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
          `${item.degree} ${item.institution} ${item.relatedCoursework || ''} ${
            item.thesisTitle || ''
          } ${item.description || ''}`
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

export const resumeToSearchableText = (resume: ResumeDocument): string => {
  const { header, sections } = resume.content;
  const rolesText = (header.roles || []).join(' ');
  return [
    header.fullName,
    header.headline || '',
    rolesText,
    ...sections.map(sectionToPlainText),
  ]
    .join(' ')
    .toLowerCase();
};

export const extractJobKeywords = (jobDescription: string, roleTitle = ''): string[] => {
  const combined = `${roleTitle} ${jobDescription}`.trim();
  if (!combined) return [];

  const lower = combined.toLowerCase();
  const counts = new Map<string, number>();

  // 1. Check known technical phrases first
  for (const phrase of KNOWN_PHRASES) {
    if (lower.includes(phrase)) {
      counts.set(phrase, (counts.get(phrase) ?? 0) + 3);
    }
  }

  // 2. Tokenize words (keep alphanumeric, +, #, ., / inside tokens)
  const rawTokens = combined.match(/[A-Za-z][A-Za-z0-9+#./-]{1,28}/g) || [];

  for (const raw of rawTokens) {
    const cleaned = raw.replace(/^[./-]+|[./-]+$/g, '');
    if (cleaned.length < 2) continue;

    const normalized = cleaned.toLowerCase();
    if (STOPWORDS.has(normalized)) continue;
    if (/^\d+$/.test(normalized)) continue;

    // Boost tokens that were capitalized/acronyms in the original JD (e.g. AWS, SQL, Figma, React, KPI)
    const isCapitalizedOrAcronym =
      /^[A-Z]{2,10}$/.test(cleaned) ||
      /[A-Z].*[A-Z]/.test(cleaned) ||
      /[+#.]/.test(cleaned);
    const weight = isCapitalizedOrAcronym ? 2 : 1;

    counts.set(normalized, (counts.get(normalized) ?? 0) + weight);
  }

  // Sort by weight/frequency descending and take top 25 meaningful keywords
  return Array.from(counts.entries())
    .filter(([token, score]) => score >= 2 || token.length >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([token]) => token);
};

const formatKeywordDisplay = (keyword: string): string => {
  const upperAcronyms = new Set([
    'aws', 'gcp', 'sql', 'api', 'rest', 'rest api', 'ci/cd', 'ui/ux', 'ui', 'ux',
    'html', 'css', 'saas', 'b2b', 'b2c', 'kpi', 'okr', 'seo', 'sem', 'crm', 'erp',
    'sdk', 'jwt', 'sso', 'oauth', 'llm', 'ai', 'ml', 'nlp',
  ]);
  if (upperAcronyms.has(keyword)) {
    return keyword.toUpperCase();
  }
  return keyword;
};

export const matchJobToResume = (
  jobDescription: string,
  roleTitle: string,
  resume?: ResumeDocument | null
): JdMatchResult | null => {
  const keywords = extractJobKeywords(jobDescription, roleTitle);
  if (keywords.length === 0 || !resume) {
    return null;
  }

  const resumeText = resumeToSearchableText(resume);
  const resumeTokens = new Set(
    (resumeText.match(/[a-z][a-z0-9+#./-]{1,28}/g) || []).map((t) =>
      t.replace(/^[./-]+|[./-]+$/g, '')
    )
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    const isPresent =
      resumeTokens.has(keyword) ||
      resumeText.includes(keyword);
    if (isPresent) {
      matched.push(formatKeywordDisplay(keyword));
    } else {
      missing.push(formatKeywordDisplay(keyword));
    }
  }

  const score = Math.round((matched.length / keywords.length) * 100);

  return {
    score,
    matchedKeywords: matched.slice(0, 14),
    missingKeywords: missing.slice(0, 10),
    totalKeywords: keywords.length,
  };
};
