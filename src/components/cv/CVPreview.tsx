'use client';

interface ContactSection {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
}

interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  bullets: string[];
}

interface Education {
  degree: string;
  field?: string;
  school: string;
  graduationYear: string;
  gpa?: string;
  honors?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  github?: string;
  link?: string;
}

interface CVData {
  contactSection: ContactSection;
  professionalSummary: string;
  workExperience: WorkExperience[];
  skills: { technical: string[]; soft: string[]; languages?: string[] };
  education: Education[];
  certifications?: string[];
  projects?: Project[];
  achievements?: string[];
}

interface CVPreviewProps {
  cvData: CVData;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 border-b-2 border-blue-600 pb-0.5 mb-2">
      {children}
    </h2>
  );
}

export function CVPreview({ cvData }: CVPreviewProps) {
  if (!cvData) return null;
  const { contactSection, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;

  const contactLinks = [
    contactSection?.email,
    contactSection?.phone,
    contactSection?.linkedin,
    contactSection?.github,
    contactSection?.portfolio,
    contactSection?.location,
  ].filter(Boolean);

  return (
    <div className="bg-white text-slate-900 font-sans text-[12px] leading-relaxed p-7 min-h-[1100px]">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900 mb-1">
          {contactSection?.name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
          {contactLinks.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300">|</span>}
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <section className="mb-4">
          <SectionTitle>Professional Summary</SectionTitle>
          <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
        </section>
      )}

      {/* Work Experience */}
      {workExperience?.length > 0 && (
        <section className="mb-4">
          <SectionTitle>Work Experience</SectionTitle>
          <div className="space-y-3.5">
            {workExperience.map((job, i) => (
              <div key={i}>
                <div className="flex flex-wrap justify-between items-baseline gap-1 mb-0.5">
                  <div>
                    <span className="font-bold text-slate-900">{job.company}</span>
                    <span className="text-slate-600 font-medium"> — {job.title}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] shrink-0">
                    {job.startDate} – {job.endDate}
                    {job.location && ` | ${job.location}`}
                  </div>
                </div>
                <ul className="space-y-0.5 pl-3">
                  {(job.bullets || []).filter(Boolean).map((bullet, j) => (
                    <li key={j} className="relative before:absolute before:left-[-10px] before:content-['•'] before:text-blue-500 text-slate-700">
                      {bullet}
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
        <section className="mb-4">
          <SectionTitle>Technical Skills</SectionTitle>
          <div className="space-y-1 text-slate-700">
            {skills.technical?.length > 0 && (
              <div><span className="font-semibold">Technical:</span> {skills.technical.join(' • ')}</div>
            )}
            {skills.soft?.length > 0 && (
              <div><span className="font-semibold">Soft Skills:</span> {skills.soft.join(', ')}</div>
            )}
            {skills.languages && skills.languages.length > 0 && (
              <div><span className="font-semibold">Languages:</span> {skills.languages.join(', ')}</div>
            )}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-4">
          <SectionTitle>Projects</SectionTitle>
          <div className="space-y-2.5">
            {projects.map((proj, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                  <span className="font-bold text-slate-900">{proj.name}</span>
                  {(proj.github || proj.link) && (
                    <span className="text-[10px] text-blue-600">
                      {proj.github && proj.github}
                      {proj.github && proj.link && ' · '}
                      {proj.link && proj.link}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 mb-0.5">{proj.description}</p>
                {proj.technologies?.length > 0 && (
                  <p className="text-[10px] text-slate-500">
                    <span className="font-semibold">Tech:</span> {proj.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <section className="mb-4">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="flex flex-wrap justify-between gap-1">
                <div>
                  <p className="font-bold text-slate-900">
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </p>
                  <p className="text-slate-600">{edu.school}</p>
                  {edu.honors && <p className="text-slate-500 text-[10px]">{edu.honors}</p>}
                </div>
                <div className="text-slate-400 text-[10px] text-right shrink-0">
                  {edu.graduationYear}
                  {edu.gpa && <><br />GPA: {edu.gpa}</>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="mb-4">
          <SectionTitle>Certifications</SectionTitle>
          <ul className="space-y-0.5 pl-3 text-slate-700">
            {certifications.map((cert, i) => (
              <li key={i} className="relative before:absolute before:left-[-10px] before:content-['•'] before:text-blue-500">
                {cert}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Achievements */}
      {achievements && achievements.filter(Boolean).length > 0 && (
        <section>
          <SectionTitle>Achievements</SectionTitle>
          <ul className="space-y-0.5 pl-3 text-slate-700">
            {achievements.filter(Boolean).map((ach, i) => (
              <li key={i} className="relative before:absolute before:left-[-10px] before:content-['•'] before:text-blue-500">
                {ach}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
