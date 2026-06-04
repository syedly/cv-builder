# 🚀 AI CV Builder — ATS-Optimized Resume Generator

> **Next.js 14 · MongoDB · OpenAI GPT-4o · Multi-Agent Architecture · BYOK**

---

## 📁 Project Structure

```
ai-cv-system/
├── docs/
│   ├── 00-SYSTEM-OVERVIEW.md         ← Start here
│   ├── 01-ARCHITECTURE.md            ← Full system architecture
│   ├── 02-AUTH-FLOW.md               ← Login/Register/Session
│   ├── 03-JOB-ANALYSIS-AGENT.md      ← LinkedIn job scraping & parsing
│   ├── 04-RESUME-ANALYSIS-AGENT.md   ← User resume analyzer
│   ├── 05-CV-BUILDER-AGENT.md        ← ATS CV generation engine
│   ├── 06-ATS-SCORING-AGENT.md       ← ATS score & keyword gap
│   ├── 07-BYOK-SYSTEM.md             ← Bring Your Own Key concept
│   ├── 08-TRIAL-SYSTEM.md            ← 3 free tries logic
│   ├── 09-DATABASE-SCHEMA.md         ← MongoDB collections
│   ├── 10-API-ROUTES.md              ← All API endpoints
│   ├── 11-UI-COMPONENTS.md           ← Frontend component map
│   ├── 12-DEPLOYMENT.md              ← Vercel + MongoDB Atlas setup
│   └── flows/
│       ├── MAIN-FLOW.md              ← End-to-end user journey
│       ├── AGENT-ORCHESTRATION.md    ← How agents talk to each other
│       └── ERROR-HANDLING.md         ← Retry/fallback strategies
│
├── src/
│   ├── app/                          ← Next.js 14 App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── builder/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── cv/generate/route.ts
│   │   │   ├── cv/analyze/route.ts
│   │   │   ├── job/parse/route.ts
│   │   │   ├── user/tries/route.ts
│   │   │   └── byok/validate/route.ts
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                       ← Shadcn + custom components
│   │   ├── cv/                       ← CV preview & editor
│   │   ├── job/                      ← Job input form
│   │   └── auth/                     ← Auth forms
│   │
│   ├── agents/
│   │   ├── orchestrator.ts           ← Master agent controller
│   │   ├── jobAnalysisAgent.ts
│   │   ├── resumeAnalysisAgent.ts
│   │   ├── cvBuilderAgent.ts
│   │   └── atsScoringAgent.ts
│   │
│   └── lib/
│       ├── mongodb.ts
│       ├── openai.ts
│       ├── atsKeywords.ts
│       └── templates/
│           └── referenceResume.ts
```

---

## ⚡ Quick Start

```bash
git clone <repo>
cd ai-cv-system
npm install
cp .env.example .env.local
# Fill in MongoDB URI, NextAuth secret, OpenAI key (optional - users bring their own)
npm run dev
```

---

## 🔑 Environment Variables

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...  # System key for 3 free trials only
ENCRYPTION_KEY=32-char-key-for-encrypting-user-api-keys
```

---

## 📖 Read the Docs in Order

1. `docs/00-SYSTEM-OVERVIEW.md` — Big picture
2. `docs/flows/MAIN-FLOW.md` — User journey
3. `docs/01-ARCHITECTURE.md` — Technical deep dive
4. Individual agent docs for implementation details
