import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { runResumeAnalysisAgent } from '@/agents/resumeAnalysisAgent';
import { parseResumeFile } from '@/lib/fileParser';
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

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const apiKey = await resolveAPIKey(user);
  if (!apiKey) {
    return NextResponse.json({ error: 'No API access', code: 'NO_ACCESS' }, { status: 402 });
  }

  let resumeText = '';
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      resumeText = await parseResumeFile(buffer, file.type);
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 422 });
    }
  } else {
    const body = await req.json();
    if (!body?.text?.trim()) return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    resumeText = body.text;
  }

  try {
    const result = await runResumeAnalysisAgent(resumeText, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Resume analyze error:', err);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}
