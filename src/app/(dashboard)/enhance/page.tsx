'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, File, Loader2, CheckCircle2, AlertCircle, Wand2, PenLine, X } from 'lucide-react';
import { CVData } from '@/components/cv/templates/types';
import { EnhanceEditor } from '@/components/enhance/EnhanceEditor';

type Stage = 'upload' | 'parsing' | 'editor';

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
const EXT_LABEL: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'text/plain': 'TXT',
};

function FileIcon({ type }: { type: string }) {
  const isPdf = type === 'application/pdf';
  return isPdf
    ? <FileText className="w-8 h-8 text-red-500" />
    : <File className="w-8 h-8 text-blue-500" />;
}

export default function EnhancePage() {
  const [stage, setStage] = useState<Stage>('upload');
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState('');
  const [cvData, setCvData] = useState<CVData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetUpload = () => {
    setStage('upload');
    setSelectedFile(null);
    setParseError('');
    setCvData(null);
  };

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setParseError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError('File too large. Maximum size is 10MB.');
      return;
    }
    setParseError('');
    setSelectedFile(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const parseAndContinue = async () => {
    if (!selectedFile) return;
    setStage('parsing');
    setParseError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/cv/parse-upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setParseError(data.error || 'Failed to parse CV');
        setStage('upload');
        return;
      }

      setCvData(data.cvData);
      setStage('editor');
    } catch {
      setParseError('Network error. Please try again.');
      setStage('upload');
    }
  };

  if (stage === 'editor' && cvData) {
    return <EnhanceEditor initialData={cvData} onBack={resetUpload} />;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CV Enhancer</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Upload your existing CV to edit it manually or let AI improve it based on your instructions
        </p>
      </div>

      {stage === 'parsing' ? (
        /* Parsing state */
        <div className="card p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Parsing your CV…</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Extracting text{selectedFile?.type === 'application/pdf' ? ' from PDF' : ''} and structuring with AI
            </p>
          </div>
          <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      ) : (
        /* Upload state */
        <>
          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !selectedFile && inputRef.current?.click()}
            className={`relative card p-8 flex flex-col items-center justify-center text-center gap-4 transition-all cursor-pointer ${
              dragging
                ? 'border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
                : selectedFile
                ? 'border-2 border-green-400 bg-green-50 dark:bg-green-900/10 cursor-default'
                : 'border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={onInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <>
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                  <FileIcon type={selectedFile.type} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {EXT_LABEL[selectedFile.type] || 'File'} · {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Ready to parse
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setSelectedFile(null); setParseError(''); }}
                  className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {dragging ? 'Drop your CV here' : 'Drag & drop your CV here'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or click to browse files</p>
                </div>
                <div className="flex items-center gap-2">
                  {['PDF', 'DOCX', 'TXT'].map(fmt => (
                    <span key={fmt} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-lg">
                      {fmt}
                    </span>
                  ))}
                  <span className="text-xs text-slate-400 dark:text-slate-500">· max 10MB</span>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {parseError && (
            <div className="mt-3 flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{parseError}</p>
            </div>
          )}

          {/* Continue button */}
          {selectedFile && (
            <button
              type="button"
              onClick={parseAndContinue}
              className="mt-4 w-full btn-primary py-3 flex items-center justify-center gap-2 text-base font-semibold"
            >
              <Loader2 className="w-4 h-4 hidden" />
              Parse & Continue →
            </button>
          )}

          {/* Mode explanation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <PenLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Edit Manually</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your CV is parsed into editable fields. Change anything — contact info, bullet points, skills — and see a live preview. Free for all users.
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Wand2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Enhance with AI</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Describe what to improve — stronger verbs, better summary, more metrics. AI applies only those changes. Requires your OpenAI API key.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1.5">Tips for best results</p>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
              <li>Use a text-based PDF (not a scanned image) for best parsing</li>
              <li>DOCX files from Word or Google Docs parse most accurately</li>
              <li>You can always switch to Edit tab to fix any parsing mistakes</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
