import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { parseResumeFile } from '@/lib/fileParser';
import OpenAI from 'openai';
import { CVData } from '@/components/cv/templates/types';

const EMPTY_CV: CVData = {
  contactSection: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  professionalSummary: '',
  workExperience: [],
  skills: { technical: [], soft: [], languages: [] },
  education: [],
  certifications: [],
  projects: [],
  achievements: [],
};

const SCHEMA = `{
  "contactSection": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
  "professionalSummary": "",
  "workExperience": [{ "company": "", "title": "", "startDate": "", "endDate": "", "location": "", "bullets": [""] }],
  "skills": { "technical": [], "soft": [], "languages": [] },
  "education": [{ "degree": "", "field": "", "school": "", "graduationYear": "", "gpa": "", "honors": "" }],
  "certifications": [],
  "projects": [{ "name": "", "description": "", "technologies": [], "github": "", "link": "" }],
  "achievements": []
}`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload PDF, DOCX, or TXT.' }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText: string;
  try {
    rawText = await parseResumeFile(buffer, file.type);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to parse file' }, { status: 422 });
  }

  if (!rawText.trim()) {
    return NextResponse.json({ error: 'No readable text found in file' }, { status: 422 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Service not configured' }, { status: 503 });

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a CV parser. Extract all information from the provided CV text and return a JSON object exactly matching this schema (pure JSON, no markdown, no extra keys):
${SCHEMA}
Rules:
- bullets: array of strings, one bullet point per string, no bullet symbols
- technologies, skills arrays: plain string arrays
- dates: keep original format from the document (e.g. "Jan 2022", "01/2022", "2022")
- endDate: use "Present" if the person is currently in that role
- Use empty string "" for missing text fields, empty [] for missing arrays
- Extract ALL work experience, education, projects exactly as written — do not paraphrase`,
      },
      { role: 'user', content: rawText.slice(0, 12000) },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2500,
    temperature: 0,
  });

  let cvData: CVData;
  try {
    const parsed = JSON.parse(completion.choices[0].message.content || '{}');
    cvData = {
      ...EMPTY_CV,
      ...parsed,
      contactSection: { ...EMPTY_CV.contactSection, ...(parsed.contactSection || {}) },
      skills: { technical: [], soft: [], languages: [], ...(parsed.skills || {}) },
    };
  } catch {
    cvData = EMPTY_CV;
  }

  return NextResponse.json({ cvData });
}
