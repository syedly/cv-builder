import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import CVGeneration from '@/models/CVGeneration';
import User from '@/models/User';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;
  const { id } = await params;
  const gen = await CVGeneration.findById(id).select('-pdfData -docxData');

  if (!gen) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (gen.userId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(gen);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId;
  const { id } = await params;
  const gen = await CVGeneration.findById(id).select('userId');

  if (!gen) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (gen.userId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await Promise.all([
    CVGeneration.findByIdAndDelete(id),
    User.findByIdAndUpdate(userId, { $pull: { cvGenerations: gen._id } }),
  ]);

  return NextResponse.json({ success: true });
}
