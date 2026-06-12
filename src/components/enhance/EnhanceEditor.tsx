'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, X, Eye, EyeOff,
  Download, Loader2, Wand2, Lock, Check, Sparkles, AlertCircle,
  ArrowLeft, PenLine,
} from 'lucide-react';
import { CVPreview } from '@/components/cv/CVPreview';
import { CVData, TemplateId, TEMPLATES } from '@/components/cv/templates/types';

/* ─── local types ─────────────────────────────────────────── */
interface WItem { _id: string; company: string; title: string; startDate: string; endDate: string; current: boolean; location: string; bullets: string[]; }
interface EItem { _id: string; degree: string; field: string; school: string; graduationYear: string; gpa: string; honors: string; }
interface PItem { _id: string; name: string; description: string; technologies: string[]; github: string; link: string; }

const uid = () => Math.random().toString(36).slice(2, 9);

function fromWork(w: CVData['workExperience'][0]): WItem {
  return { _id: uid(), ...w, current: w.endDate === 'Present', location: w.location || '' };
}
function fromEdu(e: CVData['education'][0]): EItem {
  return { _id: uid(), degree: e.degree, field: e.field || '', school: e.school, graduationYear: e.graduationYear, gpa: e.gpa || '', honors: e.honors || '' };
}
function fromProj(p: NonNullable<CVData['projects']>[0]): PItem {
  return { _id: uid(), name: p.name, description: p.description, technologies: p.technologies, github: p.github || '', link: p.link || '' };
}
const emptyWork  = (): WItem => ({ _id: uid(), company: '', title: '', startDate: '', endDate: '', current: false, location: '', bullets: ['', '', ''] });
const emptyEdu   = (): EItem => ({ _id: uid(), degree: '', field: '', school: '', graduationYear: '', gpa: '', honors: '' });
const emptyProj  = (): PItem => ({ _id: uid(), name: '', description: '', technologies: [], github: '', link: '' });

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
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <FL label="Start"><input className={inp} value={item.startDate} onChange={e => s('startDate', e.target.value)} placeholder="Jan 2022" /></FL>
            <FL label="End"><input className={inp} value={item.current ? 'Present' : item.endDate} disabled={item.current} onChange={e => s('endDate', e.target.value)} placeholder="Dec 2024" /></FL>
            <FL label="Location"><input className={inp} value={item.location} onChange={e => s('location', e.target.value)} placeholder="Remote" /></FL>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={item.current} onChange={e => s('current', e.target.checked)} className="rounded" />
            Currently here
          </label>
          <FL label="Bullet points">
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

