'use client';

import { useState, useCallback } from 'react';
import { X, Save, Loader2, Trash2, Check, Palette, Image } from 'lucide-react';
import { CVPreview } from '@/components/cv/CVPreview';
import { CustomTheme, SavedTheme, CVData } from '@/components/cv/templates/types';

/* ─── preset palettes ──────────────────────────────────────── */
const PRESETS = [
  { label: 'Ocean Blue',  primary: '#1a44b3', accent: '#2563eb' },
  { label: 'Forest',      primary: '#14532d', accent: '#16a34a' },
  { label: 'Crimson',     primary: '#7f1d1d', accent: '#dc2626' },
  { label: 'Violet',      primary: '#4c1d95', accent: '#7c3aed' },
  { label: 'Midnight',    primary: '#0c4a6e', accent: '#0284c7' },
  { label: 'Slate',       primary: '#1e293b', accent: '#475569' },
  { label: 'Amber',       primary: '#78350f', accent: '#d97706' },
  { label: 'Rose',        primary: '#881337', accent: '#e11d48' },
  { label: 'Teal',        primary: '#134e4a', accent: '#0d9488' },
  { label: 'Onyx',        primary: '#111827', accent: '#374151' },
  { label: 'Burgundy',    primary: '#500724', accent: '#9f1239' },
  { label: 'Royal',       primary: '#1e1b4b', accent: '#4338ca' },
];

