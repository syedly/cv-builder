'use client';

import { useState, useEffect } from 'react';
import { Check, User } from 'lucide-react';
import Link from 'next/link';
import { JobInputStep } from '@/components/builder/JobInputStep';
import { TemplateSelectStep } from '@/components/builder/TemplateSelectStep';
import { QuestionsStep } from '@/components/builder/QuestionsStep';
import { GenerateStep } from '@/components/builder/GenerateStep';
import { CVPreview } from '@/components/cv/CVPreview';
import { ATSReport } from '@/components/cv/ATSReport';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TemplateId, TEMPLATES } from '@/components/cv/templates/types';

type Step = 'job' | 'template' | 'questions' | 'generate' | 'result';

interface UserStatus { freeTries: number; hasByok: boolean; }
interface ProfileData { fullName?: string; desiredTitle?: string; technicalSkills?: string[]; summary?: string; }

const STEP_LABELS = ['Job Details', 'Template', 'Questions', 'Generate'];
const STEP_ORDER: Step[] = ['job', 'template', 'questions', 'generate', 'result'];

export default function BuilderPage() {
  const [step, setStep] = useState<Step>('job');
  const [jobText, setJobText] = useState('');
  const [template, setTemplate] = useState<TemplateId>('modern');
  const [qaAnswers, setQaAnswers] = useState<Record<string, string>>({});
  const [generationId, setGenerationId] = useState('');
  const [userStatus, setUserStatus] = useState<UserStatus>({ freeTries: 3, hasByok: false });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [resultData, setResultData] = useState<{ cvData: unknown; atsReport: unknown } | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);

  useEffect(() => {
    fetch('/api/byok/status').then(r => r.json()).then(d => setUserStatus({ freeTries: d.freeTries, hasByok: d.hasByok })).catch(() => {});
    fetch('/api/profile').then(r => r.json()).then(d => { if (d && !d.error) setProfile(d); }).catch(() => {});

    // Pre-fill from job portal "Create CV" button
    const prefill = sessionStorage.getItem('prefill_job_desc');
    if (prefill) {
      sessionStorage.removeItem('prefill_job_desc');
      setJobText(prefill);
      setStep('template');
    }
  }, []);

  const profileSummary = profile
    ? `Name: ${profile.fullName || ''}. Title: ${profile.desiredTitle || ''}. Skills: ${(profile.technicalSkills || []).slice(0, 10).join(', ')}. Summary: ${profile.summary || ''}`
    : '';

  const hasProfile = !!(profile?.fullName || profile?.technicalSkills?.length);

  const handleJobComplete = (text: string) => { setJobText(text); setStep('template'); };
  const handleTemplateNext = () => setStep('questions');
  const handleQuestionsComplete = (answers: Record<string, string>) => { setQaAnswers(answers); setStep('generate'); };
  const handleSkipQuestions = () => { setQaAnswers({}); setStep('generate'); };

  const handleGenerateComplete = async (id: string) => {
    setGenerationId(id);
    setLoadingResult(true);
    try {
      const res = await fetch(`/api/cv/${id}`);
      const data = await res.json();
      setResultData({ cvData: data.cvData, atsReport: data.atsReport });
    } catch {}
    setLoadingResult(false);
    setStep('result');
  };

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Build Your ATS CV</h1>
          <p className="text-slate-500 text-sm mt-1">AI-powered, tailored to the job description</p>
        </div>
        {!hasProfile && (
          <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 hover:bg-amber-100 transition">
            <User className="w-4 h-4" />
            Complete your profile for best results
          </Link>
        )}
        {hasProfile && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            <Check className="w-4 h-4" />
            Profile loaded — AI will use your details
          </div>
        )}
      </div>

      {/* Step Progress */}
      {step !== 'result' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEP_LABELS.map((label, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={label} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-blue-600 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {done ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {label}
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`w-6 h-px ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>
      )}

      <Card>
        {step === 'job' && <JobInputStep onComplete={handleJobComplete} />}

        {step === 'template' && (
          <TemplateSelectStep
            selected={template}
            onSelect={setTemplate}
            onNext={handleTemplateNext}
            onBack={() => setStep('job')}
          />
        )}

        {step === 'questions' && (
          <QuestionsStep
            jobText={jobText}
            profileSummary={profileSummary}
            onComplete={handleQuestionsComplete}
            onSkip={handleSkipQuestions}
          />
        )}

        {step === 'generate' && (
          <GenerateStep
            jobText={jobText}
            resumeData={null}
            qaAnswers={qaAnswers}
            freeTries={userStatus.freeTries}
            hasByok={userStatus.hasByok}
            onComplete={handleGenerateComplete}
            onBack={() => setStep('questions')}
          />
        )}

        {step === 'result' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Your ATS-Optimized CV</h2>
                <p className="text-sm text-slate-500">Ready to download and apply</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href={`/api/cv/${generationId}/pdf?template=${template}`} className="btn-primary text-sm px-4 py-2">Download PDF</a>
                <a href={`/api/cv/${generationId}/docx`} className="btn-secondary text-sm px-4 py-2">Download DOCX</a>
                <Button variant="ghost" onClick={() => { setStep('job'); setJobText(''); setQaAnswers({}); setResultData(null); }}>New CV</Button>
              </div>
            </div>

            {/* Template switcher in result */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500 font-medium">Preview template:</span>
              {(Object.keys(TEMPLATES) as TemplateId[]).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplate(id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                    template === id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {TEMPLATES[id].label}
                </button>
              ))}
            </div>

            {loadingResult ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : resultData ? (
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">CV Preview</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[800px] overflow-y-auto">
                    <CVPreview cvData={resultData.cvData as Parameters<typeof CVPreview>[0]['cvData']} template={template} />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">ATS Analysis</h3>
                  <div className="card p-5">
                    <ATSReport report={resultData.atsReport as Parameters<typeof ATSReport>[0]['report']} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                <p>Could not load preview. <a href={`/api/cv/${generationId}/pdf?template=${template}`} className="text-blue-600">Download PDF directly</a></p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
