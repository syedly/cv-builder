'use client';

import { TemplateId, TEMPLATES } from '@/components/cv/templates/types';

interface TemplateSelectStepProps {
  selected: TemplateId;
  onSelect: (t: TemplateId) => void;
  onNext: () => void;
  onBack: () => void;
}

const THUMBNAILS: Record<Exclude<TemplateId, 'custom'>, React.ReactNode> = {
  modern: (
    <div className="w-full h-full bg-white p-2 flex flex-col gap-1">
      <div className="text-center mb-1">
        <div className="h-2 w-16 bg-slate-700 rounded mx-auto mb-0.5" />
        <div className="h-1 w-24 bg-slate-300 rounded mx-auto" />
      </div>
      <div className="h-px bg-blue-500 w-full" />
      <SectionStrip color="bg-blue-500" />
      <ContentLines />
      <SectionStrip color="bg-blue-500" />
      <ContentLines />
    </div>
  ),
  classic: (
    <div className="w-full h-full bg-white p-2 flex flex-col gap-1">
      <div className="text-center mb-1">
        <div className="h-2 w-14 bg-black rounded mx-auto mb-0.5" />
        <div className="h-1 w-20 bg-gray-400 rounded mx-auto" />
      </div>
      <div className="h-0.5 bg-black w-full" />
      <SectionStrip color="bg-black" label />
      <ContentLines />
      <SectionStrip color="bg-black" label />
      <ContentLines />
    </div>
  ),
  executive: (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-[#1a2744] px-2 py-2 mb-1.5">
        <div className="h-2 w-14 bg-white rounded mb-0.5" />
        <div className="h-1 w-20 bg-blue-300 rounded" />
      </div>
      <div className="h-0.5 bg-amber-400 mx-2 mb-1" />
      <div className="px-2 flex flex-col gap-1">
        <SectionStrip color="bg-[#1a2744]" />
        <ContentLines />
        <SectionStrip color="bg-[#1a2744]" />
        <ContentLines />
      </div>
    </div>
  ),
  minimal: (
    <div className="w-full h-full bg-white p-2 flex flex-col gap-1.5">
      <div className="mb-1">
        <div className="h-2 w-16 bg-slate-800 rounded mb-0.5" />
        <div className="h-1 w-20 bg-slate-300 rounded" />
      </div>
      <div className="h-px bg-slate-100 w-full" />
      <div className="text-[4px] text-slate-400 uppercase tracking-widest">Experience</div>
      <ContentLines muted />
      <div className="text-[4px] text-slate-400 uppercase tracking-widest">Skills</div>
      <div className="flex flex-wrap gap-0.5">
        {[12, 16, 10, 14].map((w, i) => (
          <div key={i} className={`h-1.5 bg-slate-100 border border-slate-200 rounded`} style={{ width: `${w}px` }} />
        ))}
      </div>
    </div>
  ),
  creative: (
    <div className="w-full h-full flex">
      <div className="bg-[#0f4c75] w-[38%] p-1.5 flex flex-col gap-1">
        <div className="h-1.5 w-10 bg-white rounded mb-0.5" />
        <div className="h-px w-6 bg-blue-400" />
        <div className="h-1 w-8 bg-blue-300 rounded" />
        <div className="h-1 w-10 bg-blue-300 rounded" />
        <div className="mt-1 flex flex-wrap gap-0.5">
          {[8, 12, 10].map((w, i) => (
            <div key={i} className="h-1.5 bg-blue-600/40 border border-blue-400/30 rounded" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
      <div className="flex-1 p-1.5 flex flex-col gap-1">
        <div className="h-1 w-12 bg-[#0f4c75] rounded" />
        <div className="h-0.5 w-5 bg-blue-500" />
        <ContentLines />
        <div className="h-1 w-10 bg-[#0f4c75] rounded mt-0.5" />
        <ContentLines />
      </div>
    </div>
  ),
};

function SectionStrip({ color, label }: { color: string; label?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`h-1.5 w-10 ${color} rounded-sm`} />
      {label && <div className="h-px flex-1 bg-current opacity-20" />}
    </div>
  );
}

function ContentLines({ muted }: { muted?: boolean }) {
  const base = muted ? 'bg-slate-100' : 'bg-slate-200';
  return (
    <div className="flex flex-col gap-0.5 pl-1">
      <div className={`h-1 w-full ${base} rounded`} />
      <div className={`h-1 w-4/5 ${base} rounded`} />
      <div className={`h-1 w-3/4 ${base} rounded`} />
    </div>
  );
}

export function TemplateSelectStep({ selected, onSelect, onNext, onBack }: TemplateSelectStepProps) {
  const templateIds = Object.keys(TEMPLATES) as Exclude<TemplateId, 'custom'>[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Choose Your CV Template</h2>
        <p className="text-slate-500 text-sm">Select a style — you can also switch templates after generating</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {templateIds.map(id => {
          const tpl = TEMPLATES[id];
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`group relative flex flex-col rounded-2xl border-2 transition-all overflow-hidden text-left ${
                isSelected
                  ? 'border-blue-500 shadow-lg shadow-blue-100 scale-[1.02]'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {/* Thumbnail preview */}
              <div className="h-32 bg-slate-50 overflow-hidden">
                {THUMBNAILS[id]}
              </div>

              {/* Label */}
              <div className="p-2.5 bg-white">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-semibold text-slate-900 text-sm">{tpl.label}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                    tpl.atsTag === 'Best ATS' ? 'bg-green-100 text-green-700' :
                    tpl.atsTag === 'Visual' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-50 text-blue-600'
                  }`}>{tpl.atsTag}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">{tpl.description}</p>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary">Back</button>
        <button type="button" onClick={onNext} className="btn-primary flex-1 sm:flex-none">
          Continue with {selected !== 'custom' ? TEMPLATES[selected].label : 'Custom'} →
        </button>
      </div>
    </div>
  );
}
