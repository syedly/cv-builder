import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import UserProfile from '@/models/UserProfile';
import CVGeneration from '@/models/CVGeneration';
import { runPipeline } from '@/agents/orchestrator';
import { decryptAPIKey } from '@/lib/encryption';

async function resolveAPIKey(user: InstanceType<typeof User>): Promise<{ key: string | null; usedByok: boolean }> {
  if (user.byokKeyEncrypted && user.byokKeyIV && user.byokKeyTag) {
    return { key: decryptAPIKey(user.byokKeyEncrypted, user.byokKeyIV, user.byokKeyTag), usedByok: true };
  }
  if (user.freeTries > 0) return { key: process.env.OPENAI_API_KEY!, usedByok: false };
  return { key: null, usedByok: false };
}

function sendEvent(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(msg));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await req.json();
  const { jobText, resumeText, qaAnswers } = body;

  if (!jobText?.trim()) {
    return new Response(JSON.stringify({ error: 'Job description is required' }), { status: 400 });
  }

  await connectDB();
  const userId = (session as typeof session & { userId?: string }).userId!;
  const [user, profile] = await Promise.all([
    User.findById(userId),
    UserProfile.findOne({ userId }),
  ]);

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  const { key: apiKey, usedByok } = await resolveAPIKey(user);
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'No API access. Add your OpenAI API key.', code: 'NO_ACCESS' }),
      { status: 402 }
    );
  }

  // Convert profile mongoose doc to plain object for agent
  const profileData = profile ? profile.toObject() : null;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runPipeline(
          {
            jobText,
            resumeText: resumeText || null,
            apiKey,
            profileData,
            qaAnswers: qaAnswers || null,
          },
          (step, message, pct) => {
            sendEvent(controller, 'status', { step, message, pct });
          }
        );

        if (!usedByok) {
          await User.findByIdAndUpdate(userId, { $inc: { freeTries: -1 } });
        }

        const gen = await CVGeneration.create({
          userId,
          jobTitle: result.jobAnalysis.title || 'Unknown Job',
          jobCompany: result.jobAnalysis.company || '',
          jobDescription: jobText.slice(0, 2000),
          hasUserResume: !!(resumeText || profileData?.fullName),
          jobAnalysis: result.jobAnalysis,
          resumeAnalysis: result.resumeAnalysis,
          cvData: result.cvData,
          atsScore: result.atsReport.score,
          atsReport: result.atsReport,
          pdfData: result.pdfBuffer,
          docxData: result.docxBuffer,
          aiModel: 'gpt-4o',
          usedByok,
          processingMs: result.processingMs,
        });

        await User.findByIdAndUpdate(userId, { $push: { cvGenerations: gen._id } });
        const updatedUser = await User.findById(userId).select('freeTries');

        sendEvent(controller, 'complete', {
          generationId: gen._id.toString(),
          atsScore: result.atsReport.score,
          grade: result.atsReport.grade,
          keywordsFound: result.atsReport.keywordsFound.length,
          keywordsMissing: result.atsReport.keywordsMissing.length,
          passesATS: result.atsReport.passesATS,
          triesRemaining: updatedUser?.freeTries ?? 0,
          processingMs: result.processingMs,
        });
      } catch (err) {
        console.error('Pipeline error:', err);
        sendEvent(controller, 'error', {
          message: err instanceof Error ? err.message : 'Generation failed',
          code: 'PIPELINE_ERROR',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
