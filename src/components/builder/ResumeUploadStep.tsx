'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlignLeft, ArrowRight, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ResumeUploadStepProps {
  onComplete: (resumeText: string | null) => void;
  onBack: () => void;
}

export function ResumeUploadStep({ onComplete, onBack }: ResumeUploadStepProps) {
  const [mode, setMode] = useState<'upload' | 'paste' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF, DOCX, or TXT files are supported');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }
    setFile(f);
    setError('');
    setMode('upload');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleContinue = async () => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/resume/analyze', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onComplete(JSON.stringify(data));
      } else if (mode === 'paste' && pastedText.trim()) {
        const res = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pastedText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onComplete(JSON.stringify(data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Your Resume</h2>
        <p className="text-slate-500 text-sm">Upload your current resume, paste it, or skip to generate from scratch</p>
      </div>

      {!mode ? (
        <div className="grid sm:grid-cols-3 gap-3">
          {/* Upload */}
          <button
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed text-center transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Upload File</p>
              <p className="text-xs text-slate-500 mt-0.5">PDF, DOCX, TXT — max 5MB</p>
            </div>
          </button>

          {/* Paste */}
          <button
            onClick={() => setMode('paste')}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-center transition-all"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <AlignLeft className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Paste Text</p>
              <p className="text-xs text-slate-500 mt-0.5">Copy & paste resume text</p>
            </div>
          </button>

          {/* Skip */}
          <button
            onClick={() => onComplete(null)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-center transition-all"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <SkipForward className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Start from Scratch</p>
              <p className="text-xs text-slate-500 mt-0.5">AI generates a template for you</p>
            </div>
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* File selected */}
      {mode === 'upload' && file && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <FileText className="w-8 h-8 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={() => { setFile(null); setMode(null); }} className="p-1.5 hover:bg-blue-100 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* Paste mode */}
      {mode === 'paste' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Paste your resume</label>
            <button onClick={() => setMode(null)} className="text-xs text-slate-400 hover:text-slate-600">
              Back
            </button>
          </div>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={10}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={onBack} className="sm:w-auto">
          Back
        </Button>
        {mode && (
          <Button
            onClick={handleContinue}
            loading={loading}
            disabled={mode === 'upload' ? !file : !pastedText.trim()}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            <ArrowRight className="w-4 h-4" />
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
