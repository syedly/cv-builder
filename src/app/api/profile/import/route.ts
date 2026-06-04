import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { parseResumeFile } from '@/lib/fileParser';
import { getOpenAIClient } from '@/lib/openai';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { decryptAPIKey } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let apiKey: string | null = null;
  if (user.byokKeyEncrypted && user.byokKeyIV && user.byokKeyTag) {
    apiKey = decryptAPIKey(user.byokKeyEncrypted, user.byokKeyIV, user.byokKeyTag);
  } else if (user.freeTries > 0) {
    apiKey = process.env.OPENAI_API_KEY!;
  }
  if (!apiKey) return NextResponse.json({ error: 'No API access', code: 'NO_ACCESS' }, { status: 402 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let resumeText: string;
  try {
    resumeText = await parseResumeFile(buffer, file.type);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 422 });
  }

  const client = getOpenAIClient(apiKey);

  const systemPrompt = `You are a CV parser. Extract ALL information from the resume text and return a structured JSON object.
Return ONLY valid JSON with this exact structure (use empty strings/arrays for missing fields, never null):
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "website": "",
  "desiredTitle": "",
  "summary": "",
  "workExperience": [
    {
      "id": "we_1",
      "company": "",
      "title": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "location": "",
      "bullets": ["bullet1", "bullet2"]
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "degree": "",
      "field": "",
      "school": "",
      "startYear": "",
      "graduationYear": "",
      "gpa": "",
      "honors": ""
    }
  ],
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1"],
  "languages": [],
  "projects": [
    {
      "id": "proj_1",
      "name": "",
      "description": "",
      "technologies": [],
      "github": "",
      "link": "",
      "highlights": []
    }
  ],
  "certifications": [
    {
      "id": "cert_1",
      "name": "",
      "issuer": "",
      "year": "",
      "credentialId": "",
      "link": ""
    }
  ],
  "achievements": []
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Parse this resume and extract all data:\n\n${resumeText}` },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
    max_tokens: 3000,
  });

  const parsed = JSON.parse(response.choices[0].message.content!);
  return NextResponse.json(parsed);
}
