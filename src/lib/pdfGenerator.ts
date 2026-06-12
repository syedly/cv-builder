import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage, RGB } from 'pdf-lib';

interface CustomThemePDF {
  primaryColor: string;
  accentColor: string;
  fontFamily: 'sans' | 'serif';
  headerStyle: 'banner' | 'lines' | 'minimal';
  spacing: 'compact' | 'normal' | 'spacious';
  bulletChar: string;
  showDividers: boolean;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return rgb(Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b)));
}

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

// Colour palettes per template
type Palette = { accent: ReturnType<typeof rgb>; heading: ReturnType<typeof rgb>; body: ReturnType<typeof rgb>; muted: ReturnType<typeof rgb> };
const PALETTES: Record<string, Palette> = {
  modern:    { accent: rgb(0.06, 0.28, 0.73), heading: rgb(0.07, 0.07, 0.07), body: rgb(0.1, 0.1, 0.1),  muted: rgb(0.45, 0.45, 0.45) },
  classic:   { accent: rgb(0, 0, 0),           heading: rgb(0, 0, 0),           body: rgb(0, 0, 0),         muted: rgb(0.3, 0.3, 0.3)    },
  executive: { accent: rgb(0.1, 0.15, 0.27),   heading: rgb(0.1, 0.15, 0.27),  body: rgb(0.07, 0.07, 0.07), muted: rgb(0.43, 0.43, 0.43) },
  minimal:   { accent: rgb(0.5, 0.5, 0.5),     heading: rgb(0.1, 0.1, 0.1),    body: rgb(0.2, 0.2, 0.2),   muted: rgb(0.55, 0.55, 0.55)  },
  creative:  { accent: rgb(0.06, 0.30, 0.46),  heading: rgb(0.06, 0.30, 0.46), body: rgb(0.08, 0.08, 0.08), muted: rgb(0.4, 0.4, 0.4)    },
};

class PDFBuilder {
  private doc: PDFDocument;
  private page!: PDFPage;
  private bold!: PDFFont;
  private y = PAGE_HEIGHT - MARGIN;
  private palette: Palette;

  constructor(doc: PDFDocument, bold: PDFFont, _regular: PDFFont, template: string, palette?: Palette) {
    this.doc = doc; this.bold = bold;
    this.palette = palette ?? PALETTES[template] ?? PALETTES.modern;
  }

  addPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  checkPage(needed: number) {
    if (this.y - needed < MARGIN + 20) this.addPage();
  }

  text(txt: string, size: number, font: PDFFont, indent = 0, color = this.palette.body) {
    if (!txt) return;
    this.checkPage(size + 5);
    this.page.drawText(txt.slice(0, 120), { x: MARGIN + indent, y: this.y, size, font, color, maxWidth: CONTENT_WIDTH - indent });
    this.y -= size + 4;
  }

  wrapped(txt: string, size: number, font: PDFFont, indent = 0, color = this.palette.body) {
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

  line(color = this.palette.accent) {
    this.checkPage(8);
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: PAGE_WIDTH - MARGIN, y: this.y }, thickness: 1, color });
    this.y -= 6;
  }

  gap(px: number) { this.y -= px; }

  section(title: string, template: string) {
    this.gap(8);
    this.checkPage(26);
    this.page.drawText(title.toUpperCase(), { x: MARGIN, y: this.y, size: 9, font: this.bold, color: this.palette.accent });
    this.y -= 14;
    this.line();
    this.gap(5);
    // Classic uses a heavier underline with no color
    if (template === 'classic') {
      this.page.drawLine({ start: { x: MARGIN, y: this.y + 10 }, end: { x: PAGE_WIDTH - MARGIN, y: this.y + 10 }, thickness: 0.5, color: rgb(0,0,0) });
    }
  }

  // Draw a full-width filled rectangle (used for executive/creative headers)
  banner(h: number, color: ReturnType<typeof rgb>) {
    this.page.drawRectangle({ x: 0, y: this.y - h + 14, width: PAGE_WIDTH, height: h, color });
    this.y -= h - 14;
  }

  // Draw a full-width line at current y (for accent lines)
  fullLine(thickness: number, color: ReturnType<typeof rgb>) {
    this.page.drawLine({ start: { x: 0, y: this.y }, end: { x: PAGE_WIDTH, y: this.y }, thickness, color });
  }

  // Overlay a rectangle at the top of the page without consuming y space
  topBand(h: number, color: ReturnType<typeof rgb>) {
    this.page.drawRectangle({ x: 0, y: PAGE_HEIGHT - h, width: PAGE_WIDTH, height: h, color });
  }
}

