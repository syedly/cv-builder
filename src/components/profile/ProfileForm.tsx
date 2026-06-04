'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase,
  GraduationCap, Code2, FolderGit2, Award, Plus, Trash2, Save,
  Upload, Loader2, CheckCircle, X, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
interface WorkExp {
  id: string; company: string; title: string;
  startDate: string; endDate: string; current: boolean;
  location: string; bullets: string[];
}
interface Education {
  id: string; degree: string; field: string; school: string;
  startYear: string; graduationYear: string; gpa: string; honors: string;
}
interface Project {
  id: string; name: string; description: string;
  technologies: string[]; github: string; link: string; highlights: string[];
}
interface Certification {
  id: string; name: string; issuer: string;
  year: string; credentialId: string; link: string;
}
interface Profile {
  fullName: string; email: string; phone: string; location: string;
  linkedin: string; github: string; portfolio: string; website: string;
  desiredTitle: string; summary: string;
  workExperience: WorkExp[]; education: Education[];
  technicalSkills: string[]; softSkills: string[]; languages: string[];
  projects: Project[]; certifications: Certification[]; achievements: string[];
}

interface CompletenessItem {
  label: string; section: string; done: boolean; weight: number;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyWork = (): WorkExp => ({
  id: uid(), company: '', title: '', startDate: '', endDate: '',
  current: false, location: '', bullets: ['', '', ''],
});
const emptyEdu = (): Education => ({
  id: uid(), degree: '', field: '', school: '',
  startYear: '', graduationYear: '', gpa: '', honors: '',
});
const emptyProject = (): Project => ({
  id: uid(), name: '', description: '', technologies: [],
  github: '', link: '', highlights: [''],
});
const emptyCert = (): Certification => ({
  id: uid(), name: '', issuer: '', year: '', credentialId: '', link: '',
});
const defaultProfile = (): Profile => ({
  fullName: '', email: '', phone: '', location: '',
  linkedin: '', github: '', portfolio: '', website: '',
  desiredTitle: '', summary: '',
  workExperience: [], education: [],
  technicalSkills: [], softSkills: [], languages: [],
  projects: [], certifications: [], achievements: [],
});

function getCompleteness(p: Profile): CompletenessItem[] {
  return [
    { label: 'Full name', section: 'Personal Info', done: !!p.fullName.trim(), weight: 8 },
    { label: 'Email address', section: 'Personal Info', done: !!p.email.trim(), weight: 6 },
    { label: 'Phone number', section: 'Personal Info', done: !!p.phone.trim(), weight: 6 },
    { label: 'Location', section: 'Personal Info', done: !!p.location.trim(), weight: 4 },
    { label: 'Desired job title', section: 'Personal Info', done: !!p.desiredTitle.trim(), weight: 6 },
    { label: 'LinkedIn profile', section: 'Personal Info', done: !!p.linkedin.trim(), weight: 5 },
    { label: 'GitHub profile', section: 'Personal Info', done: !!p.github.trim(), weight: 5 },
    { label: 'Portfolio / website', section: 'Personal Info', done: !!p.portfolio.trim(), weight: 4 },
    {
      label: 'At least 1 work experience with bullet points',
      section: 'Work Experience',
      done: p.workExperience.length > 0 && p.workExperience.some(j => j.company && j.title && j.bullets.filter(Boolean).length > 0),
      weight: 20,
    },
    {
      label: 'Education (degree + school)',
      section: 'Education',
      done: p.education.length > 0 && p.education.some(e => e.school && e.degree),
      weight: 10,
    },
    { label: 'At least 5 technical skills', section: 'Skills', done: p.technicalSkills.length >= 5, weight: 10 },
    { label: 'At least 2 soft skills', section: 'Skills', done: p.softSkills.length >= 2, weight: 5 },
    { label: 'Languages spoken', section: 'Skills', done: p.languages.length > 0, weight: 2 },
    {
      label: 'At least 1 project with description',
      section: 'Projects',
      done: p.projects.length > 0 && p.projects.some(pr => pr.name && pr.description),
      weight: 9,
    },
  ];
}

/* ─── Completeness Modal ─────────────────────────────────────── */
function CompletenessModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const items = getCompleteness(profile);
  const total = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.filter(i => i.done).reduce((s, i) => s + i.weight, 0);
  const pct = Math.round((earned / total) * 100);
  const missing = items.filter(i => !i.done);

