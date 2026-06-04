import { JobAnalysisResult } from './jobAnalysisAgent';
import { CVData } from './cvBuilderAgent';

export interface ATSReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    keywordMatch: { score: number; max: 40; details: string };
    formatScore: { score: number; max: 30; details: string };
    contentQuality: { score: number; max: 20; details: string };
    structure: { score: number; max: 10; details: string };
  };
  keywordsFound: string[];
  keywordsMissing: string[];
  formatIssues: string[];
  suggestions: string[];
  passesATS: boolean;
}

const ACTION_VERBS = [
  'led', 'built', 'engineered', 'drove', 'reduced', 'increased', 'designed',
  'implemented', 'developed', 'managed', 'created', 'launched', 'optimized',
  'delivered', 'improved', 'architected', 'deployed', 'automated', 'scaled',
  'collaborated', 'spearheaded', 'established', 'streamlined', 'coordinated',
];

export function runATSScoringAgent(cvData: CVData, jobAnalysis: JobAnalysisResult): ATSReport {
  const cvText = JSON.stringify(cvData).toLowerCase();

  // 1. Keyword Match Score (40 pts)
  const allJobKeywords = [
    ...jobAnalysis.required_skills,
    ...jobAnalysis.nice_to_have,
    ...jobAnalysis.keywords,
  ];

  const keywordsFound: string[] = [];
  const keywordsMissing: string[] = [];

  for (const kw of Array.from(new Set(allJobKeywords))) {
    if (cvText.includes(kw.toLowerCase())) {
      keywordsFound.push(kw);
    } else {
      keywordsMissing.push(kw);
    }
  }

  const requiredFound = jobAnalysis.required_skills.filter((s) =>
    cvText.includes(s.toLowerCase())
  );
  const niceFound = jobAnalysis.nice_to_have.filter((s) =>
    cvText.includes(s.toLowerCase())
  );
  const industryFound = jobAnalysis.keywords.filter((s) =>
    cvText.includes(s.toLowerCase())
  );

  const requiredScore = jobAnalysis.required_skills.length > 0
    ? Math.round((requiredFound.length / jobAnalysis.required_skills.length) * 25)
    : 25;
  const niceScore = jobAnalysis.nice_to_have.length > 0
    ? Math.round((niceFound.length / Math.max(jobAnalysis.nice_to_have.length, 1)) * 10)
    : 10;
  const industryScore = Math.min(
    5,
    Math.round((industryFound.length / Math.max(jobAnalysis.keywords.length, 1)) * 5)
  );

  const keywordMatch = Math.min(40, requiredScore + niceScore + industryScore);

  // 2. Format Compliance (30 pts)
  const formatIssues: string[] = [];
  let formatScore = 30;

  if (!cvData.contactSection?.name) {
    formatIssues.push('Name missing from contact section');
    formatScore -= 5;
  }
  if (!cvData.contactSection?.email) {
    formatIssues.push('Email missing from contact section');
    formatScore -= 5;
  }
  if (!cvData.professionalSummary) {
    formatIssues.push('Professional summary is missing');
    formatScore -= 5;
  }

  // Check date format
  const datePattern = /\d{2}\/\d{4}/;
  const hasProperDates = cvData.workExperience?.some(
    (job) => datePattern.test(job.startDate || '')
  );
  if (!hasProperDates && cvData.workExperience?.length > 0) {
    formatIssues.push('Dates should be in MM/YYYY format');
    formatScore -= 5;
  }

  // 3. Content Quality (20 pts)
  let contentQuality = 0;
  const allBullets = (cvData.workExperience || []).flatMap((j) => j.bullets || []);

  // Action verbs
  const bulletsWithActionVerbs = allBullets.filter((b) => {
    const firstWord = b.toLowerCase().split(' ')[0];
    return ACTION_VERBS.includes(firstWord);
  });
  const actionVerbScore = allBullets.length > 0
    ? Math.round((bulletsWithActionVerbs.length / allBullets.length) * 10)
    : 0;
  contentQuality += actionVerbScore;

  // Quantified bullets
  const quantifiedBullets = allBullets.filter((b) =>
    /\d+%|\$\d+|\d+ (users|customers|teams|projects|hours|minutes|seconds|days|weeks|months|million|billion|thousand|k\b)/i.test(b)
  );
  const quantifiedScore = allBullets.length > 0
    ? Math.round((quantifiedBullets.length / allBullets.length) * 10)
    : 0;
  contentQuality += quantifiedScore;

  // 4. Structure Score (10 pts)
  let structure = 0;
  if (cvData.professionalSummary) structure += 5;
  if (cvData.workExperience?.length > 0) structure += 3;
  if (cvData.skills?.technical?.length > 0) structure += 2;

  const totalScore = Math.min(100, keywordMatch + formatScore + contentQuality + structure);

  const suggestions: string[] = [];
  if (keywordsMissing.length > 0) {
    suggestions.push(
      `Add these missing keywords: ${keywordsMissing.slice(0, 5).join(', ')}`
    );
  }
  if (quantifiedBullets.length < allBullets.length * 0.5) {
    suggestions.push('Add more quantified metrics (%, $, numbers) to your bullet points');
  }
  if (bulletsWithActionVerbs.length < allBullets.length * 0.8) {
    suggestions.push('Start more bullets with strong action verbs (Led, Built, Drove, Reduced)');
  }
  if (!cvData.professionalSummary) {
    suggestions.push('Add a professional summary with the target job title and key skills');
  }

  const grade: ATSReport['grade'] =
    totalScore >= 90 ? 'A' :
    totalScore >= 80 ? 'B' :
    totalScore >= 70 ? 'C' :
    totalScore >= 60 ? 'D' : 'F';

  return {
    score: totalScore,
    grade,
    breakdown: {
      keywordMatch: {
        score: keywordMatch,
        max: 40,
        details: `${requiredFound.length}/${jobAnalysis.required_skills.length} required, ${niceFound.length}/${jobAnalysis.nice_to_have.length} nice-to-have`,
      },
      formatScore: {
        score: formatScore,
        max: 30,
        details: formatIssues.length === 0 ? 'All format checks passed' : formatIssues.join('; '),
      },
      contentQuality: {
        score: contentQuality,
        max: 20,
        details: `${bulletsWithActionVerbs.length} action verbs, ${quantifiedBullets.length} quantified bullets`,
      },
      structure: {
        score: structure,
        max: 10,
        details: `Summary: ${cvData.professionalSummary ? 'yes' : 'no'}, Experience: ${cvData.workExperience?.length || 0} roles`,
      },
    },
    keywordsFound,
    keywordsMissing,
    formatIssues,
    suggestions,
    passesATS: totalScore >= 70,
  };
}
