'use client';

import { CheckCircle, XCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';

interface ATSBreakdown {
  score: number;
  max: number;
  details: string;
}

interface ATSReportData {
  score: number;
  grade: string;
  breakdown: {
    keywordMatch: ATSBreakdown;
    formatScore: ATSBreakdown;
    contentQuality: ATSBreakdown;
    structure: ATSBreakdown;
  };
  keywordsFound: string[];
  keywordsMissing: string[];
  formatIssues: string[];
  suggestions: string[];
  passesATS: boolean;
}

interface ATSReportProps {
  report: ATSReportData;
}

const GRADE_CONFIG = {
  A: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', bar: 'green' as const },
  B: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', bar: 'blue' as const },
  C: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', bar: 'amber' as const },
  D: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', bar: 'amber' as const },
  F: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', bar: 'red' as const },
};

export function ATSReport({ report }: ATSReportProps) {
  const gradeConfig = GRADE_CONFIG[report.grade as keyof typeof GRADE_CONFIG] || GRADE_CONFIG.C;

  const breakdown = [
    { label: 'Keyword Match', ...report.breakdown.keywordMatch },
    { label: 'Format', ...report.breakdown.formatScore },
    { label: 'Content Quality', ...report.breakdown.contentQuality },
    { label: 'Structure', ...report.breakdown.structure },
  ];

  return (
    <div className="space-y-5">
      {/* Score header */}
      <div className={`flex items-center gap-4 p-5 rounded-2xl border ${gradeConfig.bg}`}>
        <div className={`text-5xl font-bold ${gradeConfig.color}`}>{report.grade}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-2xl font-bold ${gradeConfig.color}`}>{report.score}/100</span>
            {report.passesATS ? (
              <span className="badge-green">
                <CheckCircle className="w-3 h-3" /> ATS Ready
              </span>
            ) : (
              <span className="badge-red">
                <XCircle className="w-3 h-3" /> Needs Work
              </span>
            )}
          </div>
          <Progress value={report.score} color={gradeConfig.bar} />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Score Breakdown</h4>
        {breakdown.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">{item.score}/{item.max}</span>
            </div>
            <Progress value={item.score} max={item.max} color={item.score / item.max >= 0.7 ? 'green' : item.score / item.max >= 0.5 ? 'amber' : 'red'} />
            <p className="text-xs text-slate-400 mt-0.5">{item.details}</p>
          </div>
        ))}
      </div>

      {/* Keywords */}
      {report.keywordsFound.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Keywords Found ({report.keywordsFound.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {report.keywordsFound.slice(0, 20).map((kw) => (
              <span key={kw} className="badge-green">{kw}</span>
            ))}
            {report.keywordsFound.length > 20 && (
              <span className="badge-gray">+{report.keywordsFound.length - 20} more</span>
            )}
          </div>
        </div>
      )}

      {report.keywordsMissing.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-500" />
            Missing Keywords ({report.keywordsMissing.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {report.keywordsMissing.map((kw) => (
              <span key={kw} className="badge-red">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {report.suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Suggestions
          </h4>
          <ul className="space-y-2">
            {report.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