  const sections = Array.from(new Set(missing.map(i => i.section)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profile Completeness</h2>
              <p className="text-sm text-slate-500 mt-0.5">Fill in missing details for the best CV results</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Profile strength</span>
              <span className={`text-sm font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {pct === 100 ? '🎉 Perfect! Your profile is complete.' : pct >= 80 ? 'Almost there — a few more details will make your CV shine.' : 'Complete your profile to generate a highly targeted CV.'}
            </p>
          </div>

          {missing.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">Your profile is 100% complete!</p>
              <p className="text-sm text-slate-500 mt-1">The AI has everything it needs to generate a perfect CV.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">{missing.length} item{missing.length !== 1 ? 's' : ''} remaining:</p>
              {sections.map(section => (
                <div key={section}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{section}</p>
                  <div className="space-y-1.5">
                    {missing.filter(i => i.section === section).map(item => (
                      <div key={item.label} className="flex items-center gap-2.5 p-2.5 bg-red-50 border border-red-100 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <span className="ml-auto text-xs font-medium text-red-400">+{item.weight}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-2xl hover:bg-blue-700 transition"
          >
            Continue editing
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helpers ──────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white placeholder:text-slate-300 transition';
const textareaCls = `${inputCls} resize-none`;

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          className={inputCls}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button type="button" onClick={add} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 shrink-0">
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Collapsible row header (div, not button — avoids nested button) ── */
function CollapseHeader({
  label, open, onToggle, onRemove,
}: { label: string; open: boolean; onToggle: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition cursor-pointer select-none" onClick={onToggle}>
      <span className="font-medium text-slate-800 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="text-red-400 hover:text-red-600 p-1"
          aria-label="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>
    </div>
  );
}

/* ─── Work Experience Item ───────────────────────────────────── */
function WorkItem({ job, onChange, onRemove }: { job: WorkExp; onChange: (j: WorkExp) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const set = (k: keyof WorkExp, v: unknown) => onChange({ ...job, [k]: v });
  const label = `${job.title || 'New Position'}${job.company ? ` @ ${job.company}` : ''}`;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <CollapseHeader label={label} open={open} onToggle={() => setOpen(!open)} onRemove={onRemove} />
      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company"><input className={inputCls} value={job.company} onChange={e => set('company', e.target.value)} placeholder="Google" /></Field>
            <Field label="Job Title"><input className={inputCls} value={job.title} onChange={e => set('title', e.target.value)} placeholder="Software Engineer" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Start Date"><input className={inputCls} value={job.startDate} onChange={e => set('startDate', e.target.value)} placeholder="01/2022" /></Field>
            <Field label="End Date">
              <input className={inputCls} value={job.current ? 'Present' : job.endDate} disabled={job.current} onChange={e => set('endDate', e.target.value)} placeholder="12/2024" />
            </Field>
            <Field label="Location"><input className={inputCls} value={job.location} onChange={e => set('location', e.target.value)} placeholder="Remote" /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={job.current} onChange={e => set('current', e.target.checked)} className="rounded" />
            Currently working here
          </label>
          <Field label="Key Achievements / Bullets (action verb + metric)">
            <div className="space-y-1.5">
              {job.bullets.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={inputCls}
                    value={b}
                    onChange={e => { const nb = [...job.bullets]; nb[i] = e.target.value; set('bullets', nb); }}
                    placeholder="Led migration to microservices, reducing latency by 40%"
                  />
                  {job.bullets.length > 1 && (
                    <button type="button" onClick={() => set('bullets', job.bullets.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {job.bullets.length < 6 && (
                <button type="button" onClick={() => set('bullets', [...job.bullets, ''])} className="text-blue-600 text-xs hover:text-blue-700 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add bullet
                </button>
              )}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

/* ─── Education Item ─────────────────────────────────────────── */
function EduItem({ edu, onChange, onRemove }: { edu: Education; onChange: (e: Education) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const set = (k: keyof Education, v: string) => onChange({ ...edu, [k]: v });
  const label = `${edu.degree || 'New Degree'}${edu.school ? ` — ${edu.school}` : ''}`;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <CollapseHeader label={label} open={open} onToggle={() => setOpen(!open)} onRemove={onRemove} />
      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Degree"><input className={inputCls} value={edu.degree} onChange={e => set('degree', e.target.value)} placeholder="Bachelor of Science" /></Field>
            <Field label="Field of Study"><input className={inputCls} value={edu.field} onChange={e => set('field', e.target.value)} placeholder="Computer Science" /></Field>
          </div>
          <Field label="School / University"><input className={inputCls} value={edu.school} onChange={e => set('school', e.target.value)} placeholder="MIT" /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Start Year"><input className={inputCls} value={edu.startYear} onChange={e => set('startYear', e.target.value)} placeholder="2020" /></Field>
            <Field label="Graduation Year"><input className={inputCls} value={edu.graduationYear} onChange={e => set('graduationYear', e.target.value)} placeholder="2024" /></Field>
            <Field label="GPA (optional)"><input className={inputCls} value={edu.gpa} onChange={e => set('gpa', e.target.value)} placeholder="3.8" /></Field>
          </div>
          <Field label="Honors / Awards (optional)"><input className={inputCls} value={edu.honors} onChange={e => set('honors', e.target.value)} placeholder="Summa Cum Laude, Dean's List" /></Field>
        </div>
      )}
    </div>
  );
}

/* ─── Project Item ───────────────────────────────────────────── */
function ProjectItem({ proj, onChange, onRemove }: { proj: Project; onChange: (p: Project) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const set = (k: keyof Project, v: unknown) => onChange({ ...proj, [k]: v });

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <CollapseHeader label={proj.name || 'New Project'} open={open} onToggle={() => setOpen(!open)} onRemove={onRemove} />
      {open && (
        <div className="p-4 space-y-3">
          <Field label="Project Name"><input className={inputCls} value={proj.name} onChange={e => set('name', e.target.value)} placeholder="AI CV Builder" /></Field>
          <Field label="Description (what it does + impact)">
            <textarea className={textareaCls} rows={2} value={proj.description} onChange={e => set('description', e.target.value)} placeholder="Next.js + GPT-4o system that generates ATS-optimized CVs, serving 500+ users..." />
          </Field>
          <Field label="Technologies Used">
            <TagInput tags={proj.technologies} onChange={v => set('technologies', v)} placeholder="Next.js, TypeScript..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub Link"><input className={inputCls} value={proj.github} onChange={e => set('github', e.target.value)} placeholder="github.com/username/repo" /></Field>
            <Field label="Live Demo Link"><input className={inputCls} value={proj.link} onChange={e => set('link', e.target.value)} placeholder="myproject.com" /></Field>
          </div>
          <Field label="Key Highlights (metrics, achievements)">
            <div className="space-y-1.5">
              {proj.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} value={h} onChange={e => { const nh = [...proj.highlights]; nh[i] = e.target.value; set('highlights', nh); }} placeholder="Reduced load time by 60% using Redis caching" />
                  {proj.highlights.length > 1 && (
                    <button type="button" onClick={() => set('highlights', proj.highlights.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {proj.highlights.length < 4 && (
                <button type="button" onClick={() => set('highlights', [...proj.highlights, ''])} className="text-blue-600 text-xs hover:text-blue-700 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add highlight
                </button>
              )}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

/* ─── Cert Item ──────────────────────────────────────────────── */
function CertItem({ cert, onChange, onRemove }: { cert: Certification; onChange: (c: Certification) => void; onRemove: () => void }) {
  const set = (k: keyof Certification, v: string) => onChange({ ...cert, [k]: v });
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-700">{cert.name || 'New Certification'}</span>
        <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Certification Name"><input className={inputCls} value={cert.name} onChange={e => set('name', e.target.value)} placeholder="AWS Solutions Architect" /></Field>
        <Field label="Issuing Organization"><input className={inputCls} value={cert.issuer} onChange={e => set('issuer', e.target.value)} placeholder="Amazon Web Services" /></Field>
        <Field label="Year"><input className={inputCls} value={cert.year} onChange={e => set('year', e.target.value)} placeholder="2024" /></Field>
        <Field label="Credential ID (optional)"><input className={inputCls} value={cert.credentialId} onChange={e => set('credentialId', e.target.value)} placeholder="ABC-123456" /></Field>
        <div className="col-span-2">
          <Field label="Verification URL (optional)"><input className={inputCls} value={cert.link} onChange={e => set('link', e.target.value)} placeholder="https://..." /></Field>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Progress Bar ───────────────────────────────────── */
function ProfileProgressBar({ profile, onViewDetails }: { profile: Profile; onViewDetails: () => void }) {
  const items = getCompleteness(profile);
  const total = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.filter(i => i.done).reduce((s, i) => s + i.weight, 0);
  const pct = Math.round((earned / total) * 100);
  const missing = items.filter(i => !i.done).length;

  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct >= 80 ? 'text-green-700' : pct >= 50 ? 'text-amber-700' : 'text-red-600';
  const bgCard = pct >= 80 ? 'bg-green-50 border-green-100' : pct >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100';

  return (
    <div className={`card p-4 border ${bgCard}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className={`text-sm font-bold ${textColor}`}>Profile {pct}% complete</span>
          {missing > 0 && <span className="text-xs text-slate-500 ml-2">— {missing} item{missing !== 1 ? 's' : ''} missing</span>}
        </div>
        <button
          type="button"
          onClick={onViewDetails}
          className={`text-xs font-semibold ${textColor} underline underline-offset-2 hover:opacity-70 transition`}
        >
          {pct === 100 ? 'View checklist' : 'What\'s missing?'}
        </button>
      </div>
      <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-white/40">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {pct < 100 && (
        <p className="text-xs text-slate-500 mt-1.5">
          {pct < 50 ? 'Fill in the basics to unlock high-quality CV generation.' : 'Almost there — add more details for a more targeted CV.'}
        </p>
      )}
    </div>
  );
}