const DEFAULT_THEME: CustomTheme = {
  primaryColor: '#1a44b3',
  accentColor: '#2563eb',
  fontFamily: 'sans',
  layout: 'standard',
  sidebarColor: '#1e293b',
  headerStyle: 'lines',
  sectionStyle: 'plain',
  cornerRadius: 'small',
  skillStyle: 'tags',
  nameSize: 'normal',
  spacing: 'normal',
  bulletChar: '•',
  showDividers: true,
  showProfileImage: false,
  profileImageUrl: '',
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function RadioPills<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              value === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-400'
            }`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ThemeDesignerProps {
  cvData: CVData;
  initialTheme?: SavedTheme | null;
  savedThemes: SavedTheme[];
  onApply: (theme: CustomTheme) => void;
  onSaved: (theme: SavedTheme) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}

export function ThemeDesigner({ cvData, initialTheme, savedThemes, onApply, onSaved, onDeleted, onClose }: ThemeDesignerProps) {
  const [theme, setTheme] = useState<CustomTheme>(initialTheme ?? DEFAULT_THEME);
  const [themeName, setThemeName] = useState(initialTheme?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const upd = useCallback(<K extends keyof CustomTheme>(k: K, v: CustomTheme[K]) => {
    setTheme(t => ({ ...t, [k]: v }));
    setSelectedPreset(null);
  }, []);

  const applyPreset = (p: typeof PRESETS[0]) => {
    setTheme(t => ({ ...t, primaryColor: p.primary, accentColor: p.accent, sidebarColor: p.primary }));
    setSelectedPreset(p.label);
  };

  const handleSave = async () => {
    if (!themeName.trim()) { setSavedMsg('Please enter a theme name'); return; }
    setSaving(true); setSavedMsg('');
    try {
      const url = initialTheme ? `/api/themes/${initialTheme._id}` : '/api/themes';
      const method = initialTheme ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...theme, name: themeName.trim() }) });
      const data = await res.json();
      if (!res.ok) { setSavedMsg(data.error || 'Failed to save'); return; }
      onSaved({ ...data.theme });
      setSavedMsg('Theme saved!');
    } catch { setSavedMsg('Network error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await fetch(`/api/themes/${id}`, { method: 'DELETE' }); onDeleted(id); } catch {}
    setDeleting(null);
  };

  const isSidebar = theme.layout === 'sidebar-left' || theme.layout === 'sidebar-right';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Design Your CV Format</h2>
          <span className="text-[10px] font-medium px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full">Canva-style</span>
        </div>
        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ══ Controls panel ══════════════════════════════════════ */}
        <div className="w-80 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="p-4 space-y-5">

            {/* Saved themes */}
            {savedThemes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Your Saved Themes</p>
                <div className="space-y-1.5">
                  {savedThemes.map(t => (
                    <div key={t._id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded" style={{ background: t.primaryColor }} />
                        <div className="w-4 h-4 rounded" style={{ background: t.accentColor }} />
                      </div>
                      <button type="button" onClick={() => { setTheme(t); setThemeName(t.name); setSelectedPreset(null); }}
                        className="flex-1 text-left text-xs font-medium text-slate-700 dark:text-slate-300 truncate hover:text-blue-600 transition">
                        {t.name}
                      </button>
                      <button type="button" onClick={() => handleDelete(t._id)} disabled={deleting === t._id}
                        className="p-1 text-slate-300 hover:text-red-500 transition shrink-0">
                        {deleting === t._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
                <hr className="my-3 border-slate-200 dark:border-slate-700" />
              </div>
            )}

            {/* ── LAYOUT ── */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Layout</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'standard',      label: 'Standard' },
                  { value: 'sidebar-left',  label: 'Left Bar' },
                  { value: 'sidebar-right', label: 'Right Bar' },
                ] as const).map(opt => (
                  <button key={opt.value} type="button" onClick={() => upd('layout', opt.value)}
                    className={`p-1.5 rounded-xl border-2 transition-all text-center ${
                      (theme.layout ?? 'standard') === opt.value
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}>
                    {/* mini layout preview */}
                    <div className="w-full h-10 rounded overflow-hidden mb-1 bg-white">
                      {opt.value === 'standard' && (
                        <div className="w-full h-full flex flex-col gap-0.5 p-1">
                          <div className="h-2 w-full rounded" style={{ background: theme.primaryColor }} />
                          <div className="h-1 w-4/5 bg-slate-100 rounded" />
                          <div className="h-1 w-full bg-slate-100 rounded" />
                          <div className="h-1 w-3/4 bg-slate-100 rounded" />
                        </div>
                      )}
                      {opt.value === 'sidebar-left' && (
                        <div className="w-full h-full flex">
                          <div className="w-[35%] h-full p-0.5" style={{ background: theme.sidebarColor || theme.primaryColor }}>
                            <div className="w-4 h-4 rounded-full mx-auto mt-0.5" style={{ background: 'rgba(255,255,255,0.3)' }} />
                          </div>
                          <div className="flex-1 p-1 flex flex-col gap-0.5">
                            <div className="h-1 w-full bg-slate-100 rounded" />
                            <div className="h-1 w-4/5 bg-slate-100 rounded" />
                            <div className="h-1 w-3/4 bg-slate-100 rounded" />
                          </div>
                        </div>
                      )}
                      {opt.value === 'sidebar-right' && (
                        <div className="w-full h-full flex flex-row-reverse">
                          <div className="w-[35%] h-full p-0.5" style={{ background: theme.sidebarColor || theme.primaryColor }}>
                            <div className="w-4 h-4 rounded-full mx-auto mt-0.5" style={{ background: 'rgba(255,255,255,0.3)' }} />
                          </div>
                          <div className="flex-1 p-1 flex flex-col gap-0.5">
                            <div className="h-1 w-full bg-slate-100 rounded" />
                            <div className="h-1 w-4/5 bg-slate-100 rounded" />
                            <div className="h-1 w-3/4 bg-slate-100 rounded" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-slate-600 dark:text-slate-400">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── COLOR PRESETS ── */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Color Presets</p>
              <div className="grid grid-cols-6 gap-1.5">
                {PRESETS.map(p => (
                  <button key={p.label} type="button" title={p.label} onClick={() => applyPreset(p)} className="relative group">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border-2 transition-all"
                         style={{ borderColor: selectedPreset === p.label ? p.primary : 'transparent' }}>
                      <div className="h-1/2" style={{ background: p.primary }} />
                      <div className="h-1/2" style={{ background: p.accent }} />
                    </div>
                    {selectedPreset === p.label && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── CUSTOM COLORS ── */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Custom Colors</p>
              <div className="space-y-2.5">
                {([
                  { key: 'primaryColor', label: 'Primary' },
                  { key: 'accentColor',  label: 'Accent'  },
                  ...(isSidebar ? [{ key: 'sidebarColor', label: 'Sidebar' }] : []),
                ] as { key: keyof CustomTheme; label: string }[]).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="text-xs text-slate-600 dark:text-slate-400 w-16 shrink-0">{label}</label>
                    <div className="flex items-center gap-2 flex-1">
                      <input type="color" value={(theme[key] as string) || '#000000'}
                        onChange={e => upd(key, e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer p-0.5 bg-white" />
                      <input type="text" value={(theme[key] as string) || ''}
                        onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && upd(key, e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── FONT ── */}
            <RadioPills label="Font Style" value={theme.fontFamily} onChange={v => upd('fontFamily', v)}
              options={[{ value: 'sans', label: 'Sans-serif' }, { value: 'serif', label: 'Serif' }]} />

            {/* ── NAME SIZE ── */}
            <RadioPills label="Name Size" value={theme.nameSize ?? 'normal'} onChange={v => upd('nameSize', v)}
              options={[{ value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' }, { value: 'xlarge', label: 'X-Large' }]} />

            {/* ── HEADER STYLE (standard only) ── */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Header Style</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'banner', label: 'Banner' },
                  { value: 'lines',  label: 'Lines'  },
                  { value: 'minimal',label: 'Minimal' },
                ] as const).map(opt => (
                  <button key={opt.value} type="button" onClick={() => upd('headerStyle', opt.value)}
                    className={`p-2 rounded-xl border-2 transition-all text-center ${
                      theme.headerStyle === opt.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}>
                    <div className="w-full h-8 rounded overflow-hidden mb-1.5">
                      {opt.value === 'banner' && (
                        <div className="w-full h-full flex flex-col justify-center px-1.5" style={{ background: theme.primaryColor }}>
                          <div className="w-10 h-1 rounded" style={{ background: 'rgba(255,255,255,0.9)' }} />
                          <div className="w-6 h-0.5 rounded mt-0.5" style={{ background: 'rgba(255,255,255,0.5)' }} />
                        </div>
                      )}
                      {opt.value === 'lines' && (
                        <div className="w-full h-full flex flex-col justify-center px-1.5 bg-white dark:bg-slate-800">
                          <div className="w-10 h-1 rounded mb-0.5" style={{ background: theme.primaryColor }} />
                          <div className="w-full h-0.5 rounded" style={{ background: theme.accentColor }} />
                          <div className="w-7 h-0.5 rounded mt-0.5 mx-auto" style={{ background: '#ccc' }} />
                          <div className="w-full h-0.5 rounded mt-0.5" style={{ background: theme.accentColor }} />
                        </div>
                      )}
                      {opt.value === 'minimal' && (
                        <div className="w-full h-full flex flex-col justify-center px-1.5 bg-white dark:bg-slate-800">
                          <div className="w-12 h-1 rounded mb-1" style={{ background: theme.primaryColor }} />
                          <div className="w-8 h-0.5 rounded" style={{ background: '#aaa' }} />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── SECTION CONTAINERS ── */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Section Container</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'plain',    label: 'Plain'   },
                  { value: 'boxed',    label: 'Boxed'   },
                  { value: 'shadowed', label: 'Card'    },
                ] as const).map(opt => (
                  <button key={opt.value} type="button" onClick={() => upd('sectionStyle', opt.value)}
                    className={`p-2 rounded-xl border-2 transition-all text-center ${
                      (theme.sectionStyle ?? 'plain') === opt.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}>
                    <div className="w-full h-9 rounded overflow-hidden mb-1 bg-white flex flex-col p-1">
                      {opt.value === 'plain' && <>
                        <div className="h-1.5 w-8 rounded mb-0.5" style={{ background: theme.accentColor }} />
                        <div className="h-1 w-full bg-slate-100 rounded" />
                        <div className="h-1 w-4/5 bg-slate-100 rounded mt-0.5" />
                      </>}
                      {opt.value === 'boxed' && (
                        <div className="flex-1 rounded flex flex-col p-0.5" style={{ border: `1.5px solid ${theme.accentColor}50`, borderTop: `2px solid ${theme.accentColor}` }}>
                          <div className="h-1 w-6 rounded mb-0.5" style={{ background: theme.primaryColor }} />
                          <div className="h-0.5 w-full bg-slate-100 rounded" />
                          <div className="h-0.5 w-4/5 bg-slate-100 rounded mt-0.5" />
                        </div>
                      )}
                      {opt.value === 'shadowed' && (
                        <div className="flex-1 rounded flex flex-col p-0.5 bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                          <div className="h-1 w-6 rounded mb-0.5" style={{ background: theme.primaryColor }} />
                          <div className="h-0.5 w-full bg-slate-100 rounded" />
                          <div className="h-0.5 w-4/5 bg-slate-100 rounded mt-0.5" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-slate-600 dark:text-slate-400">{opt.label}</span>
                  </button>
                ))}
              </div>
              {/* Corner radius — only for boxed / shadowed */}
              {(theme.sectionStyle === 'boxed' || theme.sectionStyle === 'shadowed') && (
                <div className="mt-3">
                  <RadioPills label="Corner Radius" value={theme.cornerRadius ?? 'small'} onChange={v => upd('cornerRadius', v)}
                    options={[{ value: 'none', label: 'Sharp' }, { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]} />
                </div>
              )}
            </div>

            {/* ── SKILL DISPLAY ── */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Skill Display</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'tags',         label: 'Tags'     },
                  { value: 'progress-bar', label: 'Progress' },
                  { value: 'dots',         label: 'Dots'     },
                ] as const).map(opt => (
                  <button key={opt.value} type="button" onClick={() => upd('skillStyle', opt.value)}
                    className={`p-2 rounded-xl border-2 transition-all text-center ${
                      (theme.skillStyle ?? 'tags') === opt.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}>
                    <div className="w-full h-9 bg-white dark:bg-slate-800 rounded overflow-hidden mb-1 flex flex-col justify-center px-1.5 gap-0.5">
                      {opt.value === 'tags' && (
                        <div className="flex gap-0.5 flex-wrap">
                          {['React', 'TS', 'Go'].map(x => (
                            <span key={x} className="text-[5px] px-1 py-0.5 rounded" style={{ background: `${theme.accentColor}25`, color: theme.primaryColor }}>{x}</span>
                          ))}
                        </div>
                      )}
                      {opt.value === 'progress-bar' && [85, 72, 60].map((w, i) => (
                        <div key={i} className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${w}%`, background: theme.accentColor }} />
                        </div>
                      ))}
                      {opt.value === 'dots' && [5, 4, 3].map((filled, i) => (
                        <div key={i} className="flex gap-0.5">
                          {[1,2,3,4,5].map(d => (
                            <div key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: d <= filled ? theme.accentColor : '#e5e7eb' }} />
                          ))}
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] font-medium text-slate-600 dark:text-slate-400">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── SPACING ── */}
            <RadioPills label="Spacing" value={theme.spacing} onChange={v => upd('spacing', v)}
              options={[{ value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'spacious', label: 'Spacious' }]} />

            {/* ── BULLET ── */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Bullet Style</p>
              <div className="flex gap-2">
                {(['•', '—', '▸', ''] as const).map(b => (
                  <button key={b || 'none'} type="button" onClick={() => upd('bulletChar', b)}
                    className={`w-9 h-9 rounded-lg border-2 text-base font-bold transition-all ${
                      theme.bulletChar === b
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}>
                    {b || '×'}
                  </button>
                ))}
                <span className="text-[10px] text-slate-400 self-center ml-1">× = none</span>
              </div>
            </div>

            {/* ── SIDEBAR EXTRAS (only when sidebar layout) ── */}
            {isSidebar && (
              <>
                <RadioPills label="Sidebar Width" value={theme.sidebarWidth ?? 'medium'} onChange={v => upd('sidebarWidth', v)}
                  options={[{ value: 'narrow', label: 'Narrow' }, { value: 'medium', label: 'Medium' }, { value: 'wide', label: 'Wide' }]} />

                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Sidebar Edge Shape</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'straight', label: 'Straight' },
                      { value: 'diagonal', label: 'Diagonal' },
                      { value: 'wave',     label: 'Wave'     },
                    ] as const).map(opt => (
                      <button key={opt.value} type="button" onClick={() => upd('sidebarShape', opt.value)}
                        className={`p-2 rounded-xl border-2 transition-all text-center ${
                          (theme.sidebarShape ?? 'straight') === opt.value
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}>
                        <div className="w-full h-9 rounded overflow-hidden mb-1 bg-white flex">
                          <div className="w-[40%] h-full" style={{ background: theme.sidebarColor || theme.primaryColor }} />
                          {opt.value === 'straight' && <div className="w-[4px] h-full bg-slate-200" />}
                          {opt.value === 'diagonal' && (
                            <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="w-[12px] h-full" style={{ display: 'block' }}>
                              <polygon points="0,0 0,1 1,1" fill={theme.sidebarColor || theme.primaryColor} />
                            </svg>
                          )}
                          {opt.value === 'wave' && (
                            <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="w-[12px] h-full" style={{ display: 'block' }}>
                              <path d="M0,0 C0.6,0.25 0,0.5 0.7,0.75 C1,1 0.5,1 0,1 Z" fill={theme.sidebarColor || theme.primaryColor} />
                            </svg>
                          )}
                          <div className="flex-1 h-full bg-white" />
                        </div>
                        <span className="text-[9px] font-medium text-slate-600 dark:text-slate-400">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Decorative Accent Shapes</p>
                  <Toggle on={!!theme.accentShapes} onToggle={() => upd('accentShapes', !theme.accentShapes)} />
                </div>
              </>
            )}

            {/* ── ICONS ── */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Icons</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Contact icons</span>
                <Toggle on={theme.showContactIcons !== false} onToggle={() => upd('showContactIcons', !theme.showContactIcons)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Section header icons</span>
                <Toggle on={theme.showSectionIcons !== false} onToggle={() => upd('showSectionIcons', !theme.showSectionIcons)} />
              </div>
            </div>

            {/* ── DIVIDERS ── */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Section Dividers</p>
              <Toggle on={theme.showDividers} onToggle={() => upd('showDividers', !theme.showDividers)} />
            </div>

            {/* ── PROFILE PHOTO ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Image className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Profile Photo</p>
                </div>
                <Toggle on={!!theme.showProfileImage} onToggle={() => upd('showProfileImage', !theme.showProfileImage)} />
              </div>
              {theme.showProfileImage && (
                <div className="space-y-1.5">
                  <input type="text" value={theme.profileImageUrl || ''}
                    onChange={e => upd('profileImageUrl', e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <p className="text-[9px] text-slate-400">Link to your photo (LinkedIn, Gravatar, etc.)</p>
                  {theme.profileImageUrl && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={theme.profileImageUrl} alt="Preview"
                        className="w-10 h-10 rounded-full object-cover border-2"
                        style={{ borderColor: theme.accentColor }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-[9px] text-slate-400">Preview</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ── Save / Apply footer ── */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto space-y-2 bg-white dark:bg-slate-900">
            <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)}
              placeholder="Theme name (e.g. My Sidebar Theme)"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
            {savedMsg && (
              <p className={`text-xs ${savedMsg === 'Theme saved!' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{savedMsg}</p>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => { onApply(theme); onClose(); }}
                className="flex-1 px-3 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-xl hover:bg-blue-100 transition">
                Apply Only
              </button>
              <button type="button" onClick={handleSave} disabled={saving || !themeName.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl transition">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : 'Save & Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* ══ Live Preview panel ══════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-200 dark:bg-slate-800">
          <div className="shrink-0 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Live Preview</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.primaryColor }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.accentColor }} />
              {isSidebar && <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.sidebarColor || theme.primaryColor }} />}
              <span>{theme.layout ?? 'standard'} · {theme.sectionStyle ?? 'plain'} · {theme.skillStyle ?? 'tags'} · {theme.fontFamily}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-2xl mx-auto origin-top" style={{ fontSize: '68%' }}>
              <CVPreview cvData={cvData} template="custom" customTheme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
