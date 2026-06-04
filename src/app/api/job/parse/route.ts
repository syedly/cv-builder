import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { runJobAnalysisAgent, fetchJobFromURL } from '@/agents/jobAnalysisAgent';
import { decryptAPIKey } from '@/lib/encryption';

type UserDoc = InstanceType<typeof User>;

async function resolveAPIKey(user: UserDoc): Promise<string | null> {
  if (user.byokKeyEncrypted && user.byokKeyIV && user.byokKeyTag) {
    return decryptAPIKey(user.byokKeyEncrypted, user.byokKeyIV, user.byokKeyTag);
  }
  if (user.freeTries > 0) return process.env.OPENAI_API_KEY!;
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Job content is required' }, { status: 400 });
  }

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const apiKey = await resolveAPIKey(user);
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No API access. Add your OpenAI API key.', code: 'NO_ACCESS' },
      { status: 402 }
    );
  }

  let jobText = content;

  if (type === 'url') {
    const fetched = await fetchJobFromURL(content);
    if (!fetched) {
      return NextResponse.json(
        {
          error: "Couldn't fetch that URL. Please paste the job description text instead.",
          code: 'URL_BLOCKED',
        },
        { status: 422 }
      );
    }
    jobText = fetched;
  }

  try {
    const result = await runJobAnalysisAgent(jobText, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Job parse error:', err);
    return NextResponse.json({ error: 'Failed to parse job description' }, { status: 500 });
  }
}
