import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  freeTries: number;
  byokKeyEncrypted: string | null;
  byokKeyIV: string | null;
  byokKeyTag: string | null;
  cvGenerations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    freeTries: { type: Number, default: 3, min: 0 },
    byokKeyEncrypted: { type: String, default: null },
    byokKeyIV: { type: String, default: null },
    byokKeyTag: { type: String, default: null },
    cvGenerations: [{ type: Schema.Types.ObjectId, ref: 'CVGeneration' }],
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ createdAt: -1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
