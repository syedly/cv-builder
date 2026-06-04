# 10 — API Routes

## Route Map

```
/api
├── auth/
│   └── [...nextauth]    POST/GET  NextAuth handler (login, logout, session)
│
├── user/
│   ├── profile          GET       Get user profile + tries remaining
│   └── history          GET       Get CV generation history (paginated)
│
├── byok/
│   ├── save             POST      Encrypt + save user's API key
│   ├── remove           DELETE    Remove stored API key
│   └── status           GET       Check if user has BYOK (no key returned)
│
├── job/
│   └── parse            POST      Parse job description → structured data
│
├── resume/
│   └── analyze          POST      Upload + analyze user's resume
│
└── cv/
    ├── generate         POST      Full pipeline: job + resume → CV (SSE)
    ├── [id]             GET       Get a specific CV generation
    ├── [id]/pdf         GET       Download CV as PDF
    └── [id]/docx        GET       Download CV as DOCX
```

---

## Detailed Route Specs

### POST /api/job/parse
```
Purpose: Parse job description, return structured data
Auth: Required

Request:
{
  type: "url" | "text",
  content: "https://linkedin.com/jobs/... or paste job text"
}

Response:
{
  jobHash: "md5hash",
  title: "Senior Software Engineer",
  company: "Acme Corp",
  required_skills: ["React", "TypeScript", "Node.js"],
  nice_to_have: ["GraphQL", "AWS"],
  keywords: ["full-stack", "scalable", "microservices"],
  seniority: "senior",
  industry: "Technology",
  cached: true/false
}

Errors:
  400 - Invalid URL or empty text
  401 - Not authenticated
  422 - Could not parse job details
```

### POST /api/resume/analyze
```
Purpose: Parse uploaded resume file or text
Auth: Required
Content-Type: multipart/form-data or application/json

Request (multipart):
  file: [PDF/DOCX/TXT binary]

Request (JSON):
  { text: "paste resume text here" }

Response:
{
  name: "John Doe",
  contact: { email, phone, linkedin, location },
  summary: "Current summary if exists",
  experience: [{ company, title, dates, bullets[] }],
  skills: ["JavaScript", "React"],
  education: [{ degree, school, year }],
  certifications: [],
  wordCount: 432,
  pageEstimate: 1
}
```

### POST /api/cv/generate (SSE)
```
Purpose: Run full agent pipeline, stream progress
Auth: Required
Content-Type: application/json

Request:
{
  jobHash: "md5hash",         // from /api/job/parse
  resumeData: {...} | null,   // from /api/resume/analyze or null
  userApiKey: "sk-..." | null // BYOK key (only sent if user has no stored key)
}

Streaming Response (text/event-stream):
  event: status
  data: {"step": "validating", "message": "Checking API access...", "pct": 5}

  event: status
  data: {"step": "job", "message": "Analyzing job requirements...", "pct": 20}

  event: status
  data: {"step": "resume", "message": "Processing your resume...", "pct": 40}

  event: status
  data: {"step": "building", "message": "Crafting your ATS resume...", "pct": 65}

  event: status
  data: {"step": "scoring", "message": "Running ATS optimization...", "pct": 85}

  event: status
  data: {"step": "rendering", "message": "Generating PDF & DOCX...", "pct": 95}

  event: complete
  data: {
    "generationId": "ObjectId",
    "atsScore": 87,
    "keywordsMatched": 23,
    "keywordsMissed": 3,
    "pdfUrl": "/api/cv/abc123/pdf",
    "docxUrl": "/api/cv/abc123/docx",
    "triesRemaining": 2
  }

  event: error
  data: {"code": "RATE_LIMIT", "message": "OpenAI rate limit. Retrying..."}

Errors (non-stream):
  401 - Not authenticated
  402 - No tries left AND no BYOK key
  422 - Invalid job hash
  500 - AI generation failed
```

### GET /api/cv/[id]/pdf
```
Purpose: Download generated CV as PDF
Auth: Required (must be owner)

Response:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="cv-senior-engineer-acme.pdf"
  [binary PDF]

Errors:
  403 - Not the owner
  404 - Generation not found
```

### GET /api/user/profile
```
Response:
{
  name: "John Doe",
  email: "john@email.com",
  freeTries: 2,
  hasByok: true,
  totalGenerations: 5
}
```

---

## Middleware Pattern

```typescript
// Every protected route:
export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 2. Get user
  await connectDB();
  const user = await User.findById(session.userId);
  
  // 3. Check tries / BYOK
  const apiKey = await resolveAPIKey(user, reqBody.userApiKey);
  if (!apiKey) return Response.json({ error: 'No API access' }, { status: 402 });
  
  // 4. Business logic
  // ...
}

async function resolveAPIKey(user: UserDoc, providedKey?: string): Promise<string | null> {
  // Priority: provided > stored BYOK > system key (if tries > 0)
  if (providedKey && await validateOpenAIKey(providedKey)) return providedKey;
  if (user.byokKeyEncrypted) return decryptAPIKey(user.byokKeyEncrypted, user.byokKeyIV!, user.byokKeyTag!);
  if (user.freeTries > 0) return process.env.OPENAI_API_KEY!;
  return null;
}
```
