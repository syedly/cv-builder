import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICVGeneration extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
  hasUserResume: boolean;
  jobAnalysis: Record<string, unknown>;
  resumeAnalysis: Record<string, unknown> | null;
  cvData: Record<string, unknown>;
  atsScore: number;
  atsReport: Record<string, unknown>;
  pdfData: Buffer | null;
  docxData: Buffer | null;
  aiModel: string;
  usedByok: boolean;
  processingMs: number;
  createdAt: Date;
}

const CVGenerationSchema = new Schema<ICVGeneration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobTitle: { type: String, required: true },
    jobCompany: { type: String, default: '' },
    jobDescription: { type: String, required: true },
    hasUserResume: { type: Boolean, default: false },
    jobAnalysis: { type: Schema.Types.Mixed, default: {} },
    resumeAnalysis: { type: Schema.Types.Mixed, default: null },
    cvData: { type: Schema.Types.Mixed, default: {} },
    atsScore: { type: Number, default: 0 },
    atsReport: { type: Schema.Types.Mixed, default: {} },
    pdfData: { type: Buffer, default: null },
    docxData: { type: Buffer, default: null },
    aiModel: { type: String, default: 'gpt-4o' },
    usedByok: { type: Boolean, default: false },
    processingMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CVGenerationSchema.index({ userId: 1, createdAt: -1 });
CVGenerationSchema.index({ createdAt: -1 });

const CVGeneration: Model<ICVGeneration> =
  mongoose.models.CVGeneration ||
  mongoose.model<ICVGeneration>('CVGeneration', CVGenerationSchema);

export default CVGeneration;
