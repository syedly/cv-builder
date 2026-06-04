import { getOpenAIClient } from '@/lib/openai';
import { JobAnalysisResult } from './jobAnalysisAgent';
import { ResumeAnalysisResult } from './resumeAnalysisAgent';

export interface CVData {
  contactSection: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    location: string;
  };
  professionalSummary: string;
  workExperience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    bullets: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
  };
  education: Array<{
    degree: string;
    field?: string;
    school: string;
    graduationYear: string;
    gpa?: string;
    honors?: string;
  }>;
  certifications?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    github?: string;
    link?: string;
  }>;
  achievements?: string[];
  keywords_injected: string[];
}

export interface CVBuilderResult {
  cvData: CVData;
}

const SYSTEM_PROMPT = `You are a world-class ATS resume writer and career strategist with 20+ years of experience placing candidates at FAANG, top startups, and Fortune 500 companies. You have deep expertise in Applicant Tracking Systems and know exactly what makes a CV score 90+ on ATS scanners.

YOUR MISSION: Create a 100% ATS-optimized, interview-winning CV that reads like a top 1% candidate wrote it.

═══════════════════════════════════════════════════════
OUTPUT FORMAT — Return ONLY valid JSON, no markdown, no explanation:
{
  "contactSection": {
    "name": "Full Name",
    "email": "email@domain.com",
    "phone": "+1-000-000-0000",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "portfolio": "portfolio.dev",
    "location": "City, Country"
  },
  "professionalSummary": "3-sentence power summary",
  "workExperience": [
    {
      "company": "Company Name",
      "title": "Exact Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "location": "City, State or Remote",
      "bullets": [
        "Strong verb + specific action + quantified result + keyword",
        "Strong verb + specific action + quantified result + keyword",
        "Strong verb + specific action + quantified result + keyword",
        "Strong verb + specific action + quantified result + keyword",
        "Strong verb + specific action + quantified result + keyword"
      ]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["Leadership", "Cross-functional Collaboration"],
    "languages": ["English", "Urdu"]
  },
  "education": [
    {
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "school": "University Name",
      "graduationYear": "2024",
      "gpa": "3.8",
      "honors": "Dean's List"
    }
  ],
  "certifications": ["Certification Name — Issuer (Year)"],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does, scale, and business impact in 1-2 sentences",
      "technologies": ["Tech1", "Tech2", "Tech3"],
      "github": "github.com/user/repo",
      "link": "live-demo.com"
    }
  ],
  "achievements": ["Achievement with metric"],
  "keywords_injected": ["all", "job", "keywords", "used"]
}
═══════════════════════════════════════════════════════

IRON-CLAD RULES — Violating ANY of these is unacceptable:

BULLETS (most important):
• Write EXACTLY 5 bullets per work experience role — never 3 or 4
• Every bullet MUST follow: [Power Verb] + [Specific Action] + [Quantified Result] + [Relevant Keyword]
• Numbers are NON-NEGOTIABLE: use %, $, x multiplier, users served, requests/sec, time saved, team size
• If exact numbers aren't provided, use realistic estimates appropriate to the role and company size (e.g., "~30%", "500+ users", "10-member team")
• Power verbs: Architected, Engineered, Spearheaded, Drove, Reduced, Increased, Accelerated, Delivered, Optimized, Implemented, Scaled, Automated, Migrated, Redesigned, Deployed, Led, Launched, Streamlined
• Never start two consecutive bullets with the same verb

PROFESSIONAL SUMMARY:
• Sentence 1: [Job Title from posting] with [X] years experience in [top 2-3 skills from job description]
• Sentence 2: Proven [specific achievement type] resulting in [metric] at [context]
• Sentence 3: Expertise in [3 specific technical skills matching job requirements]
• Must be 3 sentences, 60-80 words total

SKILLS SECTION:
• List EVERY required_skill from the job description first
• Group logically: Languages | Frameworks | Cloud | Databases | Tools
• Include ALL required and nice-to-have skills the candidate plausibly has
• 15-25 technical skills minimum

PROJECTS (critical for junior/mid candidates):
• Include 3-4 most relevant projects
• Each description: what it does + scale/users + key tech + impact metric
• Technologies list: 4-6 specific technologies per project

KEYWORD INJECTION:
• The exact job title must appear in the professional summary
• Every required_skill must appear at least once in bullets or skills section
• Industry-specific terms from the job description woven naturally throughout

DO NOT:
• Fabricate company names, schools, or specific dates not in the source data
• Use passive voice ("was responsible for", "helped with")
• Write vague bullets ("worked on", "assisted in", "contributed to")
• Use filler phrases ("detail-oriented", "team player", "passionate about")
• Leave github/portfolio empty if provided in the candidate data`;