/* ─── Download helper ─────────────────────────────────────── */
async function downloadCV(cvData: CVData, template: string, format: 'pdf' | 'docx', name: string) {
  const res = await fetch('/api/cv/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvData, template, format, filename: name || 'enhanced-cv' }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${name || 'cv'}-enhanced-${template}.${format}`;
  a.click(); URL.revokeObjectURL(url);
}

/* ─── AI Enhance Panel ────────────────────────────────────── */
function AIEnhancePanel({
  cvData, hasByok, onEnhanced,
}: { cvData: CVData; hasByok: boolean; onEnhanced: (data: CVData) => void }) {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [charCount, setCharCount] = useState(0);
  const accRef = useRef('');

  const enhance = async () => {
    if (!hasByok || !prompt.trim() || status === 'loading') return;
    setStatus('loading');
    setErrorMsg('');
    accRef.current = '';
    setCharCount(0);

    try {
      const res = await fetch('/api/cv/enhance-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, prompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Enhancement failed');
        setStatus('error');
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStatus('error'); return; }
      const dec = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current += dec.decode(value, { stream: true });
        setCharCount(accRef.current.length);
      }

      const enhanced = JSON.parse(accRef.current) as CVData;
      onEnhanced({
        contactSection: { ...cvData.contactSection, ...enhanced.contactSection },
        professionalSummary: enhanced.professionalSummary ?? cvData.professionalSummary,
        workExperience: enhanced.workExperience?.length ? enhanced.workExperience : cvData.workExperience,
        skills: enhanced.skills ?? cvData.skills,
        education: enhanced.education?.length ? enhanced.education : cvData.education,
        certifications: enhanced.certifications ?? cvData.certifications,
        projects: enhanced.projects ?? cvData.projects,
        achievements: enhanced.achievements ?? cvData.achievements,
      });
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse AI response');
      setStatus('error');
    }
  };

  const suggestions = [
    'Improve my professional summary to sound more impactful',
    'Add stronger action verbs to all bullet points',
    'Make bullet points more quantified with metrics',
    'Rewrite the summary for a senior engineering role',
    'Make the tone more confident and results-driven',
  ];

  return (
    <div className="space-y-4">
      {/* BYOK gate */}
      {!hasByok && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">API Key Required</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Add your OpenAI API key via the <span className="font-semibold">API Key</span> button in the navbar to use AI enhancement.
            </p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Quick suggestions</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(s => (
            <button key={s} type="button" onClick={() => setPrompt(s)} disabled={!hasByok}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400 hover:text-violet-700 dark:hover:text-violet-400 transition disabled:opacity-40 disabled:cursor-not-allowed">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt input */}
      <div>
        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Your enhancement instructions</label>
        <textarea
          className={`${area} ${!hasByok ? 'opacity-50 cursor-not-allowed' : ''}`}
          rows={4}
          value={prompt}
          disabled={!hasByok}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Improve my professional summary to be more concise and impact-focused. Make bullet points more quantitative with metrics where possible..."
        />
      </div>

      {/* Status messages */}
      {status === 'loading' && (
        <div className="flex items-center gap-2 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
          <Loader2 className="w-4 h-4 text-violet-600 animate-spin shrink-0" />
          <div>
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Enhancing your CV…</p>
            <p className="text-xs text-violet-600 dark:text-violet-400">{charCount.toLocaleString()} characters processed</p>
          </div>
        </div>
      )}
      {status === 'done' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">CV enhanced successfully!</p>
            <p className="text-xs text-green-600 dark:text-green-400">Preview updated — switch to Edit tab to make further changes</p>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{errorMsg || 'Something went wrong. Please try again.'}</p>
        </div>
      )}

      {/* Enhance button */}
      <button
        type="button"
        onClick={enhance}
        disabled={!hasByok || !prompt.trim() || status === 'loading'}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition text-sm"
      >
        {status === 'loading'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enhancing…</>
          : <><Sparkles className="w-4 h-4" /> Enhance with AI</>
        }
      </button>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        AI applies only the changes you describe — your original content is preserved
      </p>
    </div>
  );
}

/* ─── Main EnhanceEditor ──────────────────────────────────── */
export function EnhanceEditor({
  initialData,
  onBack,
}: {
  initialData: CVData;
  onBack: () => void;
}) {
  const [template, setTemplate] = useState<TemplateId>('modern');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [rightTab, setRightTab] = useState<'ai' | 'edit'>('ai');
  const [hasByok, setHasByok] = useState(false);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);

  // Form state — initialized from parsed CV
  const [name,       setName]       = useState(initialData.contactSection.name);
  const [email,      setEmail]      = useState(initialData.contactSection.email);
  const [phone,      setPhone]      = useState(initialData.contactSection.phone);
  const [location,   setLocation]   = useState(initialData.contactSection.location || '');
  const [linkedin,   setLinkedin]   = useState(initialData.contactSection.linkedin || '');
  const [github,     setGithub]     = useState(initialData.contactSection.github || '');
  const [portfolio,  setPortfolio]  = useState(initialData.contactSection.portfolio || '');
  const [summary,    setSummary]    = useState(initialData.professionalSummary);
  const [work,       setWork]       = useState<WItem[]>(() => initialData.workExperience.map(fromWork));
  const [edu,        setEdu]        = useState<EItem[]>(() => initialData.education.map(fromEdu));
  const [tech,       setTech]       = useState<string[]>(initialData.skills.technical);
  const [soft,       setSoft]       = useState<string[]>(initialData.skills.soft);
  const [langs,      setLangs]      = useState<string[]>(initialData.skills.languages || []);
  const [projs,      setProjs]      = useState<PItem[]>(() => (initialData.projects || []).map(fromProj));
  const [certs,      setCerts]      = useState<string[]>(initialData.certifications || []);
  const [achievements, setAchievements] = useState<string[]>(initialData.achievements || []);

  const [openSec, setOpenSec] = useState<Record<string, boolean>>({
    contact: true, summary: true, work: true, edu: true,
    skills: true, projects: false, certs: false, achievements: false,
  });
  const tog = (k: string) => setOpenSec(o => ({ ...o, [k]: !o[k] }));

  useEffect(() => {
    fetch('/api/byok/status').then(r => r.json()).then(d => setHasByok(!!d.hasByok)).catch(() => {});
  }, []);

  const cvData: CVData = useMemo(() => ({
    contactSection: { name, email, phone, location, linkedin, github, portfolio },
    professionalSummary: summary,
    workExperience: work.map(({ _id, current, ...w }) => ({ ...w, endDate: current ? 'Present' : w.endDate })),
    skills: { technical: tech, soft, languages: langs },
    education: edu.map(({ _id, ...e }) => e),
    certifications: certs.filter(Boolean),
    projects: projs.map(({ _id, ...p }) => p),
    achievements: achievements.filter(Boolean),
  }), [name, email, phone, location, linkedin, github, portfolio, summary, work, edu, tech, soft, langs, projs, certs, achievements]);

  const applyEnhanced = (enhanced: CVData) => {
    setName(enhanced.contactSection.name);
    setEmail(enhanced.contactSection.email);
    setPhone(enhanced.contactSection.phone);
    setLocation(enhanced.contactSection.location || '');
    setLinkedin(enhanced.contactSection.linkedin || '');
    setGithub(enhanced.contactSection.github || '');
    setPortfolio(enhanced.contactSection.portfolio || '');
    setSummary(enhanced.professionalSummary);
    setWork(enhanced.workExperience.map(fromWork));
    setEdu(enhanced.education.map(fromEdu));
    setTech(enhanced.skills.technical);
    setSoft(enhanced.skills.soft);
    setLangs(enhanced.skills.languages || []);
    setProjs((enhanced.projects || []).map(fromProj));
    setCerts(enhanced.certifications || []);
    setAchievements(enhanced.achievements || []);
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setDownloading(format);
    await downloadCV(cvData, template, format, name || 'enhanced-cv');
    setDownloading(null);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-64px)] -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── Left: Live Preview ── */}
      <div className={`lg:w-[44%] lg:flex lg:flex-col border-r border-slate-200 dark:border-slate-700 ${mobileTab === 'preview' ? 'flex flex-col' : 'hidden lg:flex'}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Upload another
          </button>
          <div className="flex gap-1">
            {(Object.keys(TEMPLATES) as Exclude<TemplateId, 'custom'>[]).map(id => (
              <button key={id} type="button" onClick={() => setTemplate(id)}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg border transition-colors ${
                  template === id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                }`}>
                {TEMPLATES[id].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-3">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden min-h-[1000px] origin-top" style={{ fontSize: '75%' }}>
            <CVPreview cvData={cvData} template={template} />
          </div>
        </div>

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

      {/* ── Right: AI Enhance + Form tabs ── */}
      <div className={`lg:flex-1 lg:flex lg:flex-col ${mobileTab === 'edit' ? 'flex flex-col' : 'hidden lg:flex'}`}>
        {/* Tab header */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
          <button type="button" onClick={() => setRightTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              rightTab === 'ai'
                ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
            <Wand2 className="w-3.5 h-3.5" /> AI Enhance
          </button>
          <button type="button" onClick={() => setRightTab('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              rightTab === 'edit'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
            <PenLine className="w-3.5 h-3.5" /> Edit Manually
          </button>
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{template !== 'custom' ? TEMPLATES[template].label : 'Custom'} template</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {rightTab === 'ai' ? (
            /* ── AI Enhance tab ── */
            <div className="max-w-2xl mx-auto px-4 py-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  Enhance with AI
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Describe what you want to improve. AI will apply only those changes and keep everything else intact.
                </p>
              </div>
              <div className="card p-5">
                <AIEnhancePanel
                  cvData={cvData}
                  hasByok={hasByok}
                  onEnhanced={(enhanced) => {
                    applyEnhanced(enhanced);
                    setRightTab('edit');
                  }}
                />
              </div>

              {/* CV snapshot */}
              <div className="mt-4 card p-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Parsed CV Snapshot</p>
                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {name && <p><span className="font-medium">Name:</span> {name}</p>}
                  {email && <p><span className="font-medium">Email:</span> {email}</p>}
                  {work.length > 0 && <p><span className="font-medium">Experience:</span> {work.length} position{work.length > 1 ? 's' : ''} — latest: {work[0].title} @ {work[0].company}</p>}
                  {edu.length > 0 && <p><span className="font-medium">Education:</span> {edu[0].degree}{edu[0].field ? ` in ${edu[0].field}` : ''} — {edu[0].school}</p>}
                  {tech.length > 0 && <p><span className="font-medium">Skills:</span> {tech.slice(0, 8).join(', ')}{tech.length > 8 ? ` +${tech.length - 8} more` : ''}</p>}
                </div>
              </div>
            </div>
          ) : (
            /* ── Manual Edit tab ── */
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-1">

              {/* Contact */}
              <div className="card p-4">
                <SecHead title="Contact Information" open={openSec.contact} onToggle={() => tog('contact')} />
                {openSec.contact && (
                  <div className="pt-3 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <FL label="Full Name *"><input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Syed Hassan Ali" /></FL>
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

              {/* Summary */}
              <div className="card p-4">
                <SecHead title="Professional Summary" open={openSec.summary} onToggle={() => tog('summary')} />
                {openSec.summary && (
                  <div className="pt-3">
                    <textarea className={area} rows={5} value={summary} onChange={e => setSummary(e.target.value)}
                      placeholder="Results-driven software engineer with 3+ years building scalable systems..." />
                  </div>
                )}
              </div>

              {/* Work Experience */}
              <div className="card p-4">
                <SecHead title="Work Experience" open={openSec.work} onToggle={() => tog('work')}
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
                        <p className="text-sm text-slate-400 mb-2">No work experience</p>
                        <button type="button" onClick={() => setWork([emptyWork()])} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Add position</button>
                      </div>
                    )}
                    {work.map(item => (
                      <WorkForm key={item._id} item={item}
                        onChange={u => setWork(w => w.map(x => x._id === u._id ? u : x))}
                        onRemove={() => setWork(w => w.filter(x => x._id !== item._id))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="card p-4">
                <SecHead title="Education" open={openSec.edu} onToggle={() => tog('edu')}
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
                        onChange={u => setEdu(e => e.map(x => x._id === u._id ? u : x))}
                        onRemove={() => setEdu(e => e.filter(x => x._id !== item._id))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="card p-4">
                <SecHead title="Skills" open={openSec.skills} onToggle={() => tog('skills')} />
                {openSec.skills && (
                  <div className="pt-3 space-y-4">
                    <FL label="Technical Skills"><TagInput tags={tech} onChange={setTech} placeholder="Python, React, AWS..." /></FL>
                    <FL label="Soft Skills"><TagInput tags={soft} onChange={setSoft} placeholder="Leadership, Communication..." /></FL>
                    <FL label="Languages"><TagInput tags={langs} onChange={setLangs} placeholder="English, Urdu..." /></FL>
                  </div>
                )}
              </div>

              {/* Projects */}
              <div className="card p-4">
                <SecHead title="Projects" open={openSec.projects} onToggle={() => tog('projects')}
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
                        onChange={u => setProjs(p => p.map(x => x._id === u._id ? u : x))}
                        onRemove={() => setProjs(p => p.filter(x => x._id !== item._id))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications */}
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

              {/* Achievements */}
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

              {/* Mobile download */}
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
          )}
        </div>
      </div>

      {/* Mobile tab bar */}
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
