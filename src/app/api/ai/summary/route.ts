import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { decryptAPIKey } from '@/lib/encryption';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;
  const user = await User.findById(userId).select('byokKeyEncrypted byokKeyIV byokKeyTag');

  if (!user?.byokKeyEncrypted) {
    return new Response(JSON.stringify({ error: 'OpenAI API key required', code: 'NO_BYOK' }), { status: 402 });
  }

  const apiKey = decryptAPIKey(user.byokKeyEncrypted as string, user.byokKeyIV as string, user.byokKeyTag as string);
  const { prompt, cvData } = await req.json();

  const openai = new OpenAI({ apiKey });

  const contextLines: string[] = [];
  if (cvData?.contactSection?.name) contextLines.push(`Name: ${cvData.contactSection.name}`);
  if (cvData?.skills?.technical?.length) contextLines.push(`Skills: ${cvData.skills.technical.slice(0, 10).join(', ')}`);
  if (cvData?.workExperience?.length) {
    const latest = cvData.workExperience[0];
    if (latest?.title) contextLines.push(`Latest role: ${latest.title} at ${latest.company}`);
  }

  const systemPrompt = `You are an expert CV writer. Write a compelling professional summary for a resume.
Rules: 2-3 sentences. Start with a strong descriptive phrase. Include years of experience and key value.
No labels. No markdown. Plain text only. Be specific and impactful.`;

  const userMsg = prompt
    ? `Write a professional summary based on this context: "${prompt}"${contextLines.length ? `\nCV context: ${contextLines.join(' | ')}` : ''}`
    : `Write a professional summary. CV context: ${contextLines.join(' | ')}`;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
          stream: true,
          max_tokens: 200,
          temperature: 0.7,
        });

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
      } catch (err) {
        controller.enqueue(new TextEncoder().encode(''));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}
