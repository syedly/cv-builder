import type { CSSProperties } from 'react';
import { CVData, CustomTheme } from './types';

/* ─── spacing / size maps ───────────────────────────────────── */
const SPACING = {
  compact:  { section: 10, item: 6,  padV: 14, padH: 18 },
  normal:   { section: 16, item: 10, padV: 22, padH: 24 },
  spacious: { section: 24, item: 16, padV: 32, padH: 30 },
};
const RADIUS_MAP  = { none: 0, small: 4, medium: 8, large: 14 };
const NAME_PX     = { normal: 20, large: 27, xlarge: 34 };
const SB_WIDTH    = { narrow: '26%', medium: '32%', wide: '38%' };

function skillPct(i: number)  { return i < 3 ? 90 : i < 6 ? 78 : 66; }
function skillDots(i: number) { return i < 3 ? 5 : i < 6 ? 4 : 3; }

/* ─── inline SVG icon helper ────────────────────────────────── */
function SvgIcon({ d, size = 10, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}>
      <path d={d} />
    </svg>
  );
}

/* ─── icon path library ─────────────────────────────────────── */
const IC = {
  phone:    'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z',
  email:    'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  linkedin: 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
  github:   'M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z',
  globe:    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  summary:  'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  work:     'M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.47 0 12.33 0 9.19 0 6.67 2.53 6.67 5.64H4.33C3.03 5.64 2 6.67 2 7.97V19.64C2 20.94 3.03 22 4.33 22h15.34C20.97 22 22 20.94 22 19.64V7.97C22 6.67 20.97 6 20 6zm-8-4.5c1.47 0 2.67 1.2 2.67 2.67 0 1.47-1.2 2.67-2.67 2.67S9.33 5.64 9.33 4.17C9.33 2.7 10.53 1.5 12 1.5z',
  edu:      'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
  skills:   'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  projects: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  certs:    'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
  achieve:  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  refs:     'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
};

/* contact metadata: maps field to (value, icon) */
function contactMeta(c: CVData['contactSection']) {
  return [
    { value: c?.email,     icon: IC.email    },
    { value: c?.phone,     icon: IC.phone    },
    { value: c?.location,  icon: IC.location },
    { value: c?.linkedin,  icon: IC.linkedin },
    { value: c?.github,    icon: IC.github   },
    { value: c?.portfolio, icon: IC.globe    },
  ].filter(x => x.value) as { value: string; icon: string }[];
}

/* ─── skill block ───────────────────────────────────────────── */
function SkillsBlock({ skills, skillStyle, accentColor, primaryColor, radius, light = false }: {
  skills: string[]; skillStyle?: string;
  accentColor: string; primaryColor: string; radius: number; light?: boolean;
}) {
  if (!skills?.length) return null;
  if (skillStyle === 'progress-bar') return (
    <div>{skills.map((s, i) => (
      <div key={i} style={{ marginBottom: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: light ? 'rgba(255,255,255,0.85)' : '#444', marginBottom: 2 }}>
          <span>{s}</span><span style={{ color: accentColor }}>{skillPct(i)}%</span>
        </div>
        <div style={{ height: 3, background: light ? 'rgba(255,255,255,0.2)' : '#e5e7eb', borderRadius: 99 }}>
          <div style={{ height: '100%', width: `${skillPct(i)}%`, background: accentColor, borderRadius: 99 }} />
        </div>
      </div>
    ))}</div>
  );
  if (skillStyle === 'dots') return (
    <div>{skills.map((s, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 9, color: light ? 'rgba(255,255,255,0.85)' : '#444', flex: 1 }}>{s}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(d => (
            <div key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: d <= skillDots(i) ? accentColor : (light ? 'rgba(255,255,255,0.2)' : '#e5e7eb') }} />
          ))}
        </div>
      </div>
    ))}</div>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {skills.map((s, i) => (
        <span key={i} style={{ padding: '2px 7px', background: light ? `${accentColor}35` : `${accentColor}18`, border: `1px solid ${accentColor}55`, borderRadius: radius || 4, fontSize: 9, color: light ? 'rgba(255,255,255,0.9)' : primaryColor, fontWeight: 500 }}>{s}</span>
      ))}
    </div>
  );
}

