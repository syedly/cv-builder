'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, ChevronRight, SkipForward } from 'lucide-react';

interface QuestionsStepProps {
  jobText: string;
  profileSummary: string;
  onComplete: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export function QuestionsStep({ jobText, profileSummary, onComplete, onSkip }: QuestionsStepProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/job/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobText, profileSummary }),
    })
      .then(r => r.json())
      .then(d => setQuestions(d.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [jobText, profileSummary]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Tailoring Questions</h2>
          <p className="text-slate-500 text-sm">Generating personalized questions based on this job...</p>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    onSkip();
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">Help AI Write Better Bullets</h2>
        </div>
        <p className="text-slate-500 text-sm">Answer these targeted questions to get stronger, more personalized CV content. Completely optional — skip to use your profile data as-is.</p>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mr-1.5">{i + 1}</span>
              {q}
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white resize-none placeholder:text-slate-300"
              rows={2}
              placeholder="Your answer (be specific, include numbers/metrics if possible)..."
              value={answers[q] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
        >
          <SkipForward className="w-4 h-4" />
          Skip questions
        </button>
        <button
          type="button"
          onClick={() => onComplete(answers)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          Continue with answers
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
