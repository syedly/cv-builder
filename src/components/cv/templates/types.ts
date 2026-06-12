export interface ContactSection {
  name: string; email: string; phone: string;
  title?: string;
  linkedin?: string; github?: string; portfolio?: string; location?: string;
}

export interface Reference {
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
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
  references?: Reference[];
}
export type TemplateId = 'modern' | 'classic' | 'executive' | 'minimal' | 'creative' | 'custom';

export interface CustomTheme {
  primaryColor: string;
  accentColor: string;
  fontFamily: 'sans' | 'serif';
  headerStyle: 'banner' | 'lines' | 'minimal';
  spacing: 'compact' | 'normal' | 'spacious';
  bulletChar: '•' | '—' | '▸' | '';
  showDividers: boolean;
  // Layout
  layout?: 'standard' | 'sidebar-left' | 'sidebar-right';
  sidebarColor?: string;
  // Sections
  sectionStyle?: 'plain' | 'boxed' | 'shadowed';
  cornerRadius?: 'none' | 'small' | 'medium' | 'large';
  // Skills
  skillStyle?: 'tags' | 'progress-bar' | 'dots';
  // Name
  nameSize?: 'normal' | 'large' | 'xlarge';
  // Profile image
  showProfileImage?: boolean;
  profileImageUrl?: string;
  // Sidebar extras
  sidebarShape?: 'straight' | 'diagonal' | 'wave';
  sidebarWidth?: 'narrow' | 'medium' | 'wide';
  accentShapes?: boolean;
  // Icons
  showContactIcons?: boolean;
  showSectionIcons?: boolean;
}

export interface SavedTheme extends CustomTheme {
  _id: string;
  name: string;
}

export const TEMPLATES: Record<Exclude<TemplateId, 'custom'>, { label: string; description: string; atsTag: string }> = {
  modern:    { label: 'Modern',    description: 'Clean blue accents, professional',     atsTag: 'ATS-Friendly' },
  classic:   { label: 'Classic',   description: 'Traditional format, maximum ATS score', atsTag: 'Best ATS'     },
  executive: { label: 'Executive', description: 'Navy header, corporate & bold',         atsTag: 'ATS-Friendly' },
  minimal:   { label: 'Minimal',   description: 'Ultra-clean Scandinavian style',         atsTag: 'ATS-Friendly' },
  creative:  { label: 'Creative',  description: 'Two-column sidebar, Canva-style',       atsTag: 'Visual'       },
};
