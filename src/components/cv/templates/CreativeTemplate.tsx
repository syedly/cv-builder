'use client';
import { CVData } from './types';

export function CreativeTemplate({ cvData }: { cvData: CVData }) {
  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;

  return (
    <div className="bg-white font-sans text-[11px] min-h-[1100px] flex">
      {/* Left Sidebar */}
      <div className="w-[34%] bg-[#0f4c75] text-white flex flex-col p-6 shrink-0">
        {/* Name */}
        <div className="mb-5">
          <h1 className="text-[19px] font-bold leading-tight text-white mb-1">{c?.name || 'Your Name'}</h1>
          <div className="h-0.5 w-10 bg-[#1b9cfc] mb-3" />
          <div className="space-y-1 text-[9px] text-blue-200">
            {c?.email && <p>{c.email}</p>}
            {c?.phone && <p>{c.phone}</p>}
            {c?.location && <p>{c.location}</p>}
            {c?.linkedin && <p>{c.linkedin}</p>}
            {c?.github && <p>{c.github}</p>}
            {c?.portfolio && <p>{c.portfolio}</p>}
          </div>
        </div>

        {/* Skills */}
        {skills?.technical?.length > 0 && (
          <div className="mb-5">
            <SidebarSectionTitle>Technical Skills</SidebarSectionTitle>
            <div className="flex flex-wrap gap-1">
              {skills.technical.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#1b9cfc]/20 border border-[#1b9cfc]/40 rounded text-[9px] text-blue-100">{s}</span>
              ))}
            </div>
          </div>
        )}

        {skills?.soft?.length > 0 && (
          <div className="mb-5">
            <SidebarSectionTitle>Soft Skills</SidebarSectionTitle>
            <div className="space-y-0.5">
              {skills.soft.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[9px] text-blue-200">
                  <div className="w-1 h-1 rounded-full bg-[#1b9cfc] shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {(skills?.languages?.length ?? 0) > 0 && (
          <div className="mb-5">
            <SidebarSectionTitle>Languages</SidebarSectionTitle>
            <div className="space-y-0.5">
              {(skills.languages ?? []).map((l, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[9px] text-blue-200">
                  <div className="w-1 h-1 rounded-full bg-[#1b9cfc] shrink-0" />
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education in sidebar */}
        {education?.length > 0 && (
          <div className="mb-5">
            <SidebarSectionTitle>Education</SidebarSectionTitle>
            {education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold text-[10px] text-white">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                <p className="text-[9px] text-blue-200">{edu.school}</p>
                <p className="text-[9px] text-blue-300">{edu.graduationYear}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</p>
                {edu.honors && <p className="text-[8.5px] text-blue-300 italic">{edu.honors}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Certifications in sidebar */}
        {certifications && certifications.length > 0 && (
          <div className="mb-5">
            <SidebarSectionTitle>Certifications</SidebarSectionTitle>
            <div className="space-y-0.5">
              {certifications.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] text-blue-200">
                  <div className="w-1 h-1 rounded-full bg-[#1b9cfc] shrink-0 mt-1" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Summary */}
        {professionalSummary && (
          <section>
            <MainSectionTitle>Profile</MainSectionTitle>
            <p className="text-[10.5px] text-slate-600 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {/* Experience */}
        {workExperience?.length > 0 && (
          <section>
            <MainSectionTitle>Work Experience</MainSectionTitle>
            <div className="space-y-3.5">
              {workExperience.map((job, i) => (
                <div key={i} className="pl-3 border-l-2 border-[#1b9cfc]">
                  <div className="flex flex-wrap justify-between items-baseline gap-1 mb-0.5">
                    <span className="font-bold text-[11px] text-slate-900">{job.company}</span>
                    <span className="text-[9px] text-slate-400">{job.startDate} – {job.endDate}{job.location ? ` · ${job.location}` : ''}</span>
                  </div>
                  <div className="text-[#0f4c75] font-semibold text-[10.5px] mb-1">{job.title}</div>
                  <ul className="space-y-0.5">
                    {(job.bullets || []).filter(Boolean).map((b, j) => (
                      <li key={j} className="flex gap-1.5 text-[10px] text-slate-600">
                        <span className="text-[#1b9cfc] shrink-0">›</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <MainSectionTitle>Projects</MainSectionTitle>
            <div className="space-y-2.5">
              {projects.map((proj, i) => (
                <div key={i} className="pl-3 border-l-2 border-slate-200">
                  <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                    <span className="font-bold text-slate-900 text-[11px]">{proj.name}</span>
                    {(proj.github || proj.link) && (
                      <span className="text-[9px] text-[#1b9cfc]">{[proj.github, proj.link].filter(Boolean).join(' · ')}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600">{proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-blue-50 text-[8.5px] text-[#0f4c75] rounded border border-blue-100">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements && achievements.filter(Boolean).length > 0 && (
          <section>
            <MainSectionTitle>Achievements</MainSectionTitle>
            <ul className="space-y-0.5">
              {achievements.filter(Boolean).map((a, i) => (
                <li key={i} className="flex gap-1.5 text-[10px] text-slate-600">
                  <span className="text-[#1b9cfc] shrink-0">›</span>{a}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function SidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#1b9cfc] mb-1.5">{children}</h2>
  );
}

function MainSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0f4c75]">{children}</h2>
      <div className="h-0.5 bg-[#1b9cfc] w-8 mt-0.5 mb-1.5" />
    </div>
  );
}
