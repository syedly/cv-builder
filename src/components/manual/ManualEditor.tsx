'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, X, Eye, EyeOff,
  Download, Sparkles, Lock, Loader2, Wand2, Check, Palette,
} from 'lucide-react';
import { CVPreview } from '@/components/cv/CVPreview';
import { TemplateSelectStep } from '@/components/builder/TemplateSelectStep';
import { CVData, TemplateId, TEMPLATES, CustomTheme, SavedTheme } from '@/components/cv/templates/types';
import { ThemeDesigner } from '@/components/manual/ThemeDesigner';

/* ─── local types with id for React keys ──────────────────── */
interface WItem { _id: string; company: string; title: string; startDate: string; endDate: string; current: boolean; location: string; bullets: string[]; }
interface EItem { _id: string; degree: string; field: string; school: string; graduationYear: string; gpa: string; honors: string; }
interface PItem { _id: string; name: string; description: string; technologies: string[]; github: string; link: string; }
interface RItem { _id: string; name: string; title: string; organization: string; email: string; phone: string; }

const uid = () => Math.random().toString(36).slice(2, 9);
const emptyWork  = (): WItem => ({ _id: uid(), company: '', title: '', startDate: '', endDate: '', current: false, location: '', bullets: ['', '', ''] });
const emptyEdu   = (): EItem => ({ _id: uid(), degree: '', field: '', school: '', graduationYear: '', gpa: '', honors: '' });
const emptyProj  = (): PItem => ({ _id: uid(), name: '', description: '', technologies: [], github: '', link: '' });
const emptyRef   = (): RItem => ({ _id: uid(), name: '', title: '', organization: '', email: '', phone: '' });

/* ─── shared field styles ─────────────────────────────────── */
const inp  = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition';
const area = `${inp} resize-none`;

