import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;

  const user = await User.findById(userId).select('name email freeTries byokKeyEncrypted cvGenerations');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    name: user.name,
    email: user.email,
    freeTries: user.freeTries,
    hasByok: !!user.byokKeyEncrypted,
    totalGenerations: user.cvGenerations.length,
  });
}
