import { runJobAnalysisAgent, JobAnalysisResult } from './jobAnalysisAgent';
import { runResumeAnalysisAgent, ResumeAnalysisResult } from './resumeAnalysisAgent';
import { runCVBuilderAgent, CVData } from './cvBuilderAgent';
import { runATSScoringAgent, ATSReport } from './atsScoringAgent';
import { generatePDF } from '@/lib/pdfGenerator';
import { generateDOCX } from '@/lib/docxGenerator';

export interface PipelineInput {
  jobText: string;
  resumeText: string | null;
  apiKey: string;
  profileData?: Record<string, unknown> | null;
  qaAnswers?: Record<string, string> | null;
}

export interface PipelineResult {
  jobAnalysis: JobAnalysisResult;
  resumeAnalysis: ResumeAnalysisResult | null;
  cvData: CVData;
  atsReport: ATSReport;
  pdfBuffer: Buffer;
  docxBuffer: Buffer;
  processingMs: number;
}

export type ProgressCallback = (step: string, message: string, pct: number) => void;

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      if (attempt < maxRetries) {
        const status = (err as { status?: number }).status;
        const waitMs = status === 429 ? 5000 : 1000 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
  }
  throw lastError;
}

export async function runPipeline(
  input: PipelineInput,
  onProgress?: ProgressCallback
): Promise<PipelineResult> {
  const start = Date.now();

  onProgress?.('validating', 'Checking API access...', 5);
  onProgress?.('analyzing', 'Analyzing job requirements...', 20);

  const [jobAnalysis, resumeAnalysis] = await Promise.all([
    withRetry(() => runJobAnalysisAgent(input.jobText, input.apiKey)),
    input.resumeText
      ? withRetry(() => runResumeAnalysisAgent(input.resumeText!, input.apiKey))
      : Promise.resolve(null),
  ]);

  onProgress?.('building', 'Crafting your ATS-optimized resume...', 50);

  const { cvData } = await withRetry(() =>
    runCVBuilderAgent(
      jobAnalysis,
      resumeAnalysis,
      input.apiKey,
      input.profileData ?? null,
      input.qaAnswers ?? null,
    )
  );

  onProgress?.('scoring', 'Running ATS optimization check...', 78);

  const atsReport = runATSScoringAgent(cvData, jobAnalysis);

  onProgress?.('rendering', 'Generating PDF & DOCX files...', 92);

  const [pdfBuffer, docxBuffer] = await Promise.all([
    generatePDF(cvData as Parameters<typeof generatePDF>[0]),
    generateDOCX(cvData as Parameters<typeof generateDOCX>[0]),
  ]);

  return {
    jobAnalysis,
    resumeAnalysis,
    cvData,
    atsReport,
    pdfBuffer,
    docxBuffer,
    processingMs: Date.now() - start,
  };
}
