import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Packer } from 'docx';

interface ContactSection {
  name: string; email: string; phone: string;
  linkedin?: string; github?: string; portfolio?: string; location?: string;
}
interface WorkExperience {
  company: string; title: string; startDate: string;
  endDate: string; location?: string; bullets: string[];
}
interface Education {
  degree: string; field?: string; school: string;
  graduationYear: string; gpa?: string; honors?: string;
}
interface Project {
  name: string; description: string; technologies: string[];
  github?: string; link?: string;
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

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 20, color: '1048bb' })],
    spacing: { before: 200, after: 60 },
    border: { bottom: { color: '1048bb', style: BorderStyle.SINGLE, size: 8 } },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 19 })],
    bullet: { level: 0 },
    spacing: { after: 30 },
  });
}

export async function generateDOCX(cvData: CVData): Promise<Buffer> {
  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;
  const children: Paragraph[] = [];

  // Name
  children.push(new Paragraph({
    children: [new TextRun({ text: c.name || 'Your Name', bold: true, size: 40, color: '111111' })],
    alignment: AlignmentType.CENTER, spacing: { after: 60 },
  }));

  // Contact line
  const contactParts = [c.email, c.phone, c.linkedin, c.github, c.portfolio, c.location].filter(Boolean);
  children.push(new Paragraph({
    children: [new TextRun({ text: contactParts.join('  |  '), size: 16, color: '555555' })],
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
  }));

  // Professional Summary
  if (professionalSummary) {
    children.push(sectionHeader('Professional Summary'));
    children.push(new Paragraph({ children: [new TextRun({ text: professionalSummary, size: 19 })], spacing: { after: 120 } }));
  }

  // Work Experience
  if (workExperience?.length > 0) {
    children.push(sectionHeader('Work Experience'));
    for (const job of workExperience) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: job.company, bold: true, size: 21 }),
          new TextRun({ text: `  —  ${job.title}`, size: 21 }),
        ],
        spacing: { before: 120, after: 30 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({
          text: `${job.startDate} – ${job.endDate}${job.location ? ' | ' + job.location : ''}`,
          size: 17, color: '777777', italics: true,
        })],
        spacing: { after: 40 },
      }));
      for (const b of (job.bullets || []).filter(Boolean)) {
        children.push(bullet(b));
      }
    }
  }

  // Skills
  if (skills) {
    children.push(sectionHeader('Technical Skills'));
    if (skills.technical?.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Technical: ', bold: true, size: 19 }), new TextRun({ text: skills.technical.join(' • '), size: 19 })],
        spacing: { after: 40 },
      }));
    }
    if (skills.soft?.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Soft Skills: ', bold: true, size: 19 }), new TextRun({ text: skills.soft.join(', '), size: 19 })],
        spacing: { after: 40 },
      }));
    }
    if ((skills.languages?.length ?? 0) > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Languages: ', bold: true, size: 19 }), new TextRun({ text: (skills.languages ?? []).join(', '), size: 19 })],
        spacing: { after: 40 },
      }));
    }
  }

  // Projects
  if (projects && projects.length > 0) {
    children.push(sectionHeader('Projects'));
    for (const proj of projects) {
      const linkStr = [proj.github, proj.link].filter(Boolean).join(' · ');
      children.push(new Paragraph({
        children: [
          new TextRun({ text: proj.name, bold: true, size: 21 }),
          ...(linkStr ? [new TextRun({ text: `  (${linkStr})`, size: 17, color: '1048bb' })] : []),
        ],
        spacing: { before: 100, after: 30 },
      }));
      children.push(new Paragraph({ children: [new TextRun({ text: proj.description, size: 19 })], spacing: { after: 30 } }));
      if (proj.technologies?.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Tech: ', bold: true, size: 17, color: '555555' }), new TextRun({ text: proj.technologies.join(', '), size: 17, color: '555555' })],
          spacing: { after: 60 },
        }));
      }
    }
  }

  // Education
  if (education?.length > 0) {
    children.push(sectionHeader('Education'));
    for (const edu of education) {
      const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      children.push(new Paragraph({ children: [new TextRun({ text: degreeStr, bold: true, size: 21 })], spacing: { before: 100, after: 30 } }));
      const details = [edu.school, edu.graduationYear, edu.gpa ? `GPA: ${edu.gpa}` : null].filter(Boolean).join('  |  ');
      children.push(new Paragraph({ children: [new TextRun({ text: details, size: 19, color: '555555' })], spacing: { after: 30 } }));
      if (edu.honors) children.push(new Paragraph({ children: [new TextRun({ text: edu.honors, size: 17, color: '777777' })], spacing: { after: 60 } }));
    }
  }

  // Certifications
  if (certifications?.length) {
    children.push(sectionHeader('Certifications'));
    for (const cert of certifications as string[]) {
      children.push(bullet(cert));
    }
  }

  // Achievements
  if (achievements?.filter(Boolean).length) {
    children.push(sectionHeader('Achievements'));
    for (const ach of achievements.filter(Boolean)) {
      children.push(bullet(ach));
    }
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 700, bottom: 700, left: 880, right: 880 } } },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}
