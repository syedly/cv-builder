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
  const gen = await CVGeneration.findById(id).select('userId jobTitle docxData cvData');

  if (!gen) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (gen.userId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let docxBytes: Uint8Array;

  if (gen.docxData) {
    docxBytes = new Uint8Array(gen.docxData);
  } else {
    const { generateDOCX } = await import('@/lib/docxGenerator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await generateDOCX(gen.cvData as any);
    docxBytes = new Uint8Array(buf);
  }

  const filename = `cv-${(gen.jobTitle || 'resume').toLowerCase().replace(/\s+/g, '-')}.docx`;

  return new NextResponse(docxBytes.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
