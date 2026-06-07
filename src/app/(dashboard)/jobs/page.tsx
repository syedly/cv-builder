'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, Briefcase, Clock, ExternalLink, Sparkles,
  Lock, Loader2, Filter, X, ChevronDown, Building2, Globe,
  Wand2, RefreshCw, Laptop, AlignLeft, UserCheck,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { Job } from '@/lib/jobAPIs';

/* ─── Types & constants ──────────────────────────────────── */
interface Filters {
  query: string;
  location: string;
  types: string[];
  workModes: string[];
  datePosted: string;
}

const WORK_MODES = [
  { id: 'remote',  label: 'Remote',   icon: Globe },
  { id: 'hybrid',  label: 'Hybrid',   icon: Laptop },
  { id: 'on-site', label: 'On-site',  icon: Building2 },
];
const JOB_TYPES = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'contract',  label: 'Contract'  },
  { id: 'intern',    label: 'Internship' },
];
const DATE_OPTIONS = [
  { id: '',       label: 'Any time'  },
  { id: 'today',  label: 'Today'     },
  { id: '3days',  label: 'Last 3 days' },
  { id: 'week',   label: 'Last week' },
  { id: 'month',  label: 'Last month' },
];
const SOURCE_COLORS: Record<string, string> = {
  JSearch:   'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Adzuna:    'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  Remotive:  'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  Arbeitnow: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
};

