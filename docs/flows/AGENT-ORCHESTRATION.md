# AGENT ORCHESTRATION — How Agents Work Together

## Agent Architecture

```
                    ┌───────────────────────────────┐
                    │        ORCHESTRATOR            │
                    │                               │
                    │  • Receives user inputs        │
                    │  • Manages agent queue         │
                    │  • Passes context between      │
                    │    agents                      │
                    │  • Streams status to UI        │
                    │  • Handles retries             │
                    │  • Returns final output        │
                    └──────────────┬────────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
    ┌──────────▼─────────┐         │        ┌──────────▼──────────┐
    │  JOB ANALYSIS       │         │        │  RESUME ANALYSIS    │
    │  AGENT              │         │        │  AGENT              │
    │                    │         │        │                     │
    │  Input:            │         │        │  Input:             │
    │  • Job URL/text    │         │        │  • Resume file/text │
    │                    │         │        │                     │
    │  Output:           │         │        │  Output:            │
    │  {                 │         │        │  {                  │
    │   title,           │         │        │   name,             │
    │   company,         │         │        │   contact,          │
    │   required_skills, │         │        │   summary,          │
    │   nice_to_have,    │         │        │   experience[],     │
    │   keywords[],      │         │        │   skills[],         │
    │   seniority,       │         │        │   education[],      │
    │   industry,        │         │        │   match_score,      │
    │   culture_cues[]   │         │        │   skill_gaps[]      │
    │  }                 │         │        │  }                  │
    └──────────┬─────────┘         │        └──────────┬──────────┘
               │                   │                   │
               └───────────────────┼───────────────────┘
                                   │ (both outputs merged)
                    ┌──────────────▼────────────────┐
                    │       CV BUILDER AGENT         │
                    │                               │
                    │  Input:                       │
                    │  • jobAnalysis output          │
                    │  • resumeAnalysis output       │
                    │  • referenceResume template    │
                    │                               │
                    │  Process:                     │
                    │  1. Load reference template    │
                    │  2. Map user data → sections   │
                    │  3. Inject job keywords        │
                    │  4. Rewrite experience bullets │
                    │  5. Generate professional summ │
                    │  6. Order sections for ATS     │
                    │                               │
                    │  Output:                      │
                    │  {                            │
                    │   cv_text (structured),       │
                    │   sections{},                 │
                    │   keywords_used[],            │
                    │   raw_markdown                │
                    │  }                            │
                    └──────────────┬────────────────┘
                                   │
                    ┌──────────────▼────────────────┐
                    │      ATS SCORING AGENT         │
                    │                               │
                    │  Input:                       │
                    │  • cv_builder output           │
                    │  • jobAnalysis keywords        │
                    │                               │
                    │  Process:                     │
                    │  1. Count keyword matches      │
                    │  2. Check format rules         │
                    │  3. Detect ATS red flags       │
                    │  4. Calculate score            │
                    │                               │
                    │  Output:                      │
                    │  {                            │
                    │   score: 87,                  │
                    │   keyword_match: 23/26,       │
                    │   missing_keywords: [],       │
                    │   format_issues: [],          │
                    │   suggestions: []             │
                    │  }                            │
                    └──────────────┬────────────────┘
                                   │
                    ┌──────────────▼────────────────┐
                    │        PDF/DOCX GENERATOR      │
                    │  • Renders CV as clean PDF     │
                    │  • Generates DOCX for editing  │
                    │  • Saves to MongoDB GridFS      │
                    └───────────────────────────────┘
```

---

## Agent Prompt Architecture

### System Prompt Strategy
Each agent has:
1. **Role definition** — What it is and what it does
2. **Output format** — Strict JSON schema with examples
3. **Constraints** — What to avoid, edge cases
4. **Reference data** — Keywords, templates, ATS rules

### Context Passing
```typescript
// orchestrator.ts
interface AgentContext {
  userId: string;
  sessionId: string;
  apiKey: string; // system or BYOK
  
  // Populated progressively
  jobInput?: string;
  resumeInput?: string;
  jobAnalysis?: JobAnalysisResult;
  resumeAnalysis?: ResumeAnalysisResult;
  cvOutput?: CVBuilderResult;
  atsScore?: ATSScoringResult;
}

// Agents receive full context, only use what they need
async function runPipeline(ctx: AgentContext): Promise<FinalOutput> {
  // Run job + resume agents in PARALLEL for speed
  const [jobResult, resumeResult] = await Promise.all([
    runJobAgent(ctx),
    runResumeAgent(ctx),
  ]);
  
  ctx.jobAnalysis = jobResult;
  ctx.resumeAnalysis = resumeResult;
  
  // Sequential: CV builder needs both
  ctx.cvOutput = await runCVBuilderAgent(ctx);
  ctx.atsScore = await runATSScoringAgent(ctx);
  
  return buildFinalOutput(ctx);
}
```

---

## Streaming to UI

```
Server (Next.js API Route)          Client (React)
        │                                  │
        │ POST /api/cv/generate            │
        │◄─────────────────────────────────│
        │                                  │
        │ SSE Stream opens                 │
        │──────────────────────────────────►
        │                                  │
        │ event: status                    │
        │ data: {"step":"job","pct":10}    │
        │──────────────────────────────────►
        │                                  │
        │ event: status                    │
        │ data: {"step":"resume","pct":30} │
        │──────────────────────────────────►
        │                                  │
        │ event: status                    │
        │ data: {"step":"build","pct":60}  │
        │──────────────────────────────────►
        │                                  │
        │ event: status                    │
        │ data: {"step":"score","pct":85}  │
        │──────────────────────────────────►
        │                                  │
        │ event: complete                  │
        │ data: {cvId, score, downloadUrl} │
        │──────────────────────────────────►
        │                                  │
        │ SSE Stream closes                │
```

---

## Retry Strategy

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      
      // Exponential backoff
      await sleep(delayMs * Math.pow(2, attempt - 1));
      
      // If rate limit, wait longer
      if (err.status === 429) await sleep(5000);
    }
  }
}
```
