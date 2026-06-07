'use client';
import { CVData } from './types';

export function ExecutiveTemplate({ cvData }: { cvData: CVData }) {
  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;
  const contactLinks = [c?.email, c?.phone, c?.linkedin, c?.github, c?.portfolio, c?.location].filter(Boolean);

  return (
    <div className="bg-white text-slate-900 font-sans text-[11px] leading-relaxed min-h-[1100px]">
      {/* Navy Header */}
      <div className="bg-[#1a2744] text-white px-8 pt-7 pb-6">
        <h1 className="text-[26px] font-bold tracking-tight mb-1">{c?.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[9.5px] text-blue-200">
          {contactLinks.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-blue-400 opacity-50 mr-3">|</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
      {/* Gold accent bar */}
      <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />

      <div className="px-8 py-5 space-y-4">
        {/* Summary */}
        {professionalSummary && (
          <section>
            <ExecSectionTitle>Executive Summary</ExecSectionTitle>
            <p className="text-[10.5px] leading-relaxed text-slate-700">{professionalSummary}</p>
          </section>
        )}

        {/* Experience */}
        {workExperience?.length > 0 && (
          <section>
            <ExecSectionTitle>Professional Experience</ExecSectionTitle>
            <div className="space-y-3.5">
              {workExperience.map((job, i) => (
                <div key={i}>
                  <div className="flex flex-wrap justify-between items-baseline gap-1 mb-0.5">
                    <span className="font-bold text-[12px] text-[#1a2744]">{job.company}</span>
                    <span className="text-[9.5px] text-slate-500 font-medium">{job.startDate} – {job.endDate}{job.location ? ` · ${job.location}` : ''}</span>
                  </div>
                  <div className="text-amber-700 font-semibold text-[10.5px] mb-1">{job.title}</div>
                  <ul className="space-y-0.5 pl-3.5">
                    {(job.bullets || []).filter(Boolean).map((b, j) => (
                      <li key={j} className="relative before:absolute before:left-[-10px] before:content-['▸'] before:text-amber-500 text-[10px] text-slate-700">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
          <section>
            <ExecSectionTitle>Core Competencies</ExecSectionTitle>
            {skills.technical?.length > 0 && (
              <p className="text-[10.5px] mb-1"><span className="font-semibold text-[#1a2744]">Technical:</span> {skills.technical.join(' · ')}</p>
            )}
            {skills.soft?.length > 0 && (
              <p className="text-[10.5px] mb-1"><span className="font-semibold text-[#1a2744]">Leadership & Soft Skills:</span> {skills.soft.join(', ')}</p>
            )}
            {(skills.languages?.length ?? 0) > 0 && (
              <p className="text-[10.5px]"><span className="font-semibold text-[#1a2744]">Languages:</span> {(skills.languages ?? []).join(', ')}</p>
            )}
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <ExecSectionTitle>Key Projects</ExecSectionTitle>
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-bold text-[#1a2744] text-[11px]">{proj.name}</span>
                    {(proj.github || proj.link) && (
                      <span className="text-[9px] text-amber-600">{[proj.github, proj.link].filter(Boolean).join(' · ')}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-700">{proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <p className="text-[9.5px] text-slate-500 mt-0.5">Tech: {proj.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <section>
            <ExecSectionTitle>Education</ExecSectionTitle>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#1a2744] text-[11px]">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                    <p className="text-[10px] text-slate-600">{edu.school}{edu.honors ? ` — ${edu.honors}` : ''}</p>
                  </div>
                  <div className="text-right text-[9.5px] text-slate-500 shrink-0">
                    {edu.graduationYear}
                    {edu.gpa && <p>GPA: {edu.gpa}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section>
            <ExecSectionTitle>Certifications</ExecSectionTitle>
            <ul className="space-y-0.5 pl-3.5">
              {certifications.map((c, i) => (
                <li key={i} className="relative before:absolute before:left-[-10px] before:content-['▸'] before:text-amber-500 text-[10px] text-slate-700">{c}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Achievements */}
        {achievements && achievements.filter(Boolean).length > 0 && (
          <section>
            <ExecSectionTitle>Achievements</ExecSectionTitle>
            <ul className="space-y-0.5 pl-3.5">
              {achievements.filter(Boolean).map((a, i) => (
                <li key={i} className="relative before:absolute before:left-[-10px] before:content-['▸'] before:text-amber-500 text-[10px] text-slate-700">{a}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function ExecSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1a2744]">{children}</h2>
      <div className="h-px bg-gradient-to-r from-[#1a2744] to-transparent mt-0.5 mb-1.5" />
    </div>
  );
}
