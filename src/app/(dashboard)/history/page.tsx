'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Download, Sparkles, Clock, Trash2, Eye, X, ChevronDown } from 'lucide-react';
import { CVPreview } from '@/components/cv/CVPreview';
import { TemplateId, TEMPLATES } from '@/components/cv/templates/types';
import { Pagination, PerPageSelector } from '@/components/ui/Pagination';

interface CVItem {
  _id: string;
  jobTitle: string;
  jobCompany: string;
  atsScore: number;
  createdAt: string;
  usedByok: boolean;
  processingMs?: number;
  hasUserResume?: boolean;
  cvData?: unknown;
}

function ViewModal({ cv, onClose }: { cv: CVItem; onClose: () => void }) {
  const [template, setTemplate] = useState<TemplateId>('modern');
  const templateIds = Object.keys(TEMPLATES) as Exclude<TemplateId, 'custom'>[];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{cv.jobTitle}</h2>
            {cv.jobCompany && <p className="text-sm text-slate-500 dark:text-slate-400">{cv.jobCompany}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex flex-wrap gap-1.5">
              {templateIds.map(id => (
                <button key={id} type="button" onClick={() => setTemplate(id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    template === id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300'
                  }`}>
                  {TEMPLATES[id].label}
                </button>
              ))}
            </div>
            <a href={`/api/cv/${cv._id}/pdf?template=${template}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button type="button" onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[75vh] p-4">
          {cv.cvData
            ? <CVPreview cvData={cv.cvData as Parameters<typeof CVPreview>[0]['cvData']} template={template} />
            : <div className="text-center py-20 text-slate-400">CV data not available</div>}
        </div>
      </div>
    </div>
  );
}

function DownloadMenu({ cvId }: { cvId: string }) {
  const [open, setOpen] = useState(false);
  const templateIds = Object.keys(TEMPLATES) as Exclude<TemplateId, 'custom'>[];

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
        <Download className="w-3.5 h-3.5" /> PDF <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden w-44">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Choose Template</p>
            </div>
            {templateIds.map(id => (
              <a key={id} href={`/api/cv/${cvId}/pdf?template=${id}`} onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 transition">
                <span>{TEMPLATES[id].label}</span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                  TEMPLATES[id].atsTag === 'Best ATS' ? 'bg-green-100 text-green-700' :
                  TEMPLATES[id].atsTag === 'Visual' ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-50 text-blue-600'
                }`}>{TEMPLATES[id].atsTag}</span>
              </a>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-700">
              <a href={`/api/cv/${cvId}/docx`} onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <Download className="w-3.5 h-3.5 text-slate-400" /> DOCX
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [cvs, setCvs] = useState<CVItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [viewingCv, setViewingCv] = useState<CVItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingCvId, setLoadingCvId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/history?page=${page}&limit=${perPage}`);
      const data = await res.json();
      setCvs(data.items || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, perPage]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this CV? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/cv/${id}`, { method: 'DELETE' });
      // If last item on page and not first page, go back
      if (cvs.length === 1 && page > 0) {
        setPage(p => p - 1);
      } else {
        fetchHistory();
      }
    } catch {}
    setDeletingId(null);
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      {viewingCv && <ViewModal cv={viewingCv} onClose={() => setViewingCv(null)} />}

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CV History</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {total} CV{total !== 1 ? 's' : ''} generated
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PerPageSelector perPage={perPage} onChange={handlePerPageChange} total={total} options={[5, 10, 25, 50]} />
            <Link href="/builder" className="btn-primary text-sm">
              <Sparkles className="w-4 h-4" /> New CV
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="card p-16 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : cvs.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No CVs yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Your generated CVs will appear here</p>
            <Link href="/builder" className="btn-primary inline-flex">Generate Your First CV</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cvs.map((cv) => {
              const scoreColor =
                cv.atsScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                cv.atsScore >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';

              return (
                <div key={cv._id} className="card p-5">
                  <div className="flex items-start gap-4">
                    {/* ATS Score */}
                    <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${scoreColor}`}>
                      <span className="text-xl font-bold">{cv.atsScore}</span>
                      <span className="text-[10px] font-medium">ATS</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{cv.jobTitle || 'Unknown Job'}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{cv.jobCompany || '—'}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(cv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {cv.processingMs && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Generated in {(cv.processingMs / 1000).toFixed(1)}s
                          </span>
                        )}
                        {cv.usedByok && <span className="badge-blue">Own API Key</span>}
                        {cv.hasUserResume && <span className="badge-gray">Resume provided</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => handleView(cv)} disabled={loadingCvId === cv._id}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50">
                        {loadingCvId === cv._id
                          ? <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          : <Eye className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <DownloadMenu cvId={cv._id} />

                      <button type="button" onClick={() => handleDelete(cv._id)} disabled={deletingId === cv._id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition disabled:opacity-50"
                        title="Delete CV">
                        {deletingId === cv._id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card p-4">
                <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} onPage={handlePageChange} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