/* ─── section container ─────────────────────────────────────── */
function SectionWrap({ sectionStyle, radius, accentColor, children }: { sectionStyle?: string; radius: number; accentColor: string; children: React.ReactNode }) {
  if (sectionStyle === 'boxed') return (
    <div style={{ border: `1px solid ${accentColor}30`, borderTop: `3px solid ${accentColor}`, borderRadius: radius, padding: '10px 12px' }}>{children}</div>
  );
  if (sectionStyle === 'shadowed') return (
    <div style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07),0 0 0 1px rgba(0,0,0,0.04)', borderRadius: radius, padding: '10px 12px', background: '#fff' }}>{children}</div>
  );
  return <>{children}</>;
}

/* ─── section title (with optional icon) ───────────────────── */
function SecTitle({ label, iconKey, primaryColor, accentColor, showDividers, boxed, showIcon }: {
  label: string; iconKey?: string; primaryColor: string; accentColor: string;
  showDividers: boolean; boxed?: boolean; showIcon?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: primaryColor, marginBottom: 7, paddingBottom: (showDividers && !boxed) ? 4 : 0, borderBottom: (showDividers && !boxed) ? `2px solid ${accentColor}` : 'none' }}>
      {showIcon && iconKey && IC[iconKey as keyof typeof IC] && (
        <SvgIcon d={IC[iconKey as keyof typeof IC]} size={9} color={accentColor} />
      )}
      {label}
    </div>
  );
}

