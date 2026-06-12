import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import UserTheme from '@/models/UserTheme';
import mongoose from 'mongoose';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;
  const themes = await UserTheme.find({ userId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ themes: themes.map(t => ({ ...t, _id: t._id.toString() })) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;

  const body = await req.json();
  const { name, primaryColor, accentColor, fontFamily, headerStyle, spacing, bulletChar, showDividers } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Theme name is required' }, { status: 400 });

  const count = await UserTheme.countDocuments({ userId });
  if (count >= 20) return NextResponse.json({ error: 'Maximum 20 custom themes allowed' }, { status: 400 });

  const theme = await UserTheme.create({
    userId: new mongoose.Types.ObjectId(userId),
    name: name.trim(),
    primaryColor: primaryColor || '#1a44b3',
    accentColor: accentColor || '#2563eb',
    fontFamily: fontFamily || 'sans',
    headerStyle: headerStyle || 'lines',
    spacing: spacing || 'normal',
    bulletChar: bulletChar ?? '•',
    showDividers: showDividers ?? true,
  });

  return NextResponse.json({ theme: { ...theme.toObject(), _id: theme._id.toString() } }, { status: 201 });
}
