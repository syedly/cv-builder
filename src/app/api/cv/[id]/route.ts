import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import CVGeneration from '@/models/CVGeneration';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
