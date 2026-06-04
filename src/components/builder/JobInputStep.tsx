'use client';

import { useState } from 'react';
import { Link, AlignLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface JobInputStepProps {
  onComplete: (jobText: string) => void;
}

export function JobInputStep({ onComplete }: JobInputStepProps) {
  const [mode, setMode] = useState<'url' | 'text'>('text');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!value.trim()) {
      setError('Please enter a job description');
      return;
    }
    setLoading(true);
    setError('');

    if (mode === 'url') {
      try {
        const res = await fetch('/api/job/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'url', content: value }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.code === 'URL_BLOCKED') {
            setError("Couldn't fetch that URL. Please paste the job description text directly.");
            setMode('text');
          } else {
            setError(data.error || 'Failed to parse job URL');
          }
          setLoading(false);
          return;
        }
        onComplete(value);
      } catch {
        setError('Network error. Please try again.');
        setLoading(false);
      }
    } else {
      if (value.trim().length < 100) {
        setError('Please paste the full job description (at least 100 characters)');
        setLoading(false);
        return;
      }
      onComplete(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Job Description</h2>
        <p className="text-slate-500 text-sm">Paste a LinkedIn URL or the full job description text</p>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
        <button
          onClick={() => { setMode('text'); setError(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${mode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <AlignLeft className="w-4 h-4" />
          Paste Text
        </button>
        <button
          onClick={() => { setMode('url'); setError(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${mode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Link className="w-4 h-4" />
          LinkedIn URL
        </button>
      </div>

      {mode === 'text' ? (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Job Description
          </label>
          <textarea
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="Paste the full job description here...&#10;&#10;We are looking for a Senior Software Engineer to join our team..."
            rows={12}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">{value.length} characters</p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn Job URL</label>
          <input
            type="url"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="https://www.linkedin.com/jobs/view/12345..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="mt-2 text-xs text-amber-600">
            Note: LinkedIn may block direct access. If it fails, paste the text instead.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <Button onClick={handleContinue} loading={loading} size="lg" className="w-full sm:w-auto">
        <Sparkles className="w-4 h-4" />
        Continue to Resume Upload
      </Button>
    </div>
  );
}
