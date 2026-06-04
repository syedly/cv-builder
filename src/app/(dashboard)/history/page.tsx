import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import CVGeneration from '@/models/CVGeneration';
import Link from 'next/link';
import { FileText, Download, Sparkles, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const session = await auth();
  const userId = (session as typeof session & { userId?: string })?.userId;

  await connectDB();

  const cvs = await CVGeneration.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('jobTitle jobCompany atsScore createdAt usedByok processingMs hasUserResume');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CV History</h1>
          <p className="text-slate-500 text-sm mt-1">{cvs.length} CV{cvs.length !== 1 ? 's' : ''} generated</p>
        </div>
        <Link href="/builder" className="btn-primary text-sm">
          <Sparkles className="w-4 h-4" />
          New CV
        </Link>
      </div>

      {cvs.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No CVs yet</h3>
          <p className="text-slate-500 mb-6 text-sm">Your generated CVs will appear here</p>
          <Link href="/builder" className="btn-primary inline-flex">
            Generate Your First CV
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {cvs.map((cv) => {
            const scoreColor =
              cv.atsScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
              cv.atsScore >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' :
              'text-red-700 bg-red-50 border-red-200';

            return (
              <div key={cv._id.toString()} className="card p-5">
                <div className="flex items-start gap-4">
                  {/* ATS Score */}
                  <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${scoreColor}`}>
                    <span className="text-xl font-bold">{cv.atsScore}</span>
                    <span className="text-[10px] font-medium">ATS</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{cv.jobTitle || 'Unknown Job'}</h3>
                    <p className="text-slate-500 text-sm truncate">{cv.jobCompany || '—'}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(cv.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </div>
                      {cv.processingMs && (
                        <span className="text-xs text-slate-400">
                          Generated in {(cv.processingMs / 1000).toFixed(1)}s
                        </span>
                      )}
                      {cv.usedByok && (
                        <span className="badge-blue">Own API Key</span>
                      )}
                      {cv.hasUserResume && (
                        <span className="badge-gray">Resume provided</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <a
                      href={`/api/cv/${cv._id}/pdf`}
                      className="btn-primary text-xs py-2 px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </a>
                    <a
                      href={`/api/cv/${cv._id}/docx`}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      DOCX
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
