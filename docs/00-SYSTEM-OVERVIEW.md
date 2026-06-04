# 00 — System Overview

## What This System Does

The **AI CV Builder** takes a LinkedIn job description and a user's existing resume (or nothing at all), then uses a multi-agent AI pipeline to produce a **100% ATS-optimized CV** tailored precisely to that job.

---

## Core Value Proposition

| Problem | Our Solution |
|---|---|
| Generic resumes get filtered by ATS | Keyword-matched, structured CV output |
| Users don't know what to write | AI analyzes job and fills intelligently |
| No resume? No problem | Template-based generation from scratch |
| Expensive AI calls | BYOK (Bring Your Own Key) for unlimited access |
| Unlimited abuse | 3 free trials, then require own API key |

---

## System at a Glance

```
USER
 │
 ├─ Pastes LinkedIn Job URL / Job Description
 ├─ Uploads Resume (optional — PDF/DOCX/text)
 └─ Enters BYOK OpenAI key (optional — else uses 3 free tries)
         │
         ▼
┌─────────────────────────────────────────────────┐
│              ORCHESTRATOR AGENT                  │
│  Coordinates all sub-agents, manages state       │
└─────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
[JOB       [RESUME
 AGENT]     AGENT]
    │         │
    └────┬────┘
         ▼
   [CV BUILDER AGENT]
         │
         ▼
   [ATS SCORING AGENT]
         │
         ▼
   ATS-Optimized CV (PDF + DOCX)
```

---

## Key Features

### 🎯 ATS Optimization
- Keyword extraction from job description
- Skill gap analysis against user resume
- Proper section ordering (Summary → Experience → Skills → Education)
- Clean formatting — no tables, columns, graphics (ATS-unfriendly)
- Action verb injection per bullet point
- Quantification prompts where data is missing

### 🤖 Multi-Agent Architecture
- **Orchestrator** — Manages agent pipeline, handles errors, retries
- **Job Analysis Agent** — Parses job title, required skills, nice-to-haves, company culture
- **Resume Analysis Agent** — Extracts structured data from uploaded resume
- **CV Builder Agent** — Combines job + resume data into a tailored CV
- **ATS Scoring Agent** — Scores the output and flags issues

### 🔑 BYOK (Bring Your Own Key)
- Users get **3 free generations** using system OpenAI key
- After 3, they must provide their own OpenAI API key
- Keys stored encrypted in MongoDB (AES-256)
- Users can remove their key at any time

### 🔐 Auth System
- Email/password login with NextAuth.js
- JWT sessions, bcrypt password hashing
- Per-user trial counter stored in MongoDB
- Session middleware protects all API routes

### 📄 Reference Resume Template
- System ships with a professionally crafted reference resume
- Used as structural/style guide for all generated CVs
- Defines section order, formatting rules, tone

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS + Lucide React |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | NextAuth.js v5 |
| AI | OpenAI GPT-4o (via API) |
| PDF Gen | pdf-lib / puppeteer |
| File Parse | pdf-parse, mammoth (DOCX) |
| Encryption | Node.js crypto (AES-256-GCM) |
| Deployment | Vercel + MongoDB Atlas |

---

## Performance Targets

- Job analysis: < 3 seconds
- CV generation: < 8 seconds total
- ATS scoring: < 2 seconds
- Page load (dashboard): < 1 second
- All AI calls streamed to UI for perceived speed
