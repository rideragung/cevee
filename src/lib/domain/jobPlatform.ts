import type { JobPlatform } from '../../types/job';

interface PlatformDomainRule {
  platform: JobPlatform;
  domains: readonly string[];
}

const PLATFORM_DOMAIN_RULES: readonly PlatformDomainRule[] = [
  { platform: 'linkedin', domains: ['linkedin.com', 'lnkd.in'] },
  {
    platform: 'jobstreet',
    domains: ['jobstreet.co.id', 'jobstreet.com', 'jobstreet.com.my', 'jobstreet.com.sg'],
  },
  { platform: 'glints', domains: ['glints.com'] },
  { platform: 'kalibrr', domains: ['kalibrr.com', 'kalibrr.id'] },
  { platform: 'dealls', domains: ['dealls.com'] },
  { platform: 'indeed', domains: ['indeed.com', 'indeed.co.id'] },
  { platform: 'tech_in_asia', domains: ['techinasia.com'] },
];

const parseHostname = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).hostname.toLowerCase();
  } catch {
    try {
      return new URL(`https://${trimmed}`).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
};

export const detectJobPlatform = (url: string): JobPlatform | undefined => {
  const hostname = parseHostname(url);
  if (!hostname) return undefined;

  for (const rule of PLATFORM_DOMAIN_RULES) {
    const matches = rule.domains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
    if (matches) return rule.platform;
  }

  return undefined;
};
