import { createHash } from 'crypto';
import { getOpenAIClient } from '@/lib/openai';
import { connectDB } from '@/lib/mongodb';
import JobAnalysis from '@/models/JobAnalysis';

export interface JobAnalysisResult {
  jobHash: string;
  title: string;
  company: string;
  required_skills: string[];
  nice_to_have: string[];
  keywords: string[];
  seniority: string;
  industry: string;
  culture_cues: string[];
  employment_type: string;
  location: string;
  cached: boolean;
}

const JOB_ANALYSIS_SYSTEM_PROMPT = `You are an expert job description parser. Extract ALL relevant information from the job posting.

Focus especially on:
1. EXACT skill names as written (not paraphrased) — these are ATS keywords
2. All technical requirements, tools, and technologies
3. Seniority indicators (years of experience, level in title)
4. Soft skills and cultural fit keywords
5. Industry-specific terminology

Return ONLY valid JSON matching this exact schema. No extra text, no markdown:
{
  "title": "Job Title",
  "company": "Company Name",
  "required_skills": ["Skill1", "Skill2"],
  "nice_to_have": ["Skill3"],
  "keywords": ["keyword1", "keyword2"],
  "seniority": "junior|mid|senior|lead|executive",
  "industry": "Industry Name",
  "culture_cues": ["fast-paced", "collaborative"],
  "employment_type": "Full-time|Part-time|Contract|Remote",
  "location": "City, State or Remote"
}`;

export async function runJobAnalysisAgent(
  jobText: string,
  apiKey: string
): Promise<JobAnalysisResult> {
  await connectDB();

  const jobHash = createHash('md5').update(jobText.trim()).digest('hex');

  // Check cache
  const cached = await JobAnalysis.findOne({ jobHash, expiresAt: { $gt: new Date() } });
  if (cached) {
    await JobAnalysis.findByIdAndUpdate(cached._id, { $inc: { hitCount: 1 } });
    return {
      jobHash: cached.jobHash,
      title: cached.title,
      company: cached.company,
      required_skills: cached.required_skills,
      nice_to_have: cached.nice_to_have,
      keywords: cached.keywords,
      seniority: cached.seniority,
      industry: cached.industry,
      culture_cues: cached.culture_cues,
      employment_type: cached.employment_type,
      location: cached.location,
      cached: true,
    };
  }

  const client = getOpenAIClient(apiKey);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: JOB_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: `Parse this job description:\n\n${jobText}` },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  });

  const raw = response.choices[0].message.content!;
  const result = JSON.parse(raw);

  // Save to cache
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await JobAnalysis.findOneAndUpdate(
    { jobHash },
    {
      jobHash,
      title: result.title || '',
      company: result.company || '',
      required_skills: result.required_skills || [],
      nice_to_have: result.nice_to_have || [],
      keywords: result.keywords || [],
      seniority: result.seniority || 'mid',
      industry: result.industry || '',
      culture_cues: result.culture_cues || [],
      employment_type: result.employment_type || 'Full-time',
      location: result.location || '',
      hitCount: 0,
      expiresAt,
    },
    { upsert: true, new: true }
  );

  return { ...result, jobHash, cached: false };
}

export async function fetchJobFromURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const html = await res.text();
    // Strip HTML tags and clean up whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.length > 200 ? text.slice(0, 8000) : null;
  } catch {
    return null;
  }
}
