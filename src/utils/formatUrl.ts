/**
 * Formats a profile / external link for ATS-friendly display.
 * If the user's label is a generic title (e.g. "Linkedin", "Portfolio", "Behance", "GitHub"),
 * this returns the clean URL address (e.g. "linkedin.com/in/username") so that ATS parsers
 * and plain-text extractors (pdftotext, copy-to-notepad) extract the actual destination address.
 */
export const formatDisplayUrl = (url?: string, label?: string): string => {
  const trimmedUrl = (url || '').trim();
  const trimmedLabel = (label || '').trim();

  // If label is already a full/clean URL (contains a domain like .com, .org, .net, .id, etc.), keep it
  if (trimmedLabel && /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmedLabel)) {
    return trimmedLabel;
  }

  // If URL is provided, strip protocol (http/https), www., and trailing slash for a clean readable address
  if (trimmedUrl) {
    const clean = trimmedUrl
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/$/, '');
    if (clean) return clean;
  }

  return trimmedLabel || trimmedUrl || '';
};
