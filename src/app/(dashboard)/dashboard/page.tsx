'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Key, TrendingUp, FileText, ChevronRight, Download, Eye } from 'lucide-react';
import { Pagination, PerPageSelector } from '@/components/ui/Pagination';
import { CVPreview } from '@/components/cv/CVPreview';
import { TemplateId, TEMPLATES } from '@/components/cv/templates/types';
import { X } from 'lucide-react';

interface CVItem {
  _id: string;
  jobTitle: string;
  jobCompany: string;
  atsScore: number;
  createdAt: string;
  usedByok?: boolean;
  cvData?: unknown;
}

interface Stats {
  freeTries: number;
  hasByok: boolean;
}

function MiniViewModal({ cv, onClose }: { cv: CVItem; onClose: () => void }) {
  const [template, setTemplate] = useState<TemplateId>('modern');
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">{cv.jobTitle}</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(TEMPLATES) as TemplateId[]).map(id => (
                <button key={id} type="button" onClick={() => setTemplate(id)}
                  className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${template === id ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300'}`}>
                  {TEMPLATES[id].label}
                </button>
              ))}
            </div>
            <a href={`/api/cv/${cv._id}/pdf?template=${template}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-xl hover:bg-blue-700 transition">
              <Download className="w-3 h-3" /> PDF
            </a>
            <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[70vh] p-3">
          {cv.cvData
            ? <CVPreview cvData={cv.cvData as Parameters<typeof CVPreview>[0]['cvData']} template={template} />
            : <div className="text-center py-16 text-slate-400">No preview available</div>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ freeTries: 0, hasByok: false });
  const [cvs, setCvs] = useState<CVItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [viewingCv, setViewingCv] = useState<CVItem | null>(null);
  const [loadingCvId, setLoadingCvId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/byok/status').then(r => r.json()).then(d => setStats({ freeTries: d.freeTries ?? 0, hasByok: !!d.hasByok })).catch(() => {});
  }, []);

  const fetchCVs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/history?page=${page}&limit=${perPage}`);
      const data = await res.json();
      setCvs(data.items || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, perPage]);

  useEffect(() => { fetchCVs(); }, [fetchCVs]);

  const handlePageChange = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handlePerPageChange = (n: number) => { setPerPage(n); setPage(0); };

  const handleView = async (cv: CVItem) => {
    if (cv.cvData) { setViewingCv(cv); return; }
    setLoadingCvId(cv._id);
    try {
      const res = await fetch(`/api/cv/${cv._id}`);
      const data = await res.json();
      const full = { ...cv, cvData: data.cvData };
      setCvs(prev => prev.map(c => c._id === cv._id ? full : c));
      setViewingCv(full);
    } catch {}
    setLoadingCvId(null);
  };

  const totalPages = Math.ceil(total / perPage);
  const bestScore = cvs.length > 0 ? Math.max(...cvs.map(c => c.atsScore)) : null;

  return (
    <>
      {viewingCv && <MiniViewModal cv={viewingCv} onClose={() => setViewingCv(null)} />}

      <div className="space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome back!</h1>
          <p className="text-blue-100 mb-6">Ready to land your next role?</p>
          <Link href="/builder" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
            <Sparkles className="w-4 h-4" />
            Generate New CV
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Free Tries
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.freeTries}</div>
            <div className="text-xs text-slate-400 mt-0.5">remaining</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <Key className="w-3.5 h-3.5 text-emerald-500" /> API Key
            </div>
            <div className={`text-sm font-semibold mt-1 ${stats.hasByok ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`}>
              {stats.hasByok ? 'Active' : 'Not set'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{stats.hasByok ? 'Unlimited' : 'Add for unlimited'}</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <FileText className="w-3.5 h-3.5 text-purple-500" /> CVs Created
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{total}</div>
            <div className="text-xs text-slate-400 mt-0.5">all time</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Best ATS Score
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{bestScore ?? '—'}</div>
            <div className="text-xs text-slate-400 mt-0.5">{bestScore !== null ? 'out of 100' : 'no CVs yet'}</div>
          </div>
        </div>

        {/* Recent CVs */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent CVs</h2>
            <div className="flex items-center gap-3">
              <PerPageSelector perPage={perPage} onChange={handlePerPageChange} total={total} options={[5, 10, 25, 50]} />
              {total > 0 && (
                <Link href="/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="card p-12 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : cvs.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No CVs yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Generate your first ATS-optimized CV in under a minute</p>
              <Link href="/builder" className="btn-primary inline-flex">
                <Sparkles className="w-4 h-4" /> Generate First CV
              </Link>
            </div>
          ) : (
            <div className="card p-4 space-y-3">
              {cvs.map(cv => (
                <div key={cv._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${cv.atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : cv.atsScore >= 60 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {cv.atsScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{cv.jobTitle || 'Unknown Job'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{cv.jobCompany || '—'}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="hidden sm:block">
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3 inline mr-0.5" />
                        {new Date(cv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleView(cv)}
                      disabled={loadingCvId === cv._id}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                      {loadingCvId === cv._id
                        ? <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                        : <Eye className="w-3 h-3" />}
                      View
                    </button>
                    <div className="flex gap-1.5">
                      <a href={`/api/cv/${cv._id}/pdf`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">PDF</a>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <a href={`/api/cv/${cv._id}/docx`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">DOCX</a>
                    </div>
                  </div>
                </div>
              ))}

              <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} onPage={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
