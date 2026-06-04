import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJobAnalysis extends Document {
  jobHash: string;
  title: string;
  company: string;
  required_skills: string[];
  nice_to_have: string[];
  keywords: string[];
  seniority: string;
  industry: string;
  culture_cues: string[];
  employment_type: string;
  location: string;
  hitCount: number;
  createdAt: Date;
  expiresAt: Date;
}

const JobAnalysisSchema = new Schema<IJobAnalysis>({
  jobHash: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  required_skills: [{ type: String }],
  nice_to_have: [{ type: String }],
  keywords: [{ type: String }],
  seniority: { type: String, default: 'mid' },
  industry: { type: String, default: '' },
  culture_cues: [{ type: String }],
  employment_type: { type: String, default: 'Full-time' },
  location: { type: String, default: '' },
  hitCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

JobAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const JobAnalysis: Model<IJobAnalysis> =
  mongoose.models.JobAnalysis ||
  mongoose.model<IJobAnalysis>('JobAnalysis', JobAnalysisSchema);

export default JobAnalysis;
