'use client';
import { CVData } from './types';

export function MinimalTemplate({ cvData }: { cvData: CVData }) {
  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;
  const contactLinks = [c?.email, c?.phone, c?.linkedin, c?.github, c?.portfolio, c?.location].filter(Boolean);

  return (
    <div className="bg-white text-slate-800 font-sans text-[11px] leading-relaxed p-10 min-h-[1100px]">
      {/* Header — left-aligned, minimal */}
      <div className="mb-6">
        <h1 className="text-[24px] font-light tracking-tight text-slate-900 mb-1.5">{c?.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-3 text-[9.5px] text-slate-400">
          {contactLinks.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
        <div className="mt-3 h-px bg-slate-100" />
      </div>

      <div className="space-y-5">
        {/* Summary */}
        {professionalSummary && (
          <section>
            <MinSectionTitle>About</MinSectionTitle>
            <p className="text-[10.5px] text-slate-600 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {/* Experience */}
        {workExperience?.length > 0 && (
          <section>
            <MinSectionTitle>Experience</MinSectionTitle>
            <div className="space-y-4">
              {workExperience.map((job, i) => (
                <div key={i}>
                  <div className="flex flex-wrap justify-between items-baseline gap-1 mb-0.5">
                    <div>
                      <span className="font-semibold text-slate-900 text-[11px]">{job.title}</span>
                      <span className="text-slate-400 text-[10px]"> · {job.company}</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400">{job.startDate} – {job.endDate}{job.location ? ` · ${job.location}` : ''}</span>
                  </div>
                  <ul className="space-y-0.5 mt-1">
                    {(job.bullets || []).filter(Boolean).map((b, j) => (
                      <li key={j} className="flex gap-2 text-[10px] text-slate-600">
                        <span className="text-slate-300 shrink-0 mt-0.5">—</span>
                        {b}
                      </li>
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
            <MinSectionTitle>Skills</MinSectionTitle>
            <div className="space-y-1.5">
              {skills.technical?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.technical.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9.5px] text-slate-600">{s}</span>
                  ))}
                </div>
              )}
              {skills.soft?.length > 0 && (
                <p className="text-[10px] text-slate-500">{skills.soft.join('  ·  ')}</p>
              )}
              {(skills.languages?.length ?? 0) > 0 && (
                <p className="text-[10px] text-slate-500">Languages: {(skills.languages ?? []).join(', ')}</p>
              )}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <MinSectionTitle>Projects</MinSectionTitle>
            <div className="space-y-2.5">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-900 text-[11px]">{proj.name}</span>
                    {(proj.github || proj.link) && (
                      <span className="text-[9px] text-slate-400">{[proj.github, proj.link].filter(Boolean).join(' · ')}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">{proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-[8.5px] text-slate-500 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <section>
            <MinSectionTitle>Education</MinSectionTitle>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 text-[11px]">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                    <p className="text-[10px] text-slate-500">{edu.school}{edu.honors ? ` · ${edu.honors}` : ''}</p>
                  </div>
                  <div className="text-right text-[9.5px] text-slate-400 shrink-0">
                    {edu.graduationYear}
                    {edu.gpa && <p>GPA {edu.gpa}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section>
            <MinSectionTitle>Certifications</MinSectionTitle>
            <div className="space-y-0.5">
              {certifications.map((c, i) => (
                <div key={i} className="flex gap-2 text-[10px] text-slate-600">
                  <span className="text-slate-300 shrink-0 mt-0.5">—</span>{c}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements && achievements.filter(Boolean).length > 0 && (
          <section>
            <MinSectionTitle>Achievements</MinSectionTitle>
            <div className="space-y-0.5">
              {achievements.filter(Boolean).map((a, i) => (
                <div key={i} className="flex gap-2 text-[10px] text-slate-600">
                  <span className="text-slate-300 shrink-0 mt-0.5">—</span>{a}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MinSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">{children}</h2>
  );
}
