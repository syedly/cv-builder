import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { cvData, template = 'modern', format = 'pdf', filename = 'cv' } = await req.json();

  if (!cvData) return NextResponse.json({ error: 'cvData required' }, { status: 400 });

  const safeName = filename.toLowerCase().replace(/\s+/g, '-').slice(0, 60);

  if (format === 'docx') {
    const { generateDOCX } = await import('@/lib/docxGenerator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await generateDOCX(cvData as any);
    return new NextResponse(new Uint8Array(buf).buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeName}.docx"`,
      },
    });
  }

  const { generatePDF } = await import('@/lib/pdfGenerator');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await generatePDF(cvData as any, template);
  return new NextResponse(new Uint8Array(buf).buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}-${template}.pdf"`,
    },
  });
}
