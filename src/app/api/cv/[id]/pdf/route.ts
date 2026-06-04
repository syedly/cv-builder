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
  const gen = await CVGeneration.findById(id).select('userId jobTitle jobCompany pdfData cvData');

  if (!gen) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (gen.userId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let pdfBytes: Uint8Array;

  if (gen.pdfData) {
    pdfBytes = new Uint8Array(gen.pdfData);
  } else {
    const { generatePDF } = await import('@/lib/pdfGenerator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await generatePDF(gen.cvData as any);
    pdfBytes = new Uint8Array(buf);
  }

  const filename = `cv-${(gen.jobTitle || 'resume').toLowerCase().replace(/\s+/g, '-')}.pdf`;

  return new NextResponse(pdfBytes.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
