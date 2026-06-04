import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { encryptAPIKey } from '@/lib/encryption';
import { validateOpenAIKey } from '@/lib/openai';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { apiKey } = await req.json();

  if (!apiKey || !apiKey.startsWith('sk-')) {
    return NextResponse.json({ error: 'Invalid API key format. Key must start with sk-' }, { status: 400 });
  }

  const isValid = await validateOpenAIKey(apiKey);
  if (!isValid) {
    return NextResponse.json({ error: 'API key is invalid or has insufficient permissions' }, { status: 400 });
  }

  const { encrypted, iv, tag } = encryptAPIKey(apiKey);

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;

  await User.findByIdAndUpdate(userId, {
    byokKeyEncrypted: encrypted,
    byokKeyIV: iv,
    byokKeyTag: tag,
  });

  return NextResponse.json({ success: true });
}