export async function generatePDF(cvData: CVData, template = 'modern', customTheme?: CustomThemePDF): Promise<Buffer> {
  const isCustom = template === 'custom' && !!customTheme;
  const useSerif = template === 'classic' || (isCustom && customTheme?.fontFamily === 'serif');
  const doc = await PDFDocument.create();
  const bold = await doc.embedFont(useSerif ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(useSerif ? StandardFonts.TimesRoman : StandardFonts.Helvetica);

  let pal: Palette;
  if (isCustom && customTheme) {
    const primary = hexToRgb(customTheme.primaryColor);
    const accent = hexToRgb(customTheme.accentColor);
    pal = { accent, heading: primary, body: rgb(0.1, 0.1, 0.1), muted: rgb(0.45, 0.45, 0.45) };
  } else {
    pal = PALETTES[template] ?? PALETTES.modern;
  }

  const b = new PDFBuilder(doc, bold, regular, template, pal);
  b.addPage();

  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements } = cvData;

  const bulletChar = isCustom && customTheme?.bulletChar !== undefined ? (customTheme.bulletChar || '') : '•';

  if (isCustom && customTheme?.headerStyle === 'banner') {
    b.banner(58, pal.heading);
    const white = rgb(1, 1, 1);
    const lightColor = rgb(0.85, 0.9, 1.0);
    b.gap(-32);
    b.text(c.name || 'Your Name', 18, bold, 0, white);
    const contactParts = [c.email, c.phone, c.linkedin, c.github, c.portfolio, c.location].filter(Boolean);
    b.wrapped(contactParts.join('  |  '), 7.5, regular, 0, lightColor);
    b.gap(10);
  } else if (template === 'executive') {
    // Navy banner header
    b.banner(58, pal.heading);
    const white = rgb(1, 1, 1);
    const lightBlue = rgb(0.7, 0.8, 0.95);
    b.gap(-32);
    b.text(c.name || 'Your Name', 18, bold, 0, white);
    const contactParts = [c.email, c.phone, c.linkedin, c.github, c.portfolio, c.location].filter(Boolean);
    b.wrapped(contactParts.join('  |  '), 7.5, regular, 0, lightBlue);
    b.gap(6);
    // Gold accent line
    b.fullLine(3, rgb(0.96, 0.71, 0.10));
    b.gap(10);
  } else if (template === 'creative') {
    // Teal-ish header band
    b.topBand(72, pal.accent);
    b.gap(-42);
    b.text(c.name || 'Your Name', 18, bold, 0, rgb(1, 1, 1));
    const contactParts = [c.email, c.phone, c.linkedin, c.github, c.portfolio, c.location].filter(Boolean);
    b.wrapped(contactParts.join('  |  '), 7.5, regular, 0, rgb(0.8, 0.9, 1.0));
    b.gap(14);
  } else {
    // Standard centered header
    const nameSize = template === 'minimal' ? 17 : 20;
    b.text(c.name || 'Your Name', nameSize, bold, 0, pal.heading);
    b.gap(3);
    const contactParts = [c.email, c.phone, c.linkedin, c.github, c.portfolio, c.location].filter(Boolean);
    b.wrapped(contactParts.join('  |  '), 8, regular, 0, pal.muted);
    b.gap(4);
    b.line();
    b.gap(2);
  }

  // Professional Summary
  if (professionalSummary) {
    b.section('Professional Summary', template);
    b.wrapped(professionalSummary, 9.5, regular);
    b.gap(2);
  }

  // Work Experience
  if (workExperience?.length > 0) {
    b.section('Work Experience', template);
    for (const job of workExperience) {
      b.checkPage(50);
      const header = `${job.company}  —  ${job.title}`;
      const dateStr = `${job.startDate} – ${job.endDate}${job.location ? ' | ' + job.location : ''}`;
      b.text(header, 10, bold, 0, pal.heading);
      b.text(dateStr, 8.5, regular, 0, pal.muted);
      b.gap(1);
      for (const bullet of (job.bullets || []).filter(Boolean)) {
        b.wrapped(bulletChar ? `${bulletChar} ${bullet}` : bullet, 9, regular, 10);
      }
      b.gap(6);
    }
  }

  // Skills
  if (skills) {
    b.section('Technical Skills', template);
    if (skills.technical?.length > 0) b.wrapped(`Technical: ${skills.technical.join(' • ')}`, 9.5, regular);
    if (skills.soft?.length > 0) { b.gap(2); b.wrapped(`Soft Skills: ${skills.soft.join(', ')}`, 9.5, regular); }
    if ((skills.languages?.length ?? 0) > 0) { b.gap(2); b.wrapped(`Languages: ${(skills.languages ?? []).join(', ')}`, 9.5, regular); }
    b.gap(2);
  }

  // Projects
  if (projects && projects.length > 0) {
    b.section('Projects', template);
    for (const proj of projects) {
      b.checkPage(40);
      const projHeader = proj.github || proj.link
        ? `${proj.name}  (${[proj.github, proj.link].filter(Boolean).join(' · ')})`
        : proj.name;
      b.text(projHeader, 10, bold, 0, pal.heading);
      b.wrapped(proj.description, 9, regular, 10);
      if (proj.technologies?.length > 0) b.text(`Tech: ${proj.technologies.join(', ')}`, 8.5, regular, 10, pal.muted);
      b.gap(5);
    }
  }

  // Education
  if (education?.length > 0) {
    b.section('Education', template);
    for (const edu of education) {
      b.checkPage(30);
      const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      b.text(degreeStr, 10, bold, 0, pal.heading);
      const details = [edu.school, edu.graduationYear, edu.gpa ? `GPA: ${edu.gpa}` : null].filter(Boolean).join('  |  ');
      b.text(details, 8.5, regular, 0, pal.muted);
      if (edu.honors) b.text(edu.honors, 8.5, regular, 0, pal.muted);
      b.gap(4);
    }
  }

  // Certifications
  if (certifications?.length) {
    b.section('Certifications', template);
    for (const cert of certifications as string[]) b.wrapped(bulletChar ? `${bulletChar} ${cert}` : cert, 9, regular, 10);
    b.gap(2);
  }

  // Achievements
  if (achievements?.filter(Boolean).length) {
    b.section('Achievements', template);
    for (const ach of achievements.filter(Boolean)) b.wrapped(bulletChar ? `${bulletChar} ${ach}` : ach, 9, regular, 10);
  }

  return Buffer.from(await doc.save());
}
