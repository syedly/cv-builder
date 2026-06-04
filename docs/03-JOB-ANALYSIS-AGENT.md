# 03 — Job Analysis Agent

## Role
Parses a LinkedIn job URL or pasted job description into structured data used by the CV Builder Agent.

---

## Input → Output

```
INPUT:
  LinkedIn URL: "https://www.linkedin.com/jobs/view/12345"
  OR
  Raw text: "We are looking for a Senior React Developer..."

OUTPUT:
{
  "title": "Senior React Developer",
  "company": "Acme Technologies",
  "required_skills": ["React", "TypeScript", "Redux", "REST APIs", "Git"],
  "nice_to_have": ["GraphQL", "AWS", "Docker", "Next.js"],
  "keywords": ["frontend", "SPA", "component architecture", "agile", "cross-functional"],
  "seniority": "senior",
  "industry": "Technology / SaaS",
  "culture_cues": ["fast-paced", "collaborative", "data-driven"],
  "employment_type": "Full-time",
  "location": "Remote / New York, NY"
}
```

---

## System Prompt

```
You are an expert job description parser. Extract ALL relevant information from the job posting.

Focus especially on:
1. EXACT skill names as written (not paraphrased) — these are ATS keywords
2. All technical requirements, tools, and technologies
3. Seniority indicators (years of experience, level in title)
4. Soft skills and cultural fit keywords
5. Industry-specific terminology

Return ONLY valid JSON matching this schema. No extra text.
```

---

## Caching Logic

```typescript
// Check cache first
const hash = createHash('md5').update(jobText).digest('hex');
const cached = await JobAnalysis.findOne({ jobHash: hash });

if (cached && cached.expiresAt > new Date()) {
  await JobAnalysis.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } });
  return cached;
}

// Cache miss — call AI
const result = await callJobAnalysisGPT(jobText, apiKey);

// Save to cache
await JobAnalysis.create({
  jobHash: hash,
  ...result,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days
});
```

---

## URL Scraping Strategy

LinkedIn URLs can't always be scraped. Strategy:
1. Try to fetch the URL
2. If blocked → show message: "LinkedIn blocked direct access. Please paste the job description text instead."
3. User pastes text → proceed normally

```typescript
async function fetchJobFromURL(url: string): Promise<string | null> {
  try {
    // Try simple fetch (often works for public listings)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 ...' }
    });
    if (res.ok) {
      const html = await res.text();
      // Extract text content (strip HTML)
      return extractTextFromHTML(html);
    }
  } catch {}
  return null; // Signal to ask user to paste
}
```

---

# 06 — ATS Scoring Agent

## Role
Scores the generated CV against the job requirements and returns a detailed report.

---

## Scoring Algorithm

```
TOTAL SCORE: 100 points
├── Keyword Match Score    (40 pts)
│   required_skills all found?   → up to 25 pts
│   nice_to_have found?          → up to 10 pts
│   industry keywords found?     → up to 5 pts
│
├── Format Compliance     (30 pts)
│   No tables/columns            → 10 pts
│   Proper section headers       → 10 pts
│   Contact at top               → 5 pts
│   Dates in MM/YYYY             → 5 pts
│
├── Content Quality       (20 pts)
│   Action verbs present         → 10 pts
│   Quantified bullets           → 10 pts
│
└── Structure Score       (10 pts)
    Section order correct        → 5 pts
    Professional summary exists  → 5 pts
```

---

## Output

```typescript
interface ATSReport {
  score: number;           // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  breakdown: {
    keywordMatch:   { score: number; max: 40; details: string };
    formatScore:    { score: number; max: 30; details: string };
    contentQuality: { score: number; max: 20; details: string };
    structure:      { score: number; max: 10; details: string };
  };
  
  keywordsFound:   string[];
  keywordsMissing: string[];
  
  formatIssues:    string[];  // e.g. "Table detected in skills section"
  suggestions:     string[];  // e.g. "Add 'Docker' to skills section"
  
  passesATS:       boolean;   // score >= 70
}
```

---

## UI Display

```
╔══════════════════════════════════════════╗
║  ATS Score: 87/100  ●●●●●●●●●○           ║
║  Grade: B+  ✅ ATS Ready                  ║
╠══════════════════════════════════════════╣
║                                          ║
║  Keyword Match      ████████░░  34/40   ║
║  Format             ██████████  30/30   ║
║  Content Quality    ████████░░  18/20   ║
║  Structure          ████████░░   5/10   ║
║                                          ║
╠══════════════════════════════════════════╣
║  ✅ Keywords Found (23)                   ║
║  React, TypeScript, Node.js, REST...     ║
║                                          ║
║  ⚠️ Missing Keywords (3)                  ║
║  GraphQL, Docker, Kubernetes             ║
║                                          ║
║  💡 Suggestions                           ║
║  • Add GraphQL to your skills section    ║
║  • Quantify the "improved performance"   ║
║    bullet in your Acme Corp experience   ║
╚══════════════════════════════════════════╝
```
