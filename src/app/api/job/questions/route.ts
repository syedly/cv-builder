import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { decryptAPIKey } from '@/lib/encryption';
import { getOpenAIClient } from '@/lib/openai';

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
  if (!apiKey) return NextResponse.json({ questions: [] });

  const { jobText, profileSummary } = await req.json();
  if (!jobText?.trim()) return NextResponse.json({ questions: [] });

  const client = getOpenAIClient(apiKey);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert career coach helping tailor a CV to a specific job.
Generate exactly 3 short, targeted questions to help the AI write better, more personalized bullet points for this candidate's CV.
Focus on: quantifiable achievements, specific tools/projects, and experiences that directly match job requirements.
Return JSON: { "questions": ["question1", "question2", "question3"] }
Keep each question under 20 words. Be specific to the job. Do NOT ask generic questions.`,
      },
      {
        role: 'user',
        content: `Job Description:\n${jobText.slice(0, 2000)}\n\nCandidate Profile Summary:\n${profileSummary || 'No profile provided'}`,
      },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });

  const result = JSON.parse(response.choices[0].message.content!);
  return NextResponse.json({ questions: result.questions || [] });
}
