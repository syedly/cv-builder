export interface ContactSection {
  name: string; email: string; phone: string;
  linkedin?: string; github?: string; portfolio?: string; location?: string;
}
export interface WorkExperience {
  company: string; title: string; startDate: string; endDate: string;
  location?: string; bullets: string[];
}
export interface Education {
  degree: string; field?: string; school: string;
  graduationYear: string; gpa?: string; honors?: string;
}
export interface Project {
  name: string; description: string; technologies: string[];
  github?: string; link?: string;
}
export interface CVData {
  contactSection: ContactSection;
  professionalSummary: string;
  workExperience: WorkExperience[];
  skills: { technical: string[]; soft: string[]; languages?: string[] };
  education: Education[];
  certifications?: string[];
  projects?: Project[];
  achievements?: string[];
}
export type TemplateId = 'modern' | 'classic' | 'executive' | 'minimal' | 'creative';

export const TEMPLATES: Record<TemplateId, { label: string; description: string; atsTag: string }> = {
  modern:    { label: 'Modern',    description: 'Clean blue accents, professional',     atsTag: 'ATS-Friendly' },
  classic:   { label: 'Classic',   description: 'Traditional format, maximum ATS score', atsTag: 'Best ATS'     },
  executive: { label: 'Executive', description: 'Navy header, corporate & bold',         atsTag: 'ATS-Friendly' },
  minimal:   { label: 'Minimal',   description: 'Ultra-clean Scandinavian style',         atsTag: 'ATS-Friendly' },
  creative:  { label: 'Creative',  description: 'Two-column sidebar, Canva-style',       atsTag: 'Visual'       },
};
