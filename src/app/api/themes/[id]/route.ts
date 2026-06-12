import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import UserTheme from '@/models/UserTheme';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;
  const { id } = await params;

  const body = await req.json();
  const theme = await UserTheme.findOneAndUpdate(
    { _id: id, userId },
    { $set: { ...body, userId: undefined } },
    { new: true }
  );

  if (!theme) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
  return NextResponse.json({ theme: { ...theme.toObject(), _id: theme._id.toString() } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;
  const { id } = await params;

  const result = await UserTheme.findOneAndDelete({ _id: id, userId });
  if (!result) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