/* ─── profile avatar ────────────────────────────────────────── */
function Avatar({ size, url, initial, accentColor, primaryColor, light }: {
  size: number; url?: string; initial: string; accentColor: string; primaryColor: string; light?: boolean;
}) {
  return url ? (
    <img src={url} alt="Profile" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accentColor}` }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${accentColor}40`, border: `3px solid ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: light ? '#fff' : primaryColor }}>
      {initial}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR LAYOUT
═══════════════════════════════════════════════════════════════ */
function SidebarLayout({ cvData, theme }: { cvData: CVData; theme: CustomTheme }) {
  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements, references } = cvData;
  const sp      = SPACING[theme.spacing] || SPACING.normal;
  const bullet  = theme.bulletChar ?? '•';
  const font    = theme.fontFamily === 'serif' ? "Georgia,'Times New Roman',serif" : "system-ui,-apple-system,Arial,sans-serif";
  const radius  = RADIUS_MAP[theme.cornerRadius ?? 'small'];
  const namePx  = NAME_PX[theme.nameSize ?? 'normal'];
  const sbBg    = theme.sidebarColor || theme.primaryColor;
  const sbW     = SB_WIDTH[theme.sidebarWidth ?? 'medium'];
  const initial = (c?.name || 'Y').charAt(0).toUpperCase();
  const isRight = theme.layout === 'sidebar-right';
  const contacts = contactMeta(c);
  const showIcons = theme.showContactIcons;
  const showSecIcons = theme.showSectionIcons;

  /* auto text color for sidebar */
  const hex = sbBg.replace('#', '');
  const rr = parseInt(hex.slice(0, 2), 16) || 0;
  const gg = parseInt(hex.slice(2, 4), 16) || 0;
  const bb = parseInt(hex.slice(4, 6), 16) || 0;
  const lum = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
  const sbText   = lum > 0.45 ? '#111' : '#fff';
  const sbMuted  = lum > 0.45 ? '#555' : 'rgba(255,255,255,0.6)';
  const sbDivide = lum > 0.45 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';
  const isLight  = lum > 0.45;

  const bulletSt: CSSProperties = { color: theme.accentColor, marginRight: 5, fontWeight: 700, flexShrink: 0 };

  const sbLabel = (text: string) => (
    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: sbMuted, marginBottom: 8 }}>{text}</div>
  );

  /* shape bridge between sidebar and main */
  const shapeBridge = (theme.sidebarShape === 'diagonal' || theme.sidebarShape === 'wave') ? (
    <div style={{ width: theme.sidebarShape === 'wave' ? 36 : 24, flexShrink: 0, alignSelf: 'stretch' }}>
      <svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none" style={{ display: 'block', height: '100%' }}>
        {theme.sidebarShape === 'diagonal' && (
          isRight
            ? <polygon points="1,0 0,1 1,1" fill={sbBg} />
            : <polygon points="0,0 0,1 1,1" fill={sbBg} />
        )}
        {theme.sidebarShape === 'wave' && (
          isRight
            ? <path d="M1,0 C0.4,0.25 1,0.5 0.3,0.75 C0,1 0.5,1 1,1 Z" fill={sbBg} />
            : <path d="M0,0 C0.6,0.25 0,0.5 0.7,0.75 C1,1 0.5,1 0,1 Z" fill={sbBg} />
        )}
      </svg>
    </div>
  ) : null;

  const sec = (title: string, iconKey: string, children: React.ReactNode) => (
    <div style={{ marginBottom: sp.section }}>
      <SectionWrap sectionStyle={theme.sectionStyle} radius={radius} accentColor={theme.accentColor}>
        <SecTitle label={title} iconKey={iconKey} primaryColor={theme.primaryColor} accentColor={theme.accentColor} showDividers={theme.showDividers} boxed={theme.sectionStyle === 'boxed'} showIcon={showSecIcons} />
        {children}
      </SectionWrap>
    </div>
  );

  const sidebar = (
    <div style={{ width: sbW, background: sbBg, flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* decorative accent shapes */}
      {theme.accentShapes && (
        <>
          <div style={{ position: 'absolute', bottom: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 80, right: 15, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        </>
      )}

      {/* Name / avatar area */}
      <div style={{ padding: '22px 16px 18px', background: `linear-gradient(150deg,${theme.primaryColor} 0%,${sbBg} 100%)`, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {theme.showProfileImage && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Avatar size={62} url={theme.profileImageUrl} initial={initial} accentColor={theme.accentColor} primaryColor={theme.primaryColor} light />
          </div>
        )}
        <div style={{ fontSize: namePx, fontWeight: 700, color: '#fff', lineHeight: 1.2, wordBreak: 'break-word' }}>
          {c?.name || 'Your Name'}
        </div>
        {c?.title && (
          <div style={{ fontSize: 9.5, color: theme.accentColor, fontWeight: 600, marginTop: 4, letterSpacing: '0.05em' }}>{c.title}</div>
        )}
        <div style={{ height: 2, background: theme.accentColor, margin: '10px auto 0', width: 36, borderRadius: 99 }} />
      </div>

      {/* Contact */}
      {contacts.length > 0 && (
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${sbDivide}`, position: 'relative', zIndex: 1 }}>
          {sbLabel('Contact')}
          {contacts.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 8.5, color: sbText, marginBottom: 5, wordBreak: 'break-all' }}>
              {showIcons
                ? <SvgIcon d={item.icon} size={9} color={theme.accentColor} />
                : <span style={{ color: theme.accentColor, flexShrink: 0 }}>›</span>
              }
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Technical skills */}
      {skills?.technical?.length > 0 && (
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${sbDivide}`, position: 'relative', zIndex: 1 }}>
          {sbLabel('Skills')}
          <SkillsBlock skills={skills.technical} skillStyle={theme.skillStyle} accentColor={theme.accentColor} primaryColor={theme.primaryColor} radius={radius} light={!isLight} />
        </div>
      )}

      {/* Soft skills */}
      {skills?.soft?.length > 0 && (
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${sbDivide}`, position: 'relative', zIndex: 1 }}>
          {sbLabel('Soft Skills')}
          {skills.soft.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 8.5, color: sbText, marginBottom: 3 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: theme.accentColor, flexShrink: 0 }} />
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {(skills?.languages?.length ?? 0) > 0 && (
        <div style={{ padding: '12px 14px', position: 'relative', zIndex: 1 }}>
          {sbLabel('Languages')}
          {skills!.languages!.map((lang, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 8.5, color: sbText, marginBottom: 3 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: theme.accentColor, flexShrink: 0 }} />
              {lang}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const main = (
    <div style={{ flex: 1, padding: `${sp.padV}px ${sp.padH}px`, fontFamily: font, fontSize: 11, color: '#1a1a1a', background: '#fff', minWidth: 0 }}>
      {professionalSummary && sec('Professional Summary', 'summary',
        <p style={{ margin: 0, color: '#333', fontSize: 11, lineHeight: 1.6 }}>{professionalSummary}</p>
      )}

      {workExperience?.length > 0 && sec('Work Experience', 'work',
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp.item }}>
          {workExperience.map((job, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                <div><span style={{ fontWeight: 700, color: '#111' }}>{job.company}</span><span style={{ color: '#555' }}> — {job.title}</span></div>
                <span style={{ fontSize: 8.5, color: '#888', flexShrink: 0 }}>{job.startDate} – {job.endDate}{job.location && ` · ${job.location}`}</span>
              </div>
              {(job.bullets || []).filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: 8, marginTop: 2 }}>
                  {bullet && <span style={bulletSt}>{bullet}</span>}
                  <span style={{ fontSize: 10.5, color: '#333' }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {education?.length > 0 && sec('Education', 'edu',
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp.item }}>
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              <div>
                <div style={{ fontWeight: 700, color: '#111', fontSize: 11 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                <div style={{ color: '#555', fontSize: 10 }}>{edu.school}</div>
                {edu.honors && <div style={{ color: '#777', fontSize: 9.5 }}>{edu.honors}</div>}
              </div>
              <div style={{ textAlign: 'right', fontSize: 8.5, color: '#888', flexShrink: 0 }}>
                <div>{edu.graduationYear}</div>
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && sec('Projects', 'projects',
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp.item }}>
          {(projects || []).map((proj, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, color: '#111' }}>{proj.name}</span>
                {(proj.github || proj.link) && <span style={{ fontSize: 8.5, color: theme.accentColor }}>{proj.github}{proj.github && proj.link && ' · '}{proj.link}</span>}
              </div>
              {proj.description && <p style={{ margin: '0 0 2px 8px', fontSize: 10.5, color: '#333' }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && <p style={{ margin: '0 0 0 8px', fontSize: 8.5, color: '#888' }}>{proj.technologies.join(', ')}</p>}
            </div>
          ))}
        </div>
      )}

      {certifications && certifications.length > 0 && sec('Certifications', 'certs',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {certifications.map((cert, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
              {bullet && <span style={bulletSt}>{bullet}</span>}
              <span style={{ fontSize: 11, color: '#333' }}>{cert}</span>
            </div>
          ))}
        </div>
      )}

      {achievements && achievements.filter(Boolean).length > 0 && sec('Achievements', 'achieve',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {achievements.filter(Boolean).map((ach, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
              {bullet && <span style={bulletSt}>{bullet}</span>}
              <span style={{ fontSize: 11, color: '#333' }}>{ach}</span>
            </div>
          ))}
        </div>
      )}

      {references && references.length > 0 && sec('References', 'refs',
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp.item }}>
          {(references || []).map((ref, i) => (
            <div key={i} style={{ minWidth: 160, flex: '1 1 160px' }}>
              <div style={{ fontWeight: 700, color: '#111', fontSize: 11 }}>{ref.name}</div>
              {ref.title && <div style={{ color: theme.accentColor, fontSize: 9.5, fontWeight: 600 }}>{ref.title}</div>}
              {ref.organization && <div style={{ color: '#555', fontSize: 9.5 }}>{ref.organization}</div>}
              {ref.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#666', marginTop: 2 }}>
                  {showIcons && <SvgIcon d={IC.email} size={8} color={theme.accentColor} />}
                  {ref.email}
                </div>
              )}
              {ref.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#666' }}>
                  {showIcons && <SvgIcon d={IC.phone} size={8} color={theme.accentColor} />}
                  {ref.phone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row', minHeight: 1100, background: '#fff' }}>
      {sidebar}
      {shapeBridge}
      {main}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STANDARD LAYOUT
═══════════════════════════════════════════════════════════════ */
function StandardLayout({ cvData, theme }: { cvData: CVData; theme: CustomTheme }) {
  const { contactSection: c, professionalSummary, workExperience, skills, education, certifications, projects, achievements, references } = cvData;
  const sp     = SPACING[theme.spacing] || SPACING.normal;
  const bullet = theme.bulletChar ?? '•';
  const font   = theme.fontFamily === 'serif' ? "Georgia,'Times New Roman',serif" : "system-ui,-apple-system,Arial,sans-serif";
  const radius = RADIUS_MAP[theme.cornerRadius ?? 'small'];
  const namePx = NAME_PX[theme.nameSize ?? 'normal'];
  const contacts = contactMeta(c);
  const showIcons = theme.showContactIcons;
  const showSecIcons = theme.showSectionIcons;
  const initial = (c?.name || 'Y').charAt(0).toUpperCase();
  const isBoxed = theme.sectionStyle === 'boxed';
  const bulletSt: CSSProperties = { color: theme.accentColor, marginRight: 5, fontWeight: 700, flexShrink: 0 };

  const secTitleSt = (): CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: theme.primaryColor, marginBottom: 7,
    paddingBottom: (theme.showDividers && !isBoxed) ? 4 : 0,
    borderBottom: (theme.showDividers && !isBoxed) ? `2px solid ${theme.accentColor}` : 'none',
  });

  const sec = (title: string, iconKey: string, children: React.ReactNode) => (
    <div style={{ marginBottom: sp.section }}>
      <SectionWrap sectionStyle={theme.sectionStyle} radius={radius} accentColor={theme.accentColor}>
        <div style={secTitleSt()}>
          {showSecIcons && IC[iconKey as keyof typeof IC] && <SvgIcon d={IC[iconKey as keyof typeof IC]} size={9} color={theme.accentColor} />}
          {title}
        </div>
        {children}
      </SectionWrap>
    </div>
  );

  /* ── Header ── */
  const renderContact = (inline = false) => contacts.map((item, i) => (
    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {inline && i > 0 && <span style={{ color: '#ddd', margin: '0 4px' }}>|</span>}
      {showIcons ? <SvgIcon d={item.icon} size={9} color={inline ? theme.accentColor : 'rgba(255,255,255,0.85)'} /> : null}
      {item.value}
    </span>
  ));

  const header = (() => {
    if (theme.headerStyle === 'banner') return (
      <div style={{ background: theme.primaryColor, color: '#fff', margin: `-${sp.padV}px -${sp.padH}px ${sp.section}px`, padding: `${sp.padV}px ${sp.padH}px` }}>
        {theme.showProfileImage && (
          <div style={{ float: 'right', marginLeft: 16, marginTop: 2 }}>
            <Avatar size={58} url={theme.profileImageUrl} initial={initial} accentColor={theme.accentColor} primaryColor={theme.primaryColor} light />
          </div>
        )}
        <h1 style={{ fontSize: namePx, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{c?.name || 'Your Name'}</h1>
        {c?.title && <div style={{ fontSize: 10.5, color: theme.accentColor, fontWeight: 600, marginTop: 3 }}>{c.title}</div>}
        <div style={{ fontSize: 9, marginTop: 6, opacity: 0.85, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
          {renderContact(false)}
        </div>
        <div style={{ height: 3, background: theme.accentColor, marginTop: 14, borderRadius: 2 }} />
      </div>
    );
    if (theme.headerStyle === 'lines') return (
      <div style={{ textAlign: 'center', marginBottom: sp.section }}>
        {theme.showProfileImage && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Avatar size={58} url={theme.profileImageUrl} initial={initial} accentColor={theme.accentColor} primaryColor={theme.primaryColor} />
          </div>
        )}
        <h1 style={{ fontSize: namePx, fontWeight: 700, color: theme.primaryColor, margin: 0 }}>{c?.name || 'Your Name'}</h1>
        {c?.title && <div style={{ fontSize: 10.5, color: theme.accentColor, fontWeight: 600, marginTop: 3 }}>{c.title}</div>}
        <div style={{ height: 2, background: theme.accentColor, margin: '8px 0' }} />
        <div style={{ fontSize: 9.5, color: '#555', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 10px' }}>
          {renderContact(true)}
        </div>
        <div style={{ height: 2, background: theme.accentColor, marginTop: 8 }} />
      </div>
    );
    // minimal
    return (
      <div style={{ marginBottom: sp.section }}>
        {theme.showProfileImage && (
          <div style={{ float: 'right', marginLeft: 12 }}>
            <Avatar size={54} url={theme.profileImageUrl} initial={initial} accentColor={theme.accentColor} primaryColor={theme.primaryColor} />
          </div>
        )}
        <h1 style={{ fontSize: namePx, fontWeight: 700, color: theme.primaryColor, margin: '0 0 2px' }}>{c?.name || 'Your Name'}</h1>
        {c?.title && <div style={{ fontSize: 10.5, color: theme.accentColor, fontWeight: 600, marginBottom: 4 }}>{c.title}</div>}
        <div style={{ fontSize: 9.5, color: '#666', display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
          {renderContact(false)}
        </div>
      </div>
    );
  })();

  return (
    <div style={{ fontFamily: font, fontSize: 12, lineHeight: 1.6, color: '#1a1a1a', background: '#fff', minHeight: 1100, padding: `${sp.padV}px ${sp.padH}px`, boxSizing: 'border-box' }}>
      {header}

      {professionalSummary && sec('Professional Summary', 'summary',
        <p style={{ margin: 0, color: '#333', fontSize: 11, lineHeight: 1.6 }}>{professionalSummary}</p>
      )}

      {workExperience?.length > 0 && sec('Work Experience', 'work',
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp.item }}>
          {workExperience.map((job, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                <div><span style={{ fontWeight: 700, color: '#111' }}>{job.company}</span><span style={{ color: '#555', fontWeight: 500 }}> — {job.title}</span></div>
                <span style={{ fontSize: 9, color: '#888', flexShrink: 0 }}>{job.startDate} – {job.endDate}{job.location && ` · ${job.location}`}</span>
              </div>
              {(job.bullets || []).filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: 10, marginTop: 2 }}>
                  {bullet && <span style={bulletSt}>{bullet}</span>}
                  <span style={{ fontSize: 11, color: '#333' }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && sec('Skills', 'skills',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {skills?.technical?.length > 0 && (
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 600, color: '#555', marginBottom: 5 }}>Technical</div>
              <SkillsBlock skills={skills.technical} skillStyle={theme.skillStyle} accentColor={theme.accentColor} primaryColor={theme.primaryColor} radius={radius} />
            </div>
          )}
          {skills?.soft?.length > 0 && (
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 600, color: '#555', marginBottom: 5 }}>Soft Skills</div>
              <SkillsBlock skills={skills.soft} skillStyle={theme.skillStyle === 'progress-bar' ? 'dots' : theme.skillStyle} accentColor={theme.accentColor} primaryColor={theme.primaryColor} radius={radius} />
            </div>
          )}
          {(skills?.languages?.length ?? 0) > 0 && (
            <div style={{ fontSize: 11, color: '#444' }}>
              <span style={{ fontWeight: 600 }}>Languages: </span>
              {skills!.languages!.join(', ')}
            </div>
          )}
        </div>
      )}

      {education?.length > 0 && sec('Education', 'edu',
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp.item }}>
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              <div>
                <div style={{ fontWeight: 700, color: '#111', fontSize: 11 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                <div style={{ color: '#555', fontSize: 10.5 }}>{edu.school}</div>
                {edu.honors && <div style={{ color: '#777', fontSize: 10 }}>{edu.honors}</div>}
              </div>
              <div style={{ textAlign: 'right', fontSize: 9, color: '#888', flexShrink: 0 }}>
                <div>{edu.graduationYear}</div>
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && sec('Projects', 'projects',
        <div style={{ display: 'flex', flexDirection: 'column', gap: sp.item }}>
          {(projects || []).map((proj, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, color: '#111' }}>{proj.name}</span>
                {(proj.github || proj.link) && <span style={{ fontSize: 9.5, color: theme.accentColor }}>{proj.github}{proj.github && proj.link && ' · '}{proj.link}</span>}
              </div>
              {proj.description && <p style={{ margin: '0 0 2px 10px', fontSize: 11, color: '#333' }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && <p style={{ margin: '0 0 0 10px', fontSize: 9.5, color: '#888' }}>{proj.technologies.join(', ')}</p>}
            </div>
          ))}
        </div>
      )}

      {certifications && certifications.length > 0 && sec('Certifications', 'certs',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {(certifications || []).map((cert, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
              {bullet && <span style={bulletSt}>{bullet}</span>}
              <span style={{ fontSize: 11, color: '#333' }}>{cert}</span>
            </div>
          ))}
        </div>
      )}

      {achievements && achievements.filter(Boolean).length > 0 && sec('Achievements & Awards', 'achieve',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {(achievements || []).filter(Boolean).map((ach, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
              {bullet && <span style={bulletSt}>{bullet}</span>}
              <span style={{ fontSize: 11, color: '#333' }}>{ach}</span>
            </div>
          ))}
        </div>
      )}

      {references && references.length > 0 && sec('References', 'refs',
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: sp.item }}>
          {(references || []).map((ref, i) => (
            <div key={i} style={{ minWidth: 170, flex: '1 1 170px' }}>
              <div style={{ fontWeight: 700, color: '#111', fontSize: 11 }}>{ref.name}</div>
              {ref.title && <div style={{ color: theme.accentColor, fontSize: 9.5, fontWeight: 600 }}>{ref.title}</div>}
              {ref.organization && <div style={{ color: '#555', fontSize: 9.5 }}>{ref.organization}</div>}
              {ref.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#666', marginTop: 2 }}>
                  {showIcons && <SvgIcon d={IC.email} size={8} color={theme.accentColor} />}
                  {ref.email}
                </div>
              )}
              {ref.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#666' }}>
                  {showIcons && <SvgIcon d={IC.phone} size={8} color={theme.accentColor} />}
                  {ref.phone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── public export ─────────────────────────────────────────── */
export function CustomTemplate({ cvData, theme }: { cvData: CVData; theme: CustomTheme }) {
  if (theme.layout === 'sidebar-left' || theme.layout === 'sidebar-right') {
    return <SidebarLayout cvData={cvData} theme={theme} />;
  }
  return <StandardLayout cvData={cvData} theme={theme} />;
}
