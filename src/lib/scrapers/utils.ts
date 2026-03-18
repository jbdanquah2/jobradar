import { REJECT_LOCATION_KEYWORDS, ACCEPT_LOCATION_KEYWORDS, GERMANY_KEYWORDS } from '../scoring';

/**
 * Checks if a job location/description is compatible with the user's location (Ghana/EMEA/Germany).
 * This is used at the scraper level to avoid ingesting obviously irrelevant roles.
 */
export function isLocationCompatible(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // 1. Explicitly accepted keywords (EMEA, Worldwide, etc.)
  const hasAcceptKeyword = ACCEPT_LOCATION_KEYWORDS.some(k => lowerText.includes(k));
  const isGermany = GERMANY_KEYWORDS.some(k => lowerText.includes(k));
  
  if (hasAcceptKeyword || isGermany) return true;

  // 2. Explicitly rejected keywords (US Only, etc.)
  const hasRejectKeyword = REJECT_LOCATION_KEYWORDS.some(k => lowerText.includes(k));
  if (hasRejectKeyword) return false;

  // 3. Region-specific rejections (often strictly regional)
  const rejectRegions = ['north america', 'americas', 'latam', 'apac', 'australia', 'new zealand', 'japan', 'china'];
  if (rejectRegions.some(r => lowerText.includes(r))) {
    // If it mentions APAC/Americas, it's usually not for EMEA unless it explicitly says EMEA too
    if (!lowerText.includes('emea') && !lowerText.includes('europe') && !lowerText.includes('africa') && !lowerText.includes('worldwide')) {
      return false;
    }
  }

  // 4. Timezone rejections (PST, EST, etc. often imply US focus)
  const usTimezones = ['pst', 'pdt', 'est', 'edt', 'cst', 'cdt', 'mst', 'mdt'];
  const hasUSTimezone = usTimezones.some(tz => new RegExp(`\\b${tz}\\b`, 'i').test(lowerText));
  if (hasUSTimezone && !lowerText.includes('utc') && !lowerText.includes('gmt') && !lowerText.includes('cet') && !lowerText.includes('worldwide')) {
    return false;
  }

  return true;
}
