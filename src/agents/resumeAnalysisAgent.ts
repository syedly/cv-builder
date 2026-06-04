import { getOpenAIClient } from '@/lib/openai';

export interface ResumeAnalysisResult {
  name: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    bullets: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    school: string;
    graduationYear: string;
    gpa?: string;
  }>;
  certifications: string[];
  wordCount: number;
  pageEstimate: number;
}

const RESUME_ANALYSIS_SYSTEM_PROMPT = `You are an expert resume parser. Extract all information from the resume text.

Return ONLY valid JSON matching this exact schema. No extra text:
{
  "name": "Full Name",
  "contact": {
    "email": "email@domain.com",
    "phone": "phone number",
    "linkedin": "linkedin URL or username",
    "location": "City, State"
  },
  "summary": "existing professional summary if present",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "location": "City, State",
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  ],
  "skills": ["Skill1", "Skill2"],
  "education": [
    {
      "degree": "Degree Name",
      "school": "University Name",
      "graduationYear": "YYYY",
      "gpa": "3.8"
    }
  ],
  "certifications": ["Cert Name"]
}`;

export async function runResumeAnalysisAgent(
  resumeText: string,
  apiKey: string
): Promise<ResumeAnalysisResult> {
  const client = getOpenAIClient(apiKey);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: RESUME_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: `Parse this resume:\n\n${resumeText.slice(0, 6000)}` },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
    max_tokens: 1500,
  });

  const raw = response.choices[0].message.content!;
  const result = JSON.parse(raw);

  const wordCount = resumeText.split(/\s+/).length;
  const pageEstimate = Math.ceil(wordCount / 400);

  return {
    name: result.name || '',
    contact: result.contact || { email: '', phone: '', linkedin: '', location: '' },
    summary: result.summary || '',
    experience: result.experience || [],
    skills: result.skills || [],
    education: result.education || [],
    certifications: result.certifications || [],
    wordCount,
    pageEstimate,
  };
}
