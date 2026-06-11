import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { decryptAPIKey } from '@/lib/encryption';
import OpenAI from 'openai';
import { CVData } from '@/components/cv/templates/types';

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

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;
  const user = await User.findById(userId).select('byokKeyEncrypted byokKeyIV byokKeyTag');

  if (!user?.byokKeyEncrypted) {
    return NextResponse.json({ error: 'API key required', code: 'NO_BYOK' }, { status: 402 });
  }

  const apiKey = decryptAPIKey(
    user.byokKeyEncrypted as string,
    user.byokKeyIV as string,
    user.byokKeyTag as string,
  );

  const body = await req.json() as { cvData: CVData; prompt: string };
  const { cvData, prompt } = body;

  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
  if (!cvData) return NextResponse.json({ error: 'CV data required' }, { status: 400 });

  const openai = new OpenAI({ apiKey });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a professional CV editor. Apply ONLY the changes the user requests — keep everything else exactly as-is.
CRITICAL RULES:
1. Do NOT change facts: company names, job titles, dates, school names, degrees — keep them verbatim
2. Do NOT add fictional achievements, skills, or experience not in the original
3. Do NOT restructure or reorder sections unless explicitly asked
4. Apply the user's requested changes precisely and professionally
5. Return the COMPLETE CV as a JSON object matching this schema (pure JSON, no markdown):
${SCHEMA}`,
      },
      {
        role: 'user',
        content: `Current CV:\n${JSON.stringify(cvData, null, 2)}\n\nRequested changes: ${prompt}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 3000,
    temperature: 0.2,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
