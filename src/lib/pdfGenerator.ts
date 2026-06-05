import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

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

const MARGIN = 48;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BLUE = rgb(0.06, 0.33, 0.73);
const GRAY = rgb(0.35, 0.35, 0.35);
const DARK = rgb(0.1, 0.1, 0.1);
const LIGHT_GRAY = rgb(0.6, 0.6, 0.6);

class PDFBuilder {
  private doc: PDFDocument;
  private page!: PDFPage;
  private bold!: PDFFont;
  private y = PAGE_HEIGHT - MARGIN;

  constructor(doc: PDFDocument, bold: PDFFont, _regular: PDFFont) {
    this.doc = doc; this.bold = bold;
  }

  addPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  checkPage(needed: number) {
    if (this.y - needed < MARGIN + 20) this.addPage();
  }

  text(txt: string, size: number, font: PDFFont, indent = 0, color = DARK) {
    if (!txt) return;
    this.checkPage(size + 5);
    this.page.drawText(txt.slice(0, 120), { x: MARGIN + indent, y: this.y, size, font, color, maxWidth: CONTENT_WIDTH - indent });
    this.y -= size + 4;
  }

  wrapped(txt: string, size: number, font: PDFFont, indent = 0, color = DARK) {
    if (!txt) return;
    const maxW = CONTENT_WIDTH - indent;
    const words = txt.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        this.checkPage(size + 4);
        this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color });
        this.y -= size + 3;
        line = word;
      } else { line = test; }
    }
    if (line) {
      this.checkPage(size + 4);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color });
      this.y -= size + 3;
    }
  }

  line() {
    this.checkPage(8);
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: PAGE_WIDTH - MARGIN, y: this.y }, thickness: 1, color: BLUE });
    this.y -= 6;
  }

  gap(px: number) { this.y -= px; }

  section(title: string) {
    this.gap(8);
    this.checkPage(26);
    this.page.drawText(title.toUpperCase(), { x: MARGIN, y: this.y, size: 9, font: this.bold, color: BLUE });
    this.y -= 14;
    this.line();
    this.gap(5);
  }
}

export async function generatePDF(cvData: CVData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const b = new PDFBuilder(doc, bold, regular);
  b.addPage();

  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;

  // Name
  b.text(c.name || 'Your Name', 20, bold, 0, DARK);
  b.gap(3);

  // Contact line
  const contactParts = [c.email, c.phone, c.linkedin, c.github, c.portfolio, c.location].filter(Boolean);
  b.wrapped(contactParts.join('  |  '), 8, regular, 0, GRAY);
  b.gap(4);
  b.line();
  b.gap(2);

  // Professional Summary
  if (professionalSummary) {
    b.section('Professional Summary');
    b.wrapped(professionalSummary, 9.5, regular);
    b.gap(2);
  }

  // Work Experience
  if (workExperience?.length > 0) {
    b.section('Work Experience');
    for (const job of workExperience) {
      b.checkPage(50);
      // Role header
      const header = `${job.company}  —  ${job.title}`;
      const dateStr = `${job.startDate} – ${job.endDate}${job.location ? ' | ' + job.location : ''}`;
      b.text(header, 10, bold, 0, DARK);
      b.text(dateStr, 8.5, regular, 0, LIGHT_GRAY);
      b.gap(1);
      for (const bullet of (job.bullets || []).filter(Boolean)) {
        b.wrapped(`• ${bullet}`, 9, regular, 10);
      }
      b.gap(6);
    }
  }

  // Skills
  if (skills) {
    b.section('Technical Skills');
    if (skills.technical?.length > 0) b.wrapped(`Technical: ${skills.technical.join(' • ')}`, 9.5, regular);
    if (skills.soft?.length > 0) { b.gap(2); b.wrapped(`Soft Skills: ${skills.soft.join(', ')}`, 9.5, regular); }
    if ((skills.languages?.length ?? 0) > 0) { b.gap(2); b.wrapped(`Languages: ${(skills.languages ?? []).join(', ')}`, 9.5, regular); }
    b.gap(2);
  }

  // Projects
  if (projects && projects.length > 0) {
    b.section('Projects');
    for (const proj of projects) {
      b.checkPage(40);
      const projHeader = proj.github || proj.link
        ? `${proj.name}  (${[proj.github, proj.link].filter(Boolean).join(' · ')})`
        : proj.name;
      b.text(projHeader, 10, bold, 0, DARK);
      b.wrapped(proj.description, 9, regular, 10);
      if (proj.technologies?.length > 0) {
        b.text(`Tech: ${proj.technologies.join(', ')}`, 8.5, regular, 10, LIGHT_GRAY);
      }
      b.gap(5);
    }
  }

  // Education
  if (education?.length > 0) {
    b.section('Education');
    for (const edu of education) {
      b.checkPage(30);
      const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      b.text(degreeStr, 10, bold, 0, DARK);
      const details = [edu.school, edu.graduationYear, edu.gpa ? `GPA: ${edu.gpa}` : null].filter(Boolean).join('  |  ');
      b.text(details, 8.5, regular, 0, GRAY);
      if (edu.honors) b.text(edu.honors, 8.5, regular, 0, GRAY);
      b.gap(4);
    }
  }

  // Certifications
  if (certifications?.length) {
    b.section('Certifications');
    for (const cert of certifications as string[]) {
      b.wrapped(`• ${cert}`, 9, regular, 10);
    }
    b.gap(2);
  }

  // Achievements
  if (achievements?.filter(Boolean).length) {
    b.section('Achievements');
    for (const ach of achievements.filter(Boolean)) {
      b.wrapped(`• ${ach}`, 9, regular, 10);
    }
  }

  return Buffer.from(await doc.save());
}
