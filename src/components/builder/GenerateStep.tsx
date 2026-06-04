'use client';

import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { BYOKModal } from '@/components/shared/BYOKModal';

interface GenerateStepProps {
  jobText: string;
  resumeData: string | null;
  qaAnswers?: Record<string, string>;
  freeTries: number;
  hasByok: boolean;
  onComplete: (generationId: string, score: number, grade: string) => void;
  onBack: () => void;
}

interface StatusEvent {
  step: string;
  message: string;
  pct: number;
}

const STEPS = [
  { key: 'validating', label: 'Checking API access' },
  { key: 'analyzing', label: 'Analyzing job & resume' },
  { key: 'building', label: 'Building your CV' },
  { key: 'scoring', label: 'Running ATS check' },
  { key: 'rendering', label: 'Generating PDF & DOCX' },
];

export function GenerateStep({ jobText, resumeData, qaAnswers, freeTries, hasByok, onComplete, onBack }: GenerateStepProps) {
  const [status, setStatus] = useState<StatusEvent | null>(null);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [byokOpen, setByokOpen] = useState(false);
  const [byokAdded, setByokAdded] = useState(hasByok);
  const canGenerate = hasByok || byokAdded || freeTries > 0;

  const generate = async () => {
    setGenerating(true);
    setError('');
    setProgress(0);

    const body: Record<string, unknown> = { jobText };
    if (resumeData) {
      try {
        const parsed = JSON.parse(resumeData);
        body.resumeText = JSON.stringify(parsed);
      } catch {
        body.resumeText = resumeData;
      }
    }
    if (qaAnswers && Object.keys(qaAnswers).length > 0) {
      body.qaAnswers = qaAnswers;
    }

    try {
      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === 'NO_ACCESS') {
          setByokOpen(true);
        } else {
          setError(data.error || 'Generation failed');
        }
        setGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim();
            const dataLine = lines[lines.indexOf(line) + 1];
            if (dataLine?.startsWith('data: ')) {
              try {
                const data = JSON.parse(dataLine.slice(6));
                if (eventType === 'status') {
                  setStatus(data);
                  setProgress(data.pct);
                } else if (eventType === 'complete') {
                  setProgress(100);
                  setTimeout(() => onComplete(data.generationId, data.atsScore, data.grade), 500);
                } else if (eventType === 'error') {
                  setError(data.message || 'Generation failed');
                  setGenerating(false);
                }
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (byokAdded && !generating) {
      // auto-start after BYOK added
    }
  }, [byokAdded]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === status?.step);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Generate Your CV</h2>
        <p className="text-slate-500 text-sm">
          AI agents will analyze the job and craft your ATS-optimized resume
        </p>
      </div>

      {!canGenerate && !byokAdded ? (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Free generations used up</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Add your OpenAI API key to continue generating unlimited CVs.
              </p>
            </div>
          </div>
          <Button onClick={() => setByokOpen(true)} className="w-full sm:w-auto">
            Add My API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Free tries indicator */}
          {!hasByok && !byokAdded && freeTries > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Using 1 of your {freeTries} free generation{freeTries !== 1 ? 's' : ''}</span>
            </div>
          )}

          {!generating && !error ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" onClick={onBack}>Back</Button>
              <Button onClick={generate} size="lg" className="flex-1 sm:flex-none">
                <Sparkles className="w-4 h-4" />
                Generate My ATS CV
              </Button>
            </div>
          ) : generating ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {status?.message || 'Starting...'}
                  </span>
                  <span className="text-sm text-slate-500">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>

              <div className="space-y-2">
                {STEPS.map((step, i) => {
                  const done = i < currentStepIndex;
                  const active = i === currentStepIndex;
                  return (
                    <div key={step.key} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${active ? 'bg-blue-50' : ''}`}>
                      {done ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : active ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                      )}
                      <span className={`text-sm ${active ? 'text-blue-700 font-medium' : done ? 'text-slate-500' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={onBack} size="sm">Back</Button>
                <Button onClick={generate} size="sm">Try Again</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <BYOKModal
        open={byokOpen}
        onClose={() => {
          setByokOpen(false);
          setByokAdded(true);
        }}
      />
    </div>
  );
}