function buildUserPrompt(
  jobAnalysis: JobAnalysisResult,
  resumeAnalysis: ResumeAnalysisResult | null,
  profileData: Record<string, unknown> | null,
  qaAnswers: Record<string, string> | null,
): string {
  const jobSection = `
═══ TARGET JOB ═══
Title: ${jobAnalysis.title}
Company: ${jobAnalysis.company || 'Not specified'}
Seniority: ${jobAnalysis.seniority}
Industry: ${jobAnalysis.industry}

REQUIRED SKILLS (must all appear in CV): ${jobAnalysis.required_skills.join(', ')}
NICE-TO-HAVE SKILLS: ${jobAnalysis.nice_to_have.join(', ')}
ALL KEYWORDS TO INJECT: ${jobAnalysis.keywords.join(', ')}
CULTURE/TONE: ${jobAnalysis.culture_cues.join(', ')}`;

  let candidateSection = '';

  if (resumeAnalysis) {
    candidateSection = `
═══ CANDIDATE DATA (from uploaded resume) ═══
Name: ${resumeAnalysis.name}
Email: ${resumeAnalysis.contact?.email || ''}
Phone: ${resumeAnalysis.contact?.phone || ''}
LinkedIn: ${resumeAnalysis.contact?.linkedin || ''}
Location: ${resumeAnalysis.contact?.location || ''}
Summary: ${resumeAnalysis.summary}
Skills: ${resumeAnalysis.skills.join(', ')}
Experience: ${JSON.stringify(resumeAnalysis.experience, null, 2)}
Education: ${JSON.stringify(resumeAnalysis.education, null, 2)}
Certifications: ${(resumeAnalysis.certifications || []).join(', ')}`;
  } else if (profileData) {
    const p = profileData;
    const workExp = (p.workExperience as Array<Record<string, unknown>>) || [];
    const education = (p.education as Array<Record<string, unknown>>) || [];
    const projects = (p.projects as Array<Record<string, unknown>>) || [];
    const certs = (p.certifications as Array<Record<string, unknown>>) || [];

    candidateSection = `
═══ CANDIDATE PROFILE ═══
Name: ${p.fullName || ''}
Email: ${p.email || ''}
Phone: ${p.phone || ''}
Location: ${p.location || ''}
LinkedIn: ${p.linkedin || ''}
GitHub: ${p.github || ''}
Portfolio: ${p.portfolio || ''}
Website: ${p.website || ''}
Desired Title: ${p.desiredTitle || ''}
Summary: ${p.summary || ''}

TECHNICAL SKILLS: ${((p.technicalSkills as string[]) || []).join(', ')}
SOFT SKILLS: ${((p.softSkills as string[]) || []).join(', ')}
LANGUAGES: ${((p.languages as string[]) || []).join(', ')}

WORK EXPERIENCE:
${workExp.map((job) => `
  Company: ${job.company}
  Title: ${job.title}
  Period: ${job.startDate} – ${job.current ? 'Present' : job.endDate}
  Location: ${job.location}
  Bullets:
${((job.bullets as string[]) || []).filter(Boolean).map(b => `    • ${b}`).join('\n')}`).join('\n')}

EDUCATION:
${education.map((edu) => `
  Degree: ${edu.degree} in ${edu.field}
  School: ${edu.school}
  Graduated: ${edu.graduationYear}
  GPA: ${edu.gpa || 'N/A'}
  Honors: ${edu.honors || 'N/A'}`).join('\n')}

PROJECTS:
${projects.map((proj) => `
  Name: ${proj.name}
  Description: ${proj.description}
  Technologies: ${((proj.technologies as string[]) || []).join(', ')}
  GitHub: ${proj.github || ''}
  Live: ${proj.link || ''}
  Highlights: ${((proj.highlights as string[]) || []).filter(Boolean).join(' | ')}`).join('\n')}

CERTIFICATIONS:
${certs.map((c) => `  ${c.name} — ${c.issuer} (${c.year})`).join('\n')}

ACHIEVEMENTS: ${((p.achievements as string[]) || []).filter(Boolean).join(' | ')}`;
  } else {
    candidateSection = `
═══ NO CANDIDATE DATA PROVIDED ═══
Generate a complete professional CV for a ${jobAnalysis.title} role.
Use realistic, impressive details appropriate for a ${jobAnalysis.seniority}-level candidate.
Mark any truly unknown personal details as [YOUR NAME], [YOUR EMAIL], etc.`;
  }

  const qaSection = qaAnswers && Object.keys(qaAnswers).length > 0
    ? `
═══ CANDIDATE'S ADDITIONAL CONTEXT (use these answers to write stronger, more specific bullets) ═══
${Object.entries(qaAnswers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}`
    : '';

  return `${jobSection}

${candidateSection}
${qaSection}

Now generate the complete ATS-optimized CV. Remember: 5 bullets per role, every bullet has a metric, all required skills appear in the CV. Return ONLY valid JSON.`;
}

export async function runCVBuilderAgent(
  jobAnalysis: JobAnalysisResult,
  resumeAnalysis: ResumeAnalysisResult | null,
  apiKey: string,
  profileData?: Record<string, unknown> | null,
  qaAnswers?: Record<string, string> | null,
): Promise<CVBuilderResult> {
  const client = getOpenAIClient(apiKey);

  const userPrompt = buildUserPrompt(jobAnalysis, resumeAnalysis, profileData ?? null, qaAnswers ?? null);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });

  const raw = response.choices[0].message.content!;
  const cvData = JSON.parse(raw) as CVData;

  return { cvData };
}
