'use client';
import { CVData } from './types';

export function ClassicTemplate({ cvData }: { cvData: CVData }) {
  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;
  const contactLinks = [c?.email, c?.phone, c?.linkedin, c?.github, c?.portfolio, c?.location].filter(Boolean);

  return (
    <div className="bg-white text-black font-serif text-[11px] leading-snug p-8 min-h-[1100px]">
      {/* Name */}
      <div className="text-center mb-1">
        <h1 className="text-[22px] font-bold tracking-widest uppercase text-black">
          {c?.name || 'Your Name'}
        </h1>
      </div>
      {/* Contact */}
      <div className="text-center text-[9.5px] mb-1 text-black">
        {contactLinks.join(' | ')}
      </div>
      <div className="border-t-2 border-black mb-3" />

      {/* Summary */}
      {professionalSummary && (
        <section className="mb-3">
          <ClassicSectionTitle>Professional Summary</ClassicSectionTitle>
          <p className="text-[10.5px] leading-relaxed">{professionalSummary}</p>
        </section>
      )}

      {/* Experience */}
      {workExperience?.length > 0 && (
        <section className="mb-3">
          <ClassicSectionTitle>Work Experience</ClassicSectionTitle>
          {workExperience.map((job, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[11px] uppercase">{job.company}</span>
                <span className="text-[9.5px] italic">{job.startDate} – {job.endDate}{job.location ? ` | ${job.location}` : ''}</span>
              </div>
              <div className="italic text-[10.5px] mb-0.5">{job.title}</div>
              <ul className="pl-4 space-y-0.5">
                {(job.bullets || []).filter(Boolean).map((b, j) => (
                  <li key={j} className="list-disc text-[10px] leading-snug">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <section className="mb-3">
          <ClassicSectionTitle>Education</ClassicSectionTitle>
          {education.map((edu, i) => (
            <div key={i} className="flex justify-between items-baseline mb-1.5">
              <div>
                <p className="font-bold text-[11px]">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                <p className="text-[10px]">{edu.school}{edu.honors ? ` — ${edu.honors}` : ''}</p>
              </div>
              <div className="text-right text-[9.5px]">
                {edu.graduationYear}
                {edu.gpa && <p>GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
        <section className="mb-3">
          <ClassicSectionTitle>Skills</ClassicSectionTitle>
          {skills.technical?.length > 0 && (
            <p className="text-[10px] mb-0.5"><span className="font-bold">Technical:</span> {skills.technical.join(', ')}</p>
          )}
          {skills.soft?.length > 0 && (
            <p className="text-[10px] mb-0.5"><span className="font-bold">Soft Skills:</span> {skills.soft.join(', ')}</p>
          )}
          {(skills.languages?.length ?? 0) > 0 && (
            <p className="text-[10px]"><span className="font-bold">Languages:</span> {(skills.languages ?? []).join(', ')}</p>
          )}
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-3">
          <ClassicSectionTitle>Projects</ClassicSectionTitle>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[11px]">{proj.name}</span>
                {(proj.github || proj.link) && (
                  <span className="text-[9px] italic">{[proj.github, proj.link].filter(Boolean).join(' | ')}</span>
                )}
              </div>
              <p className="text-[10px] leading-snug">{proj.description}</p>
              {proj.technologies?.length > 0 && (
                <p className="text-[9.5px] italic">Technologies: {proj.technologies.join(', ')}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="mb-3">
          <ClassicSectionTitle>Certifications</ClassicSectionTitle>
          <ul className="pl-4 space-y-0.5">
            {certifications.map((c, i) => <li key={i} className="list-disc text-[10px]">{c}</li>)}
          </ul>
        </section>
      )}

      {/* Achievements */}
      {achievements && achievements.filter(Boolean).length > 0 && (
        <section>
          <ClassicSectionTitle>Achievements</ClassicSectionTitle>
          <ul className="pl-4 space-y-0.5">
            {achievements.filter(Boolean).map((a, i) => <li key={i} className="list-disc text-[10px]">{a}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}

function ClassicSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <h2 className="text-[11px] font-bold uppercase tracking-widest">{children}</h2>
      <div className="border-t border-black mt-0.5 mb-1.5" />
    </div>
  );
}
