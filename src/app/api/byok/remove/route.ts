import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;

  await User.findByIdAndUpdate(userId, {
    byokKeyEncrypted: null,
    byokKeyIV: null,
    byokKeyTag: null,
  });

  return NextResponse.json({ success: true });
}
