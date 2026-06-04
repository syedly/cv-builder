import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import CVGeneration from '@/models/CVGeneration';
import Link from 'next/link';
import { Sparkles, Clock, Key, TrendingUp, FileText, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session as typeof session & { userId?: string })?.userId;

  await connectDB();

  const [user, recentCVs] = await Promise.all([
    User.findById(userId).select('name freeTries byokKeyEncrypted cvGenerations'),
    CVGeneration.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('jobTitle jobCompany atsScore createdAt usedByok'),
  ]);

  const freeTries = user?.freeTries ?? 0;
  const hasByok = !!user?.byokKeyEncrypted;
  const totalCVs = user?.cvGenerations.length ?? 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Welcome back, {session?.user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-blue-100 mb-6">Ready to land your next role?</p>
        <Link
          href="/builder"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Generate New CV
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Free Tries
          </div>
          <div className="text-3xl font-bold text-slate-900">{freeTries}</div>
          <div className="text-xs text-slate-400 mt-0.5">remaining</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Key className="w-3.5 h-3.5 text-emerald-500" />
            API Key
          </div>
          <div className={`text-sm font-semibold mt-1 ${hasByok ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hasByok ? 'Active' : 'Not set'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{hasByok ? 'Unlimited' : 'Add for unlimited'}</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            CVs Created
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalCVs}</div>
          <div className="text-xs text-slate-400 mt-0.5">all time</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            Best ATS Score
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {recentCVs.length > 0 ? Math.max(...recentCVs.map((c) => c.atsScore)) : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{recentCVs.length > 0 ? 'out of 100' : 'no CVs yet'}</div>
        </div>
      </div>

      {/* Recent CVs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent CVs</h2>
          {recentCVs.length > 0 && (
            <Link href="/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentCVs.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No CVs yet</h3>
            <p className="text-slate-500 mb-6 text-sm">Generate your first ATS-optimized CV in under a minute</p>
            <Link href="/builder" className="btn-primary inline-flex">
              <Sparkles className="w-4 h-4" />
              Generate First CV
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCVs.map((cv) => (
              <div key={cv._id.toString()} className="card p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${cv.atsScore >= 80 ? 'bg-emerald-50 text-emerald-700' : cv.atsScore >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                  {cv.atsScore}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{cv.jobTitle || 'Unknown Job'}</p>
                  <p className="text-sm text-slate-500 truncate">{cv.jobCompany || '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">
                    {new Date(cv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex gap-1.5 mt-1 justify-end">
                    <a
                      href={`/api/cv/${cv._id}/pdf`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      PDF
                    </a>
                    <span className="text-slate-300">·</span>
                    <a
                      href={`/api/cv/${cv._id}/docx`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      DOCX
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
