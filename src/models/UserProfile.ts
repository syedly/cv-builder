import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  bullets: string[];
}

export interface IEducation {
  id: string;
  degree: string;
  field: string;
  school: string;
  startYear: string;
  graduationYear: string;
  gpa: string;
  honors: string;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  github: string;
  link: string;
  highlights: string[];
}

export interface ICertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credentialId: string;
  link: string;
}

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  desiredTitle: string;
  summary: string;
  workExperience: IWorkExperience[];
  education: IEducation[];
  technicalSkills: string[];
  softSkills: string[];
  languages: string[];
  projects: IProject[];
  certifications: ICertification[];
  achievements: string[];
  updatedAt: Date;
}

const WorkExperienceSchema = new Schema({
  id: String,
  company: String,
  title: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  location: String,
  bullets: [String],
}, { _id: false });

const EducationSchema = new Schema({
  id: String,
  degree: String,
  field: String,
  school: String,
  startYear: String,
  graduationYear: String,
  gpa: String,
  honors: String,
}, { _id: false });

const ProjectSchema = new Schema({
  id: String,
  name: String,
  description: String,
  technologies: [String],
  github: String,
  link: String,
  highlights: [String],
}, { _id: false });

const CertificationSchema = new Schema({
  id: String,
  name: String,
  issuer: String,
  year: String,
  credentialId: String,
  link: String,
}, { _id: false });

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  website: { type: String, default: '' },
  desiredTitle: { type: String, default: '' },
  summary: { type: String, default: '' },
  workExperience: { type: [WorkExperienceSchema], default: [] },
  education: { type: [EducationSchema], default: [] },
  technicalSkills: { type: [String], default: [] },
  softSkills: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  projects: { type: [ProjectSchema], default: [] },
  certifications: { type: [CertificationSchema], default: [] },
  achievements: { type: [String], default: [] },
}, { timestamps: true });

const UserProfile = mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
export default UserProfile;
