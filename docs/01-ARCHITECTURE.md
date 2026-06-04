# 01 — Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
│                                                                     │
│  Next.js 14 App Router · Tailwind CSS · Lucide React                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │  /login  │ │/register │ │/dashboard│ │   /builder           │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘  │
│                                          ┌──────────────────────┐  │
│                                          │  Job Input Form      │  │
│                                          │  Resume Upload       │  │
│                                          │  Progress Stream     │  │
│                                          │  CV Preview (PDF)    │  │
│                                          │  ATS Score Report    │  │
│                                          └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────────┐
│                      NEXT.JS SERVER (Vercel)                         │
│                                                                     │
│  App Router API Routes (/app/api/*)                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  /api/auth     /api/job     /api/resume    /api/cv    /api/byok│ │
│  └──────────────────────┬─────────────────────────────────────────┘ │
│                         │                                          │
│  ┌──────────────────────▼─────────────────────────────────────┐   │
│  │                   AGENT LAYER                               │   │
│  │                                                             │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐    │   │
│  │  │ Orchestrator │ │ Job Analysis │ │ Resume Analysis │    │   │
│  │  └──────┬───────┘ └──────────────┘ └─────────────────┘    │   │
│  │         │         ┌──────────────┐ ┌─────────────────┐    │   │
│  │         └────────►│  CV Builder  │ │  ATS Scorer     │    │   │
│  │                   └──────────────┘ └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   UTILITY LAYER                              │  │
│  │  pdf-lib (PDF gen) · mammoth (DOCX parse) · pdf-parse       │  │
│  │  encryption (AES-256) · zod (validation) · next-auth        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────┬─────────────────────────────────────┬───────────────────┘
           │                                     │
┌──────────▼──────────┐               ┌──────────▼──────────┐
│   MongoDB Atlas      │               │   OpenAI API        │
│                     │               │                     │
│   • users           │               │   GPT-4o            │
│   • cv_generations  │               │   (system key OR    │
│   • job_analyses    │               │    user BYOK)       │
│   • sessions        │               │                     │
└─────────────────────┘               └─────────────────────┘
```

---

## Request Lifecycle: CV Generation

```
1. User clicks "Generate CV"
   ↓
2. Client: POST /api/cv/generate with SSE
   ↓
3. Server middleware: validate session JWT
   ↓
4. Resolve API key (BYOK / system / deny)
   ↓
5. Orchestrator.runPipeline() starts
   ↓
6. PARALLEL:
   ├── JobAnalysisAgent.run()
   │   ├── Check job_analyses cache (MongoDB)
   │   ├── Cache hit? Return cached result
   │   └── Cache miss? Call GPT-4o → parse → cache → return
   │
   └── ResumeAnalysisAgent.run()
       ├── User has file? Parse PDF/DOCX with pdf-parse/mammoth
       ├── User pasted text? Use as-is
       └── No resume? Return null
   ↓
7. CVBuilderAgent.run(jobAnalysis, resumeAnalysis)
   ├── Load reference resume template
   ├── Build GPT-4o prompt with all context
   ├── Call GPT-4o with JSON mode
   └── Parse + validate output schema
   ↓
8. ATSScoringAgent.run(cvData, jobAnalysis)
   ├── Keyword match analysis
   ├── Format rule checks
   └── Return score + report
   ↓
9. PDF + DOCX generation
   ├── Render CV sections to PDF
   └── Render CV sections to DOCX
   ↓
10. Save CVGeneration to MongoDB
    ├── Decrement user.freeTries (if used system key)
    └── Push generationId to user.cvGenerations
    ↓
11. SSE: emit "complete" event with result
    ↓
12. Client: show CV preview + ATS report
```

---

## Performance Optimizations

### Caching
- Job descriptions cached by MD5 hash (7-day TTL)
- Same job posted by multiple users → only analyzed once
- Saves ~2-3 seconds per cached job

### Parallelism
- Job Analysis + Resume Analysis run concurrently
- Saves ~3 seconds compared to sequential

### Streaming
- SSE streaming so UI updates in real-time
- User sees progress, not a blank loading screen

### OpenAI Settings
- `temperature: 0.3` → consistent, professional output
- `response_format: { type: 'json_object' }` → no JSON parsing errors
- `max_tokens: 2000` → sufficient for 1-2 page CV

### Database
- Mongoose connection pooling (maxPoolSize: 10)
- Global connection cache prevents new connections per request
- Proper indexes on hot query paths

---

## Folder Structure: Full Detail

```
src/
├── app/
│   ├── layout.tsx              ← Root layout with providers
│   ├── page.tsx                ← Landing page (/ route)
│   │
│   ├── (auth)/                 ← Auth route group (no dashboard nav)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/            ← Authenticated route group
│   │   ├── layout.tsx          ← Dashboard shell with nav
│   │   ├── dashboard/
│   │   │   └── page.tsx        ← Home: stats, history, new button
│   │   ├── builder/
│   │   │   └── page.tsx        ← Multi-step CV builder
│   │   └── history/
│   │       └── page.tsx        ← All past CVs
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── user/
│       │   ├── profile/route.ts
│       │   └── history/route.ts
│       ├── byok/
│       │   ├── save/route.ts
│       │   ├── remove/route.ts
│       │   └── status/route.ts
│       ├── job/
│       │   └── parse/route.ts
│       ├── resume/
│       │   └── analyze/route.ts
│       └── cv/
│           ├── generate/route.ts   ← SSE streaming route
│           └── [id]/
│               ├── route.ts
│               ├── pdf/route.ts
│               └── docx/route.ts
│
├── components/
│   ├── ui/                     ← Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Progress.tsx
│   │   └── Modal.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── StatsBar.tsx        ← Tries remaining, BYOK status
│   │   ├── CVHistoryCard.tsx
│   │   └── WelcomeHero.tsx
│   ├── builder/
│   │   ├── JobInputStep.tsx    ← Step 1
│   │   ├── ResumeUploadStep.tsx ← Step 2
│   │   ├── GenerateStep.tsx    ← Step 3 + progress
│   │   └── ResultsPanel.tsx    ← Final CV + score
│   ├── cv/
│   │   ├── CVPreview.tsx       ← Renders CV as formatted HTML
│   │   └── ATSReport.tsx       ← Score breakdown UI
│   └── shared/
│       ├── Navbar.tsx
│       ├── BYOKModal.tsx
│       └── TriesCounter.tsx
│
├── agents/
│   ├── orchestrator.ts
│   ├── jobAnalysisAgent.ts
│   ├── resumeAnalysisAgent.ts
│   ├── cvBuilderAgent.ts
│   └── atsScoringAgent.ts
│
├── lib/
│   ├── mongodb.ts              ← DB connection + cache
│   ├── openai.ts               ← OpenAI client factory
│   ├── encryption.ts           ← AES-256-GCM for BYOK keys
│   ├── fileParser.ts           ← PDF/DOCX/TXT parsing
│   ├── pdfGenerator.ts         ← pdf-lib CV renderer
│   ├── docxGenerator.ts        ← docx package CV renderer
│   ├── atsKeywords.ts          ← Industry keyword dictionaries
│   └── templates/
│       └── referenceResume.ts
│
└── models/
    ├── User.ts
    ├── CVGeneration.ts
    └── JobAnalysis.ts
```
