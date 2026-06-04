# 09 — Database Schema (MongoDB)

## Collections Overview

```
MongoDB Database: ai-cv-builder
│
├── users              ← User accounts, auth, tries, BYOK
├── cv_generations     ← Every CV generated (history)
├── job_analyses       ← Parsed job descriptions (cached)
└── sessions           ← NextAuth sessions (auto-managed)
```

---

## users Collection

```typescript
{
  _id: ObjectId,
  
  // Auth
  name:           String,          // "John Doe"
  email:          String,          // unique, indexed
  passwordHash:   String,          // bcrypt hash
  
  // Trial system
  freeTries:      Number,          // starts at 3, decrements
  
  // BYOK
  byokKeyEncrypted: String | null, // AES-256-GCM encrypted key
  byokKeyIV:        String | null, // hex encoded IV
  byokKeyTag:       String | null, // auth tag
  
  // History references
  cvGenerations:  [ObjectId],      // refs to cv_generations
  
  // Metadata
  createdAt:      Date,
  updatedAt:      Date,
  lastActiveAt:   Date,
}

Indexes:
  { email: 1 } unique
  { createdAt: -1 }
```

---

## cv_generations Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // ref to users
  
  // Input
  jobTitle:       String,
  jobCompany:     String,
  jobDescription: String,        // original job text
  hasUserResume:  Boolean,
  
  // Agent outputs
  jobAnalysis:    Object,        // full jobAnalysis result
  resumeAnalysis: Object | null, // null if no resume provided
  cvData:         Object,        // structured CV sections
  atsScore:       Number,        // 0-100
  atsReport:      Object,        // full ATS scoring result
  
  // Generated files
  pdfUrl:         String,        // path to generated PDF
  docxUrl:        String,        // path to generated DOCX
  
  // Meta
  model:          String,        // "gpt-4o"
  usedByok:       Boolean,
  processingMs:   Number,        // total generation time
  createdAt:      Date,
}

Indexes:
  { userId: 1, createdAt: -1 }  // for user history
  { createdAt: -1 }             // for admin
```

---

## job_analyses Collection (Cache)

```typescript
{
  _id: ObjectId,
  
  // Cache key
  jobHash:        String,  // MD5 of job description text, indexed unique
  
  // Parsed result
  title:          String,
  company:        String,
  required_skills: [String],
  nice_to_have:   [String],
  keywords:       [String],
  seniority:      String,  // "junior" | "mid" | "senior" | "lead"
  industry:       String,
  culture_cues:   [String],
  
  // Cache management
  hitCount:       Number,  // how many times this was reused
  createdAt:      Date,
  expiresAt:      Date,    // TTL: 7 days
}

Indexes:
  { jobHash: 1 } unique
  { expiresAt: 1 } TTL index (auto-delete expired)
```

---

## Mongoose Connection

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}
```

---

## Key Queries

```typescript
// Get user with BYOK status (no key exposed)
const user = await User.findById(userId).select(
  'name email freeTries byokKeyEncrypted'
);

// Decrement trial
await User.findByIdAndUpdate(userId, { $inc: { freeTries: -1 } });

// Save CV generation
const gen = await CVGeneration.create({
  userId,
  jobTitle: jobAnalysis.title,
  // ...
});
await User.findByIdAndUpdate(userId, {
  $push: { cvGenerations: gen._id }
});

// Get user history (paginated)
const history = await CVGeneration
  .find({ userId })
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(page * 10)
  .select('jobTitle jobCompany atsScore createdAt pdfUrl');

// Cache job analysis
const existing = await JobAnalysis.findOne({ jobHash });
if (existing) {
  await JobAnalysis.findByIdAndUpdate(existing._id, { $inc: { hitCount: 1 } });
  return existing;
}
```
