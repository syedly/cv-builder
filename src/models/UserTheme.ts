import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserTheme extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: 'sans' | 'serif';
  headerStyle: 'banner' | 'lines' | 'minimal';
  spacing: 'compact' | 'normal' | 'spacious';
  bulletChar: string;
  showDividers: boolean;
  layout: 'standard' | 'sidebar-left' | 'sidebar-right';
  sidebarColor: string;
  sectionStyle: 'plain' | 'boxed' | 'shadowed';
  cornerRadius: 'none' | 'small' | 'medium' | 'large';
  skillStyle: 'tags' | 'progress-bar' | 'dots';
  nameSize: 'normal' | 'large' | 'xlarge';
  showProfileImage: boolean;
  profileImageUrl: string;
  sidebarShape: 'straight' | 'diagonal' | 'wave';
  sidebarWidth: 'narrow' | 'medium' | 'wide';
  accentShapes: boolean;
  showContactIcons: boolean;
  showSectionIcons: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserThemeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    primaryColor: { type: String, default: '#1a44b3' },
    accentColor: { type: String, default: '#2563eb' },
    fontFamily: { type: String, enum: ['sans', 'serif'], default: 'sans' },
    headerStyle: { type: String, enum: ['banner', 'lines', 'minimal'], default: 'lines' },
    spacing: { type: String, enum: ['compact', 'normal', 'spacious'], default: 'normal' },
    bulletChar: { type: String, default: '•' },
    showDividers: { type: Boolean, default: true },
    layout: { type: String, enum: ['standard', 'sidebar-left', 'sidebar-right'], default: 'standard' },
    sidebarColor: { type: String, default: '#1e293b' },
    sectionStyle: { type: String, enum: ['plain', 'boxed', 'shadowed'], default: 'plain' },
    cornerRadius: { type: String, enum: ['none', 'small', 'medium', 'large'], default: 'small' },
    skillStyle: { type: String, enum: ['tags', 'progress-bar', 'dots'], default: 'tags' },
    nameSize: { type: String, enum: ['normal', 'large', 'xlarge'], default: 'normal' },
    showProfileImage: { type: Boolean, default: false },
    profileImageUrl: { type: String, default: '' },
    sidebarShape: { type: String, enum: ['straight', 'diagonal', 'wave'], default: 'straight' },
    sidebarWidth: { type: String, enum: ['narrow', 'medium', 'wide'], default: 'medium' },
    accentShapes: { type: Boolean, default: false },
    showContactIcons: { type: Boolean, default: true },
    showSectionIcons: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserTheme: Model<IUserTheme> = mongoose.models.UserTheme || mongoose.model<IUserTheme>('UserTheme', UserThemeSchema);
export default UserTheme;
