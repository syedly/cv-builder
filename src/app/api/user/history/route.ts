import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import CVGeneration from '@/models/CVGeneration';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session as typeof session & { userId?: string }).userId;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '0');
  const limit = 10;

  await connectDB();

  const [items, total] = await Promise.all([
    CVGeneration.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(page * limit)
      .select('jobTitle jobCompany atsScore createdAt usedByok processingMs'),
    CVGeneration.countDocuments({ userId }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}
