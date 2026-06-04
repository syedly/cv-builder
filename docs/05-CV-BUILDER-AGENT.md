# 05 — CV Builder Agent

## Role
The CV Builder Agent is the core of the system. It takes structured data from the Job Analysis and Resume Analysis agents and generates a complete, ATS-optimized CV using the reference resume as a structural template.

---

## ATS Rules (Hard Requirements)

```
✅ DO:                              ❌ NEVER DO:
─────────────────────────────────   ────────────────────────────────
Single column layout                 Multi-column layouts
Standard section headers             Headers in images/graphics
Plain text bullets                   Tables for content
Dates in MM/YYYY format              Fancy icons in resume body
Contact at top                       Headers/footers with contact info
Keywords in context                  Keyword stuffing
Action verb bullet starts            Weak verbs (helped, assisted)
Quantified achievements              Vague claims (improved things)
Standard fonts (in PDF)              Decorative fonts
<2MB file size                       Embedded objects
```

---

## System Prompt

```
You are an expert ATS resume writer and career coach with 15+ years of experience helping candidates pass Applicant Tracking Systems at companies like Google, Amazon, Microsoft, and top startups.

Your task is to create a 100% ATS-compliant, keyword-optimized resume.

STRICT OUTPUT FORMAT — Return a JSON object with this exact structure:
{
  "contactSection": {
    "name": "Full Name",
    "email": "email@domain.com",
    "phone": "+1-555-0000",
    "linkedin": "linkedin.com/in/username",
    "location": "City, State"
  },
  "professionalSummary": "2-3 sentence summary with top keywords naturally embedded",
  "workExperience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "location": "City, State or Remote",
      "bullets": [
        "Action verb + task + quantified result with KEYWORD",
        "..."
      ]
    }
  ],
  "skills": {
    "technical": ["Skill1", "Skill2"],
    "soft": ["Leadership", "Communication"]
  },
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "school": "University Name",
      "graduationYear": "YYYY",
      "gpa": "3.8 (optional)"
    }
  ],
  "certifications": ["Cert Name - Issuer (Year)"],
  "keywords_injected": ["list of all job keywords you used"]
}

RULES:
1. Every bullet must start with a strong action verb (Led, Built, Engineered, Drove, Reduced, Increased, Designed, Implemented)
2. Every bullet should have a quantifiable metric (%, $, time saved, users reached) — if user didn't provide numbers, make realistic estimates or use ranges
3. Inject ALL required_skills and important keywords from the job description naturally into the text
4. Professional summary must contain the exact job title and 3-5 top keywords
5. Skills section must list all required_skills from the job description that the candidate has or can reasonably claim
6. Do NOT fabricate companies, schools, or dates
7. Do NOT use tables, columns, or graphics descriptions
8. Keep to 1 page if < 5 years experience, 2 pages if more
```

---

## Reference Resume Template

```typescript
// lib/templates/referenceResume.ts
export const REFERENCE_RESUME_STRUCTURE = `
JOHN DOE
john.doe@email.com | (555) 000-0000 | linkedin.com/in/johndoe | New York, NY

PROFESSIONAL SUMMARY
Results-driven [Job Title] with [X] years of experience in [Industry]. 
Proven track record of [Key Achievement]. Expert in [Top 3 Skills].

WORK EXPERIENCE

[Company Name] — [Job Title]                    [Start Date] – [End Date]
[City, State / Remote]
• Led [initiative] resulting in [quantified outcome] for [scope]
• Developed [system/product/process] that [impact] by [metric]
• Collaborated with [team/stakeholders] to [achieve goal]
• Reduced [problem] by [X%] through [method]

TECHNICAL SKILLS
Programming: Python, JavaScript, TypeScript, SQL
Frameworks: React, Node.js, FastAPI
Tools: AWS, Docker, Git, Jira
Databases: PostgreSQL, MongoDB, Redis

EDUCATION
Bachelor of Science in Computer Science
State University — May 2020 | GPA: 3.7/4.0

CERTIFICATIONS
• AWS Solutions Architect — Amazon Web Services (2023)
`;

export const ATS_SECTION_ORDER = [
  'contactSection',
  'professionalSummary', 
  'workExperience',
  'skills',
  'education',
  'certifications',
  'projects'  // optional
];
```

---

## Agent Implementation

```typescript
// agents/cvBuilderAgent.ts
export async function runCVBuilderAgent(ctx: AgentContext): Promise<CVBuilderResult> {
  const { jobAnalysis, resumeAnalysis, apiKey } = ctx;
  
  const userPrompt = `
JOB DETAILS:
Title: ${jobAnalysis.title}
Company: ${jobAnalysis.company}
Required Skills: ${jobAnalysis.required_skills.join(', ')}
Nice-to-Have: ${jobAnalysis.nice_to_have.join(', ')}
Key Keywords: ${jobAnalysis.keywords.join(', ')}
Seniority: ${jobAnalysis.seniority}
Industry: ${jobAnalysis.industry}

${resumeAnalysis ? `
CANDIDATE'S EXISTING RESUME DATA:
Name: ${resumeAnalysis.name}
Contact: ${JSON.stringify(resumeAnalysis.contact)}
Summary: ${resumeAnalysis.summary}
Experience: ${JSON.stringify(resumeAnalysis.experience)}
Skills: ${resumeAnalysis.skills.join(', ')}
Education: ${JSON.stringify(resumeAnalysis.education)}
` : `
NO EXISTING RESUME — Use the reference template structure.
Create a professional CV based on the job requirements.
Mark all content that needs user input with [USER: provide X].
`}

REFERENCE TEMPLATE TO FOLLOW:
${REFERENCE_RESUME_STRUCTURE}

Generate the complete ATS-optimized CV now. Return ONLY valid JSON, no other text.
`;

  const response = await openai(apiKey).chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CV_BUILDER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3, // Lower = more consistent, professional output
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(response.choices[0].message.content!);
  return result;
}
```

---

## No Resume Scenario

When user has no resume:
1. AI generates a template-based CV with `[USER: fill in]` placeholders
2. After generation, show an **interactive editor** for user to fill in their details
3. User fills in name, contact, experience, education
4. User clicks "Regenerate with my info"
5. AI rebuilds the CV with the provided data

```
NO RESUME MODE UI:
──────────────────
"We'll create a CV from scratch tailored to this job.
 Fill in your details:"

[ Name ]            [ Email ]
[ Phone ]           [ Location ]

Work History:
[ + Add Position ]

Skills (we'll suggest based on job):
[Auto-filled from job analysis ✓]

Education:
[ + Add Education ]

[ Generate My CV ]
```
