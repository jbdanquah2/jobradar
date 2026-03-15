import fs from 'fs';
import path from 'path';
import { NormalizedJob } from './scrapers/remoteok';

// This is the baseline skill list derived from the profile.md
// In a full LLM implementation, the LLM will read the whole file.
export function getProfileData() {
  const profilePath = path.join(process.cwd(), 'data/profile.md');
  const profileContent = fs.readFileSync(profilePath, 'utf-8');
  
  const skillsMatch = profileContent.match(/## Core Technical Skills([\s\S]*?)##/);
  const skillsText = skillsMatch ? skillsMatch[1] : '';
  
  // Split by common delimiters (comma, newline, pipe, semicolon) 
  // and strip out markdown formatting/category labels
  const keywords = skillsText
    .toLowerCase()
    .split(/,|\n|;|\|/)
    .map(s => s.replace(/[*\-#]/g, '').trim())
    .map(s => s.includes(':') ? s.split(':')[1] : s) // Remove "Languages:" style headers
    .flatMap(s => s ? s.trim().split(/\s{2,}/) : []) // Handle multiple spaces
    .filter(s => s && s.length > 1)
    .map(s => s.trim());

  return {
    keywords: Array.from(new Set(keywords)), // Unique keywords
    fullContent: profileContent
  };
}

export const REJECT_LOCATION_KEYWORDS = [
  'us only', 'united states only', 'must be based in us',
  'europe only', 'eu only', 'uk only', 'canada only', 'australia only'
];

export const ACCEPT_LOCATION_KEYWORDS = [
  'worldwide', 'global', 'anywhere', 'emea', 'africa', 'europe + africa'
];

export const SENIORITY_KEYWORDS = [
  'senior', 'staff', 'lead', 'manager', 'principal'
];

export const STARTUP_SIGNAL_KEYWORDS = [
  'founding', 'early stage', 'seed', 'series a', 'small team', 
  'equity', 'contract', 'contractor', 'hourly', 'freelance'
];

export const TIMEZONE_KEYWORDS = [
  'utc', 'emea', 'europe', 'africa', 'gmt', 'cet'
];

export const GERMANY_KEYWORDS = [
  'germany', 'deutschland', 'berlin', 'munich', 'münchen', 'hamburg', 
  'frankfurt', 'cologne', 'köln', 'dusseldorf', 'düsseldorf', 'stuttgart'
];

export const RELOCATION_KEYWORDS = [
  'relocation', 'visa sponsorship', 'blue card', 'chancenkarte', 
  'relocation assistance', 'relocation paid', 'visa support', 
  'sponsorship available', 'work in germany'
];

export function calculateJobMatch(job: NormalizedJob): NormalizedJob {
  const textToAnalyze = `${job.title} ${job.description} ${job.location_text}`.toLowerCase();
  const profile = getProfileData();

  // 1. Skill Match Calculation (0-50 pts)
  let skillsMatched = 0;
  for (const skill of profile.keywords) {
    if (textToAnalyze.includes(skill.toLowerCase())) {
      skillsMatched++;
    }
  }
  
  // % Match based on a target of 10 keywords for 100% of this section (50pts)
  const skillMatchPercent = Math.min(100, (skillsMatched / 10) * 100);
  let score = Math.min(50, (skillsMatched / 10) * 50);

  // 2. Eligibility status based on 40% threshold and location
  let eligibility = 'REVIEW_NEEDED';
  
  const hasRejectKeyword = REJECT_LOCATION_KEYWORDS.some(k => textToAnalyze.includes(k));
  const hasAcceptKeyword = ACCEPT_LOCATION_KEYWORDS.some(k => textToAnalyze.includes(k));
  const hasTimezoneKeyword = TIMEZONE_KEYWORDS.some(k => textToAnalyze.includes(k));
  const isGermany = GERMANY_KEYWORDS.some(k => textToAnalyze.includes(k));
  const hasRelocation = RELOCATION_KEYWORDS.some(k => textToAnalyze.includes(k));

  // Minimum 40% skill match requirement
  const meetsSkillThreshold = skillMatchPercent >= 40;

  if (hasRejectKeyword && !hasAcceptKeyword && !isGermany) {
    eligibility = 'REJECTED';
  } else if ((hasAcceptKeyword || hasTimezoneKeyword || (isGermany && hasRelocation)) && meetsSkillThreshold) {
    eligibility = 'ELIGIBLE';
  } else if (!meetsSkillThreshold) {
    eligibility = 'REJECTED'; // Aggressive filtering as requested
  }

  // 3. Bonuses (Max 50 additional points)
  
  // Startup Signal Bonus (max 20 points)
  const startupScore = STARTUP_SIGNAL_KEYWORDS.filter(k => textToAnalyze.includes(k)).length * 5;
  score += Math.min(20, startupScore);

  // Timezone / EMEA Compatibility (max 10 points)
  if (hasTimezoneKeyword) {
    score += 10;
  }

  // Germany + Relocation Bonus (max 20 points)
  if (isGermany) {
    score += 5; // Base Germany bonus
    if (hasRelocation) {
      score += 15; // Relocation support bonus
    }
  }

  // Seniority Match (max 10 points)
  const isSeniorRole = SENIORITY_KEYWORDS.some(k => textToAnalyze.includes(k));
  if (isSeniorRole) {
    score += 10;
  }

  job.match_score = Math.round(score);
  job.eligibility_status = eligibility;

  return job;
}