/* ─── Main ProfileForm ───────────────────────────────────────── */
export function ProfileForm() {
  const [profile, setProfile] = useState<Profile>(defaultProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setProfile({ ...defaultProfile(), ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof Profile, v: unknown) => setProfile(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/profile/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setImportError(data.error || 'Import failed'); return; }
      setProfile(p => ({ ...p, ...data }));
    } catch {
      setImportError('Import failed. Please try again.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {showModal && <CompletenessModal profile={profile} onClose={() => setShowModal(false)} />}

      <div className="space-y-6">
        {/* Progress Bar */}
        <ProfileProgressBar profile={profile} onViewDetails={() => setShowModal(true)} />

        {/* Import CV Banner */}
        <div className="card p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Auto-fill from your existing CV</h3>
              <p className="text-xs text-slate-500 mt-0.5">Upload a PDF or DOCX and we&apos;ll extract all your details automatically</p>
              {importError && <p className="text-xs text-red-600 mt-1">{importError}</p>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleImport} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-60 transition whitespace-nowrap"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importing ? 'Importing...' : 'Import CV'}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="card p-6">
          <SectionHeader icon={User} title="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name"><input className={inputCls} value={profile.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Syed Hassan Ali" /></Field>
            <Field label="Desired Job Title"><input className={inputCls} value={profile.desiredTitle} onChange={e => set('desiredTitle', e.target.value)} placeholder="Senior Software Engineer" /></Field>
            <Field label="Email Address">
              <div className="relative"><Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" /><input className={`${inputCls} pl-8`} value={profile.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" /></div>
            </Field>
            <Field label="Phone Number">
              <div className="relative"><Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" /><input className={`${inputCls} pl-8`} value={profile.phone} onChange={e => set('phone', e.target.value)} placeholder="+92-315-0000000" /></div>
            </Field>
            <Field label="Location (City, Country)">
              <div className="relative"><MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" /><input className={`${inputCls} pl-8`} value={profile.location} onChange={e => set('location', e.target.value)} placeholder="Lahore, Pakistan" /></div>
            </Field>
            <Field label="LinkedIn URL">
              <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" /><input className={`${inputCls} pl-8`} value={profile.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/username" /></div>
            </Field>
            <Field label="GitHub URL">
              <div className="relative"><Github className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" /><input className={`${inputCls} pl-8`} value={profile.github} onChange={e => set('github', e.target.value)} placeholder="github.com/username" /></div>
            </Field>
            <Field label="Portfolio / Website">
              <div className="relative"><Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" /><input className={`${inputCls} pl-8`} value={profile.portfolio} onChange={e => set('portfolio', e.target.value)} placeholder="myportfolio.dev" /></div>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Professional Summary (optional — AI will craft one if left blank)">
              <textarea className={textareaCls} rows={3} value={profile.summary} onChange={e => set('summary', e.target.value)} placeholder="Results-driven engineer with 3+ years building scalable systems..." />
            </Field>
          </div>
        </div>

        {/* Work Experience */}
        <div className="card p-6">
          <SectionHeader icon={Briefcase} title="Work Experience">
            <button type="button" onClick={() => set('workExperience', [...profile.workExperience, emptyWork()])} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4" /> Add Position
            </button>
          </SectionHeader>
          {profile.workExperience.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No work experience added yet</p>
              <button type="button" onClick={() => set('workExperience', [emptyWork()])} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">Add your first position</button>
            </div>
          )}
          <div className="space-y-3">
            {profile.workExperience.map(job => (
              <WorkItem key={job.id} job={job}
                onChange={j => set('workExperience', profile.workExperience.map(x => x.id === j.id ? j : x))}
                onRemove={() => set('workExperience', profile.workExperience.filter(x => x.id !== job.id))}
              />
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="card p-6">
          <SectionHeader icon={GraduationCap} title="Education">
            <button type="button" onClick={() => set('education', [...profile.education, emptyEdu()])} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </SectionHeader>
          {profile.education.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No education added yet</p>
              <button type="button" onClick={() => set('education', [emptyEdu()])} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">Add your degree</button>
            </div>
          )}
          <div className="space-y-3">
            {profile.education.map(edu => (
              <EduItem key={edu.id} edu={edu}
                onChange={e => set('education', profile.education.map(x => x.id === e.id ? e : x))}
                onRemove={() => set('education', profile.education.filter(x => x.id !== edu.id))}
              />
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="card p-6">
          <SectionHeader icon={Code2} title="Skills" />
          <div className="space-y-5">
            <Field label="Technical Skills (press Enter or click Add after each skill)">
              <TagInput tags={profile.technicalSkills} onChange={v => set('technicalSkills', v)} placeholder="Python, React, AWS..." />
            </Field>
            <Field label="Soft Skills">
              <TagInput tags={profile.softSkills} onChange={v => set('softSkills', v)} placeholder="Leadership, Communication..." />
            </Field>
            <Field label="Languages">
              <TagInput tags={profile.languages} onChange={v => set('languages', v)} placeholder="English, Urdu..." />
            </Field>
          </div>
        </div>

        {/* Projects */}
        <div className="card p-6">
          <SectionHeader icon={FolderGit2} title="Projects">
            <button type="button" onClick={() => set('projects', [...profile.projects, emptyProject()])} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </SectionHeader>
          {profile.projects.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
              <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No projects added yet</p>
              <button type="button" onClick={() => set('projects', [emptyProject()])} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">Add your first project</button>
            </div>
          )}
          <div className="space-y-3">
            {profile.projects.map(proj => (
              <ProjectItem key={proj.id} proj={proj}
                onChange={p => set('projects', profile.projects.map(x => x.id === p.id ? p : x))}
                onRemove={() => set('projects', profile.projects.filter(x => x.id !== proj.id))}
              />
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="card p-6">
          <SectionHeader icon={Award} title="Certifications">
            <button type="button" onClick={() => set('certifications', [...profile.certifications, emptyCert()])} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4" /> Add Certificate
            </button>
          </SectionHeader>
          {profile.certifications.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No certifications added yet</p>
            </div>
          )}
          <div className="space-y-3">
            {profile.certifications.map(cert => (
              <CertItem key={cert.id} cert={cert}
                onChange={c => set('certifications', profile.certifications.map(x => x.id === c.id ? c : x))}
                onRemove={() => set('certifications', profile.certifications.filter(x => x.id !== cert.id))}
              />
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="card p-6">
          <SectionHeader icon={Award} title="Achievements & Awards" />
          <div className="space-y-1.5">
            {(profile.achievements.length === 0 ? [''] : profile.achievements).map((ach, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputCls}
                  value={ach}
                  onChange={e => { const na = [...profile.achievements]; na[i] = e.target.value; set('achievements', na); }}
                  placeholder="Dean's List 2023, Hackathon Winner..."
                />
                {profile.achievements.length > 0 && (
                  <button type="button" onClick={() => set('achievements', profile.achievements.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => set('achievements', [...profile.achievements, ''])} className="text-blue-600 text-xs hover:text-blue-700 flex items-center gap-1 mt-1">
              <Plus className="w-3 h-3" /> Add achievement
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </>
  );
}