/* ─── Helpers ────────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function CompanyAvatar({ name, logo, size = 'md' }: { name: string; logo?: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-12 h-12 text-base';
  if (logo) return <img src={logo} alt={name} className={`${dim} rounded-xl object-contain bg-white border border-slate-100 dark:border-slate-700 p-1`} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return <div className={`${dim} ${color} rounded-xl flex items-center justify-center font-bold text-white shrink-0`}>{initials}</div>;
}

function WorkModeBadge({ mode }: { mode: Job['workMode'] }) {
  const cfg: Record<string, string> = {
    remote: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    hybrid: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'on-site': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    unknown: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700',
  };
  const label: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', 'on-site': 'On-site', unknown: 'Unspecified' };
  if (mode === 'unknown') return null;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg[mode]}`}>{label[mode]}</span>;
}

/* ─── Job Card ───────────────────────────────────────────── */
function JobCard({ job, onCreateCV }: { job: Job; onCreateCV: (job: Job) => void }) {
  const [expanded, setExpanded] = useState(false);
  const typeLabel: Record<string, string> = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', intern: 'Internship', other: 'Other' };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow group">
      <div className="flex gap-3">
        <CompanyAvatar name={job.company} logo={job.companyLogo} />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {job.title}
            </h3>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${SOURCE_COLORS[job.sourceName] || 'bg-slate-100 text-slate-500'}`}>
              {job.sourceName}
            </span>
          </div>

          {/* Company + location */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 shrink-0" />{job.company}
            </span>
            {job.location && (
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />{job.location}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <WorkModeBadge mode={job.workMode} />
            <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-600">
              {typeLabel[job.type] || job.type}
            </span>
            {job.salary && (
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                {job.salary}
              </span>
            )}
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {job.tags.slice(0, 5).map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-800">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="mt-2">
              <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                {job.description}
              </p>
              {job.description.length > 120 && (
                <button type="button" onClick={() => setExpanded(e => !e)} className="text-[10px] text-blue-500 hover:text-blue-700 mt-0.5">
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />{timeAgo(job.postedAt)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onCreateCV(job)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create CV
              </button>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Apply Now
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
function JobSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="flex gap-1.5">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Sidebar ─────────────────────────────────────── */
function FilterPanel({ filters, onChange, onReset }: {
  filters: Filters; onChange: (f: Filters) => void; onReset: () => void;
}) {
  const toggle = (key: 'types' | 'workModes', val: string) => {
    const arr = filters[key];
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Filters</h3>
        <button type="button" onClick={onReset} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Reset all</button>
      </div>

      {/* Work Mode */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Work Mode</p>
        <div className="space-y-1.5">
          {WORK_MODES.map(({ id, label, icon: Icon }) => (
            <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={filters.workModes.includes(id)} onChange={() => toggle('workModes', id)} className="rounded border-slate-300 text-blue-600" />
              <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Job Type</p>
        <div className="space-y-1.5">
          {JOB_TYPES.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={filters.types.includes(id)} onChange={() => toggle('types', id)} className="rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Posted */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Date Posted</p>
        <div className="space-y-1.5">
          {DATE_OPTIONS.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" name="datePosted" value={id} checked={filters.datePosted === id} onChange={() => onChange({ ...filters, datePosted: id })} className="text-blue-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Pagination bar ─────────────────────────────────────── */
const PER_PAGE = 15;

function JobPagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / PER_PAGE);
  if (totalPages <= 1) return null;

  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{from}–{to}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> jobs
      </p>
      <div className="flex items-center gap-1">
        <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)}
          className="page-btn"><ChevronLeft className="w-4 h-4" /></button>
        {pages.map((p, i) => p === '…'
          ? <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
          : <button key={p} type="button" onClick={() => onPage(p as number)}
              className={p === page ? 'page-btn-active' : 'page-btn'}>{p}</button>
        )}
        <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)}
          className="page-btn"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
const DEFAULT_FILTERS: Filters = { query: '', location: '', types: [], workModes: [], datePosted: '' };

export default function JobsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasByok, setHasByok] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // AI Search state
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiExtracted, setAiExtracted] = useState<Record<string, unknown> | null>(null);
  const [aiUsedProfile, setAiUsedProfile] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetch('/api/byok/status').then(r => r.json()).then(d => setHasByok(!!d.hasByok)).catch(() => {});
  }, []);

  const fetchJobs = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, page: p, limit: PER_PAGE }),
      });
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setSources(data.sources || []);
    } catch {}
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initial load + filter changes with debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchJobs(filters, 1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetchJobs]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchJobs(filters, p);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(f => ({ ...f, query: searchInput, location: locationInput }));
    setPage(1);
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim() || aiSearching) return;
    setAiSearching(true);
    setAiExtracted(null);
    setAiUsedProfile(false);
    try {
      const res = await fetch('/api/jobs/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setSources(data.sources || []);
      setAiExtracted(data.extractedParams || null);
      setAiUsedProfile(!!data.usedProfile);
    } catch {}
    setAiSearching(false);
  };

  const handleCreateCV = (job: Job) => {
    const jd = `${job.title} at ${job.company}\nLocation: ${job.location}\n\n${job.description}`;
    sessionStorage.setItem('prefill_job_desc', jd);
    router.push('/builder');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
    setLocationInput('');
  };

  const totalPages = Math.ceil(total / PER_PAGE);
  const activeFilterCount = filters.types.length + filters.workModes.length + (filters.datePosted ? 1 : 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Job Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Search across {sources.length > 0 ? sources.join(', ') : 'multiple platforms'} — find the right role, then build a tailored CV instantly
        </p>
      </div>

      {/* Main search bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition text-sm"
            placeholder="Job title, skills, or keywords..."
          />
        </div>
        <div className="relative sm:w-52">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition text-sm"
            placeholder="Location or country..."
          />
        </div>
        <button type="submit" className="btn-primary px-6 text-sm">
          <Search className="w-4 h-4" /> Search
        </button>
      </form>

      {/* AI Search toggle */}
      <div className="card p-4">
        <button
          type="button"
          onClick={() => { if (hasByok) setAiMode(o => !o); }}
          className={`flex items-center gap-2 w-full text-left transition-colors ${hasByok ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
        >
          <div className={`p-2 rounded-xl ${hasByok ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
            {hasByok ? <Wand2 className="w-4 h-4 text-violet-600 dark:text-violet-400" /> : <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Find Jobs with AI {!hasByok && <span className="text-xs font-normal text-slate-400 ml-2">(Requires your OpenAI API key)</span>}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasByok
                ? 'Describe your ideal role in plain language — AI searches and ranks for you'
                : 'Add your API key in the navbar to unlock AI-powered job matching'}
            </p>
          </div>
          {hasByok && (
            <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${aiMode ? 'rotate-180' : ''}`} />
          )}
        </button>

        {aiMode && hasByok && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
            {/* Profile used indicator */}
            {aiUsedProfile && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-1.5">
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                AI used your saved profile to tailor the search
              </div>
            )}
            {/* Extracted params chips */}
            {aiExtracted && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(aiExtracted).filter(([k]) => k !== 'limit' && k !== 'page').map(([k, v]) => (
                  <span key={k} className="text-[10px] px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full border border-violet-200 dark:border-violet-800">
                    {k}: {Array.isArray(v) ? (v as string[]).join(', ') : String(v)}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAiSearch(); }}
                  className="w-full pl-9 pr-4 py-2.5 border border-violet-200 dark:border-violet-800 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition text-sm"
                  placeholder='e.g. "remote senior React developer, startup, $100k+" or just say "find me jobs"'
                />
              </div>
              <button type="button" onClick={handleAiSearch} disabled={aiSearching || !aiPrompt.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 whitespace-nowrap">
                {aiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiSearching ? 'Searching…' : 'Find with AI'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Body: filters + results */}
      <div className="flex gap-6">
        {/* Filter sidebar — desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-4 sticky top-24">
            <FilterPanel filters={filters} onChange={f => { setFilters(f); setPage(1); }} onReset={resetFilters} />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {loading && jobs.length === 0 ? 'Loading…' : `${total} jobs found`}
              </span>
              {sources.length > 0 && (
                <div className="flex gap-1">
                  {sources.map(s => (
                    <span key={s} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {/* Mobile filter button */}
              <button type="button" onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition">
                <Filter className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              <button type="button" onClick={() => { setPage(1); fetchJobs(filters, 1); }}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {(filters.types.length > 0 || filters.workModes.length > 0 || filters.datePosted) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[...filters.workModes, ...filters.types, ...(filters.datePosted ? [filters.datePosted] : [])].map(f => (
                <span key={f} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                  {f}
                  <button type="button" onClick={() => {
                    if (filters.workModes.includes(f)) setFilters(prev => ({ ...prev, workModes: prev.workModes.filter(x => x !== f) }));
                    else if (filters.types.includes(f)) setFilters(prev => ({ ...prev, types: prev.types.filter(x => x !== f) }));
                    else setFilters(prev => ({ ...prev, datePosted: '' }));
                  }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Job list */}
          <div className="space-y-3">
            {loading && jobs.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)
              : jobs.length === 0
              ? (
                <div className="card p-16 text-center">
                  <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No jobs found</p>
                  <p className="text-sm text-slate-400 mt-1">Try different keywords or broader filters</p>
                  <button type="button" onClick={resetFilters} className="mt-4 btn-secondary text-sm">Clear filters</button>
                </div>
              )
              : jobs.map(job => <JobCard key={job.id} job={job} onCreateCV={handleCreateCV} />)
            }
          </div>

          {/* Pagination */}
          {loading && jobs.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
          {!loading && (
            <JobPagination page={page} total={total} onPage={handlePageChange} />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Filters</h3>
              <button type="button" onClick={() => setFiltersOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <FilterPanel filters={filters} onChange={f => { setFilters(f); setPage(1); }} onReset={resetFilters} />
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary w-full mt-5">
              Show {jobs.length} jobs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
