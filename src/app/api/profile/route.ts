import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';
import User from '@/models/User';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;

  let profile = await UserProfile.findOne({ userId });

  if (!profile) {
    // Bootstrap with name/email from User document
    const user = await User.findById(userId).select('name email');
    profile = await UserProfile.create({
      userId,
      fullName: user?.name || '',
      email: user?.email || '',
    });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;
  const body = await req.json();

  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: body },
    { new: true, upsert: true }
  );

  return NextResponse.json(profile);
}