function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function SecHead({ title, open, onToggle, extra }: { title: string; open: boolean; onToggle: () => void; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between cursor-pointer py-3 border-b border-slate-100 dark:border-slate-700" onClick={onToggle}>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        {extra}
        <button type="button" onClick={onToggle} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [val, setVal] = useState('');
  const add = () => { const v = val.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setVal(''); };
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input className={inp} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder={placeholder} />
        <button type="button" onClick={add} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 shrink-0">Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg border border-blue-100 dark:border-blue-800">
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Collapsible work item ───────────────────────────────── */
function WorkForm({ item, onChange, onRemove }: { item: WItem; onChange: (i: WItem) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const s = (k: keyof WItem, v: unknown) => onChange({ ...item, [k]: v });
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {item.title || 'New Position'}{item.company ? ` @ ${item.company}` : ''}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {open && (
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <FL label="Company"><input className={inp} value={item.company} onChange={e => s('company', e.target.value)} placeholder="Google" /></FL>
            <FL label="Job Title"><input className={inp} value={item.title} onChange={e => s('title', e.target.value)} placeholder="Software Engineer" /></FL>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <FL label="Start"><input className={inp} value={item.startDate} onChange={e => s('startDate', e.target.value)} placeholder="01/2022" /></FL>
            <FL label="End">
              <input className={inp} value={item.current ? 'Present' : item.endDate} disabled={item.current} onChange={e => s('endDate', e.target.value)} placeholder="12/2024" />
            </FL>
            <FL label="Location"><input className={inp} value={item.location} onChange={e => s('location', e.target.value)} placeholder="Remote" /></FL>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={item.current} onChange={e => s('current', e.target.checked)} className="rounded" />
            Currently here
          </label>
          <FL label="Bullet points (action verb + metric)">
            <div className="space-y-1.5">
              {item.bullets.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inp} value={b}
                    onChange={e => { const nb = [...item.bullets]; nb[i] = e.target.value; s('bullets', nb); }}
                    placeholder="Led migration to microservices, cutting latency by 40%" />
                  {item.bullets.length > 1 && (
                    <button type="button" onClick={() => s('bullets', item.bullets.filter((_, j) => j !== i))} className="text-red-400 shrink-0"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              {item.bullets.length < 6 && (
                <button type="button" onClick={() => s('bullets', [...item.bullets, ''])} className="text-blue-600 text-xs flex items-center gap-1 hover:text-blue-700">
                  <Plus className="w-3 h-3" /> Add bullet
                </button>
              )}
            </div>
          </FL>
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible education item ──────────────────────────── */
function EduForm({ item, onChange, onRemove }: { item: EItem; onChange: (i: EItem) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const s = (k: keyof EItem, v: string) => onChange({ ...item, [k]: v });
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {item.degree || 'New Degree'}{item.school ? ` — ${item.school}` : ''}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {open && (
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <FL label="Degree"><input className={inp} value={item.degree} onChange={e => s('degree', e.target.value)} placeholder="Bachelor of Science" /></FL>
            <FL label="Field"><input className={inp} value={item.field} onChange={e => s('field', e.target.value)} placeholder="Computer Science" /></FL>
          </div>
          <FL label="University"><input className={inp} value={item.school} onChange={e => s('school', e.target.value)} placeholder="MIT" /></FL>
          <div className="grid grid-cols-3 gap-2">
            <FL label="Grad Year"><input className={inp} value={item.graduationYear} onChange={e => s('graduationYear', e.target.value)} placeholder="2024" /></FL>
            <FL label="GPA"><input className={inp} value={item.gpa} onChange={e => s('gpa', e.target.value)} placeholder="3.8" /></FL>
            <FL label="Honors"><input className={inp} value={item.honors} onChange={e => s('honors', e.target.value)} placeholder="Summa Cum Laude" /></FL>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible project item ────────────────────────────── */
function ProjForm({ item, onChange, onRemove }: { item: PItem; onChange: (i: PItem) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const s = (k: keyof PItem, v: unknown) => onChange({ ...item, [k]: v });
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name || 'New Project'}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {open && (
        <div className="p-3 space-y-2.5">
          <FL label="Project Name"><input className={inp} value={item.name} onChange={e => s('name', e.target.value)} placeholder="AI CV Builder" /></FL>
          <FL label="Description">
            <textarea className={area} rows={2} value={item.description} onChange={e => s('description', e.target.value)} placeholder="What it does and the impact..." />
          </FL>
          <FL label="Technologies">
            <TagInput tags={item.technologies} onChange={v => s('technologies', v)} placeholder="React, Node.js..." />
          </FL>
          <div className="grid grid-cols-2 gap-2">
            <FL label="GitHub"><input className={inp} value={item.github} onChange={e => s('github', e.target.value)} placeholder="github.com/user/repo" /></FL>
            <FL label="Live Link"><input className={inp} value={item.link} onChange={e => s('link', e.target.value)} placeholder="myproject.com" /></FL>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible reference item ─────────────────────────── */
function RefForm({ item, onChange, onRemove }: { item: RItem; onChange: (i: RItem) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const s = (k: keyof RItem, v: string) => onChange({ ...item, [k]: v });
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {item.name || 'New Reference'}{item.organization ? ` — ${item.organization}` : ''}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {open && (
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <FL label="Full Name *"><input className={inp} value={item.name} onChange={e => s('name', e.target.value)} placeholder="Dr. Jane Smith" /></FL>
            <FL label="Job Title"><input className={inp} value={item.title} onChange={e => s('title', e.target.value)} placeholder="Engineering Manager" /></FL>
            <FL label="Organization"><input className={inp} value={item.organization} onChange={e => s('organization', e.target.value)} placeholder="Google" /></FL>
            <FL label="Email"><input className={inp} value={item.email} onChange={e => s('email', e.target.value)} placeholder="jane@google.com" /></FL>
          </div>
          <FL label="Phone"><input className={inp} value={item.phone} onChange={e => s('phone', e.target.value)} placeholder="+1-202-555-0100" /></FL>
        </div>
      )}
    </div>
  );
}

/* ─── AI Summary Panel ────────────────────────────────────── */
function SummaryAI({ summary, onChange, hasByok, cvData }: {
  summary: string; onChange: (s: string) => void; hasByok: boolean; cvData: CVData;
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const generate = async () => {
    if (!hasByok || generating) return;
    setGenerating(true);
    setDone(false);
    onChange('');

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cvData }),
      });

      if (!res.ok) { setGenerating(false); return; }

      const reader = res.body?.getReader();
      if (!reader) { setGenerating(false); return; }
      const dec = new TextDecoder();
      let text = '';

      while (true) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        text += dec.decode(value, { stream: true });
        onChange(text);
      }
      setDone(true);
    } catch {}
    setGenerating(false);
  };

  return (
    <div className="space-y-2">
      <textarea
        className={area}
        rows={4}
        value={summary}
        onChange={e => onChange(e.target.value)}
        placeholder="Results-driven software engineer with 3+ years building scalable systems..."
      />

      {/* AI toggle */}
      <button
        type="button"
        onClick={() => {
          if (!hasByok) return;
          setAiOpen(o => !o);
        }}
        className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border transition w-full ${
          hasByok
            ? 'text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40'
            : 'text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-not-allowed'
        }`}
        title={hasByok ? 'Generate with AI' : 'Add your OpenAI API key in settings to use AI generation'}
      >
        {hasByok ? <Wand2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        <span>Generate with AI</span>
        {!hasByok && (
          <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">Requires API Key</span>
        )}
        {hasByok && done && <Check className="w-4 h-4 text-green-500 ml-auto" />}
      </button>

      {!hasByok && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Add your OpenAI key via the <span className="font-medium text-blue-500">API Key</span> button in the navbar to unlock AI writing.
        </p>
      )}

      {hasByok && aiOpen && (
        <div className="border border-violet-200 dark:border-violet-800 rounded-xl p-3 bg-violet-50/50 dark:bg-violet-900/10 space-y-2">
          <p className="text-xs font-medium text-violet-700 dark:text-violet-400">Tell the AI about your background:</p>
          <textarea
            className={area}
            rows={2}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. 5+ years full-stack developer, React & Node.js expert, led teams of 8, built SaaS products..."
          />
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60 w-full justify-center"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing your summary…</>
              : <><Sparkles className="w-4 h-4" /> Generate summary</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Download helper ─────────────────────────────────────── */
async function downloadCV(cvData: CVData, template: string, format: 'pdf' | 'docx', name: string, customTheme?: CustomTheme | null) {
  const res = await fetch('/api/cv/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvData, template, format, filename: name || 'my-cv', customTheme }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${name || 'cv'}-${template}.${format}`;
  a.click(); URL.revokeObjectURL(url);
}

/* ─── Main ManualEditor ───────────────────────────────────── */
export function ManualEditor() {
  const [step, setStep] = useState<'template' | 'edit'>('template');
  const [template, setTemplate] = useState<TemplateId>('modern');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [hasByok, setHasByok] = useState(false);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [summary, setSummary] = useState('');
  const [work, setWork] = useState<WItem[]>([]);
  const [edu, setEdu] = useState<EItem[]>([]);
  const [tech, setTech] = useState<string[]>([]);
  const [soft, setSoft] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>([]);
  const [projs, setProjs] = useState<PItem[]>([]);
  const [certs, setCerts] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [refs, setRefs] = useState<RItem[]>([]);

  // Section open/close
  const [openSec, setOpenSec] = useState<Record<string, boolean>>({
    contact: true, summary: true, work: true, edu: true,
    skills: true, projects: false, certs: false, achievements: false, references: false,
  });
  const tog = (k: string) => setOpenSec(o => ({ ...o, [k]: !o[k] }));

  useEffect(() => {
    fetch('/api/byok/status').then(r => r.json()).then(d => setHasByok(!!d.hasByok)).catch(() => {});
    fetch('/api/themes').then(r => r.json()).then(d => setSavedThemes(d.themes || [])).catch(() => {});
  }, []);

  // Compute live CVData
  const cvData: CVData = useMemo(() => ({
    contactSection: { name, title: jobTitle, email, phone, location, linkedin, github, portfolio },
    professionalSummary: summary,
    workExperience: work.map(({ _id, current, ...w }) => ({ ...w, endDate: current ? 'Present' : w.endDate })),
    skills: { technical: tech, soft, languages: langs },
    education: edu.map(({ _id, ...e }) => e),
    certifications: certs.filter(Boolean),
    projects: projs.map(({ _id, ...p }) => p),
    achievements: achievements.filter(Boolean),
    references: refs.filter(r => r.name).map(({ _id, ...r }) => r),
  }), [name, jobTitle, email, phone, location, linkedin, github, portfolio, summary, work, edu, tech, soft, langs, projs, certs, achievements, refs]);

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setDownloading(format);
    await downloadCV(cvData, template, format, name || 'my-cv', customTheme);
    setDownloading(null);
  };

  if (step === 'template') {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Build Your CV Manually</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Choose a template — then fill in your details and see a live preview</p>
        </div>
        <div className="card p-6">
          <TemplateSelectStep
            selected={template}
            onSelect={setTemplate}
            onNext={() => setStep('edit')}
            onBack={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-64px)] -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── Left: Live Preview ── */}
      <div className={`lg:w-[44%] lg:flex lg:flex-col border-r border-slate-200 dark:border-slate-700 ${mobileTab === 'preview' ? 'flex flex-col' : 'hidden lg:flex'}`}>
        {/* Preview header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide shrink-0">Template</span>
          <div className="flex flex-wrap gap-1 flex-1">
            {(Object.keys(TEMPLATES) as Exclude<TemplateId, 'custom'>[]).map(id => (
              <button key={id} type="button" onClick={() => { setTemplate(id); setCustomTheme(null); }}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg border transition-colors ${
                  template === id && !customTheme
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                }`}>
                {TEMPLATES[id].label}
              </button>
            ))}
            {/* Saved custom themes */}
            {savedThemes.map(t => (
              <button key={t._id} type="button"
                onClick={() => { setTemplate('custom'); setCustomTheme(t); }}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg border transition-colors flex items-center gap-1 ${
                  template === 'custom' && customTheme && (customTheme as SavedTheme)._id === t._id
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-700 hover:border-violet-400'
                }`}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.primaryColor }} />
                {t.name}
              </button>
            ))}
            {/* Design button */}
            <button type="button" onClick={() => setDesignerOpen(true)}
              className="px-2 py-1 text-[10px] font-medium rounded-lg border border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors flex items-center gap-1">
              <Palette className="w-3 h-3" /> Design
            </button>
          </div>
        </div>

        {/* Preview body */}
        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-3">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden min-h-[1000px] origin-top"
               style={{ fontSize: '75%' }}>
            <CVPreview cvData={cvData} template={template} customTheme={customTheme} />
          </div>
        </div>

        {/* Download row */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 flex gap-2">
          <button type="button" onClick={() => handleDownload('pdf')} disabled={downloading !== null}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 flex-1 justify-center">
            {downloading === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading === 'pdf' ? 'Generating…' : 'Download PDF'}
          </button>
          <button type="button" onClick={() => handleDownload('docx')} disabled={downloading !== null}
            className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 flex-1 justify-center">
            {downloading === 'docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading === 'docx' ? 'Generating…' : 'DOCX'}
          </button>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className={`lg:flex-1 lg:flex lg:flex-col ${mobileTab === 'edit' ? 'flex flex-col' : 'hidden lg:flex'}`}>
        {/* Form header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide shrink-0">
            {template !== 'custom' ? TEMPLATES[template].label : (customTheme ? 'Custom' : 'Custom')} Template
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={() => setDesignerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
              <Palette className="w-3.5 h-3.5" /> Design your own
            </button>
            <button type="button" onClick={() => setStep('template')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0">
              Change
            </button>
          </div>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-1">

            {/* ─ Contact ─ */}
            <div className="card p-4">
              <SecHead title="Contact Information" open={openSec.contact} onToggle={() => tog('contact')} />
              {openSec.contact && (
                <div className="pt-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <FL label="Full Name *"><input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Syed Hassan Ali" /></FL>
                    <FL label="Professional Title"><input className={inp} value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" /></FL>
                    <FL label="Email *"><input className={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" /></FL>
                    <FL label="Phone"><input className={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92-315-000-0000" /></FL>
                    <FL label="Location"><input className={inp} value={location} onChange={e => setLocation(e.target.value)} placeholder="Lahore, Pakistan" /></FL>
                    <FL label="LinkedIn"><input className={inp} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/username" /></FL>
                    <FL label="GitHub"><input className={inp} value={github} onChange={e => setGithub(e.target.value)} placeholder="github.com/username" /></FL>
                  </div>
                  <FL label="Portfolio / Website"><input className={inp} value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="myportfolio.dev" /></FL>
                </div>
              )}
            </div>

            {/* ─ Summary ─ */}
            <div className="card p-4">
              <SecHead title="Professional Summary" open={openSec.summary} onToggle={() => tog('summary')} />
              {openSec.summary && (
                <div className="pt-3">
                  <SummaryAI summary={summary} onChange={setSummary} hasByok={hasByok} cvData={cvData} />
                </div>
              )}
            </div>

            {/* ─ Work Experience ─ */}
            <div className="card p-4">
              <SecHead
                title="Work Experience"
                open={openSec.work}
                onToggle={() => tog('work')}
                extra={
                  <button type="button" onClick={e => { e.stopPropagation(); setWork(w => [...w, emptyWork()]); setOpenSec(o => ({ ...o, work: true })); }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                }
              />
              {openSec.work && (
                <div className="pt-3">
                  {work.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">No work experience yet</p>
                      <button type="button" onClick={() => setWork([emptyWork()])} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Add position</button>
                    </div>
                  )}
                  {work.map(item => (
                    <WorkForm key={item._id} item={item}
                      onChange={updated => setWork(w => w.map(x => x._id === updated._id ? updated : x))}
                      onRemove={() => setWork(w => w.filter(x => x._id !== item._id))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ─ Education ─ */}
            <div className="card p-4">
              <SecHead
                title="Education"
                open={openSec.edu}
                onToggle={() => tog('edu')}
                extra={
                  <button type="button" onClick={e => { e.stopPropagation(); setEdu(e => [...e, emptyEdu()]); setOpenSec(o => ({ ...o, edu: true })); }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                }
              />
              {openSec.edu && (
                <div className="pt-3">
                  {edu.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">No education added</p>
                      <button type="button" onClick={() => setEdu([emptyEdu()])} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Add degree</button>
                    </div>
                  )}
                  {edu.map(item => (
                    <EduForm key={item._id} item={item}
                      onChange={updated => setEdu(e => e.map(x => x._id === updated._id ? updated : x))}
                      onRemove={() => setEdu(e => e.filter(x => x._id !== item._id))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ─ Skills ─ */}
            <div className="card p-4">
              <SecHead title="Skills" open={openSec.skills} onToggle={() => tog('skills')} />
              {openSec.skills && (
                <div className="pt-3 space-y-4">
                  <FL label="Technical Skills (Enter or click Add)">
                    <TagInput tags={tech} onChange={setTech} placeholder="Python, React, AWS..." />
                  </FL>
                  <FL label="Soft Skills">
                    <TagInput tags={soft} onChange={setSoft} placeholder="Leadership, Communication..." />
                  </FL>
                  <FL label="Languages">
                    <TagInput tags={langs} onChange={setLangs} placeholder="English, Urdu..." />
                  </FL>
                </div>
              )}
            </div>

            {/* ─ Projects ─ */}
            <div className="card p-4">
              <SecHead
                title="Projects"
                open={openSec.projects}
                onToggle={() => tog('projects')}
                extra={
                  <button type="button" onClick={e => { e.stopPropagation(); setProjs(p => [...p, emptyProj()]); setOpenSec(o => ({ ...o, projects: true })); }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                }
              />
              {openSec.projects && (
                <div className="pt-3">
                  {projs.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">No projects added</p>
                      <button type="button" onClick={() => setProjs([emptyProj()])} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Add project</button>
                    </div>
                  )}
                  {projs.map(item => (
                    <ProjForm key={item._id} item={item}
                      onChange={updated => setProjs(p => p.map(x => x._id === updated._id ? updated : x))}
                      onRemove={() => setProjs(p => p.filter(x => x._id !== item._id))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ─ Certifications ─ */}
            <div className="card p-4">
              <SecHead title="Certifications" open={openSec.certs} onToggle={() => tog('certs')} />
              {openSec.certs && (
                <div className="pt-3 space-y-1.5">
                  {certs.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={inp} value={c}
                        onChange={e => { const nc = [...certs]; nc[i] = e.target.value; setCerts(nc); }}
                        placeholder="AWS Solutions Architect, 2024" />
                      <button type="button" onClick={() => setCerts(certs.filter((_, j) => j !== i))} className="text-red-400 shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setCerts([...certs, ''])} className="text-blue-600 text-xs flex items-center gap-1 hover:text-blue-700 mt-1">
                    <Plus className="w-3 h-3" /> Add certification
                  </button>
                </div>
              )}
            </div>

            {/* ─ Achievements ─ */}
            <div className="card p-4">
              <SecHead title="Achievements & Awards" open={openSec.achievements} onToggle={() => tog('achievements')} />
              {openSec.achievements && (
                <div className="pt-3 space-y-1.5">
                  {achievements.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={inp} value={a}
                        onChange={e => { const na = [...achievements]; na[i] = e.target.value; setAchievements(na); }}
                        placeholder="Dean's List 2023, Hackathon Winner..." />
                      <button type="button" onClick={() => setAchievements(achievements.filter((_, j) => j !== i))} className="text-red-400 shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setAchievements([...achievements, ''])} className="text-blue-600 text-xs flex items-center gap-1 hover:text-blue-700 mt-1">
                    <Plus className="w-3 h-3" /> Add achievement
                  </button>
                </div>
              )}
            </div>

            {/* ─ References ─ */}
            <div className="card p-4">
              <SecHead
                title="References"
                open={openSec.references}
                onToggle={() => tog('references')}
                extra={
                  <button type="button" onClick={e => { e.stopPropagation(); setRefs(r => [...r, emptyRef()]); setOpenSec(o => ({ ...o, references: true })); }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                }
              />
              {openSec.references && (
                <div className="pt-3">
                  {refs.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">No references added</p>
                      <button type="button" onClick={() => setRefs([emptyRef()])} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Add reference</button>
                    </div>
                  )}
                  {refs.map(item => (
                    <RefForm key={item._id} item={item}
                      onChange={updated => setRefs(r => r.map(x => x._id === updated._id ? updated : x))}
                      onRemove={() => setRefs(r => r.filter(x => x._id !== item._id))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom download on mobile */}
            <div className="lg:hidden pb-4 flex gap-2 pt-2">
              <button type="button" onClick={() => handleDownload('pdf')} disabled={downloading !== null}
                className="btn-primary text-sm flex-1 flex items-center justify-center gap-2">
                {downloading === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
              <button type="button" onClick={() => handleDownload('docx')} disabled={downloading !== null}
                className="btn-secondary text-sm flex-1 flex items-center justify-center gap-2">
                {downloading === 'docx' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                DOCX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Theme Designer overlay ── */}
      {designerOpen && (
        <ThemeDesigner
          cvData={cvData}
          initialTheme={template === 'custom' && customTheme ? { ...(customTheme as SavedTheme) } : null}
          savedThemes={savedThemes}
          onApply={(t) => { setTemplate('custom'); setCustomTheme(t); }}
          onSaved={(t) => {
            setSavedThemes(prev => {
              const idx = prev.findIndex(x => x._id === t._id);
              return idx >= 0 ? prev.map(x => x._id === t._id ? t : x) : [t, ...prev];
            });
            setTemplate('custom');
            setCustomTheme(t);
          }}
          onDeleted={(id) => {
            setSavedThemes(prev => prev.filter(x => x._id !== id));
            if (template === 'custom' && (customTheme as SavedTheme)?._id === id) {
              setTemplate('modern'); setCustomTheme(null);
            }
          }}
          onClose={() => setDesignerOpen(false)}
        />
      )}

      {/* ── Mobile tab toggle ── */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex bg-slate-900 dark:bg-slate-700 text-white rounded-2xl p-1 gap-1 shadow-2xl">
          <button type="button" onClick={() => setMobileTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mobileTab === 'edit' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}>
            <EyeOff className="w-4 h-4" /> Edit
          </button>
          <button type="button" onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mobileTab === 'preview' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}>
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
      </div>
    </div>
  );
}
