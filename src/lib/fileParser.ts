export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    throw new Error(`Failed to parse PDF: ${err}`);
  }
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    throw new Error(`Failed to parse DOCX: ${err}`);
  }
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return parseDOCX(buffer);
  } else if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }
  throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
}
