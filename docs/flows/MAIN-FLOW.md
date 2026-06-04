# MAIN FLOW — End-to-End User Journey

## Complete Flow Diagram

```
╔══════════════════════════════════════════════════════════════════╗
║                     USER VISITS APP                              ║
╚══════════════════════════════════════════════════════════════════╝
                              │
                    ┌─────────▼─────────┐
                    │  Is User Logged In? │
                    └─────────┬─────────┘
                    NO ◄──────┘──────► YES
                    │                   │
           ┌────────▼────────┐   ┌──────▼──────┐
           │  /login or      │   │  /dashboard  │
           │  /register      │   └──────┬──────┘
           └────────┬────────┘          │
                    │          ┌────────▼────────────────────┐
                    │          │      DASHBOARD               │
                    │          │  ┌──────────────────────┐   │
                    │          │  │ Tries Counter: X/3   │   │
                    │          │  │ BYOK Status: ✓/✗     │   │
                    │          │  │ Past CVs: [list]     │   │
                    │          │  └──────────────────────┘   │
                    │          └────────┬────────────────────┘
                    │                   │
           ┌────────▼────────┐   ┌──────▼──────────────┐
           │  Auth Complete  │──►│   Click "New CV"     │
           └─────────────────┘   └──────┬──────────────┘
                                         │
                    ╔════════════════════▼════════════════════╗
                    ║           CV BUILDER PAGE                ║
                    ╠══════════════════════════════════════════╣
                    ║                                          ║
                    ║  STEP 1: Job Details                     ║
                    ║  ┌────────────────────────────────────┐  ║
                    ║  │ Option A: Paste LinkedIn URL        │  ║
                    ║  │ Option B: Paste Job Description     │  ║
                    ║  └────────────────────────────────────┘  ║
                    ║                    │                     ║
                    ║  STEP 2: Your Resume (Optional)          ║
                    ║  ┌────────────────────────────────────┐  ║
                    ║  │ Upload PDF/DOCX/TXT                 │  ║
                    ║  │ OR paste resume text                │  ║
                    ║  │ OR skip → AI uses template          │  ║
                    ║  └────────────────────────────────────┘  ║
                    ║                    │                     ║
                    ║  STEP 3: API Key Check                   ║
                    ║  ┌────────────────────────────────────┐  ║
                    ║  │ Tries left > 0?                    │  ║
                    ║  │  YES → Use system key              │  ║
                    ║  │  NO  → Show BYOK input             │  ║
                    ║  └────────────────────────────────────┘  ║
                    ║                    │                     ║
                    ║  STEP 4: Generate  │                     ║
                    ║  ┌────────────────▼───────────────────┐  ║
                    ║  │         [ Generate CV ]            │  ║
                    ║  └────────────────────────────────────┘  ║
                    ╚══════════════════════════════════════════╝
                                         │
                    ╔════════════════════▼════════════════════╗
                    ║           AGENT PIPELINE                 ║
                    ╠══════════════════════════════════════════╣
                    ║                                          ║
                    ║  ① JOB ANALYSIS AGENT                   ║
                    ║    ├─ Extract job title                  ║
                    ║    ├─ Required skills (hard + soft)      ║
                    ║    ├─ Nice-to-have skills                ║
                    ║    ├─ Industry keywords                  ║
                    ║    ├─ Seniority level                    ║
                    ║    └─ Company values/culture cues        ║
                    ║              ↓ (parallel)                ║
                    ║  ② RESUME ANALYSIS AGENT                ║
                    ║    ├─ Parse uploaded file                ║
                    ║    ├─ Extract: name, contact, summary    ║
                    ║    ├─ Extract: work history              ║
                    ║    ├─ Extract: skills, education         ║
                    ║    ├─ Identify skill gaps vs job         ║
                    ║    └─ Score match: X% aligned            ║
                    ║              ↓                           ║
                    ║  ③ CV BUILDER AGENT                     ║
                    ║    ├─ Load reference resume template     ║
                    ║    ├─ Inject job keywords naturally      ║
                    ║    ├─ Rewrite bullets with action verbs  ║
                    ║    ├─ Quantify achievements              ║
                    ║    ├─ ATS section ordering               ║
                    ║    └─ Generate full CV text              ║
                    ║              ↓                           ║
                    ║  ④ ATS SCORING AGENT                    ║
                    ║    ├─ Keyword match score (0-100)        ║
                    ║    ├─ Format compliance check            ║
                    ║    ├─ Missing keywords list              ║
                    ║    └─ Improvement suggestions            ║
                    ╚══════════════════════════════════════════╝
                                         │
                    ╔════════════════════▼════════════════════╗
                    ║           RESULTS PAGE                   ║
                    ╠══════════════════════════════════════════╣
                    ║                                          ║
                    ║  ┌──────────────┐  ┌──────────────────┐ ║
                    ║  │  CV PREVIEW  │  │  ATS REPORT      │ ║
                    ║  │  (live PDF)  │  │  Score: 87/100   │ ║
                    ║  │             │  │  ✓ Keywords: 23  │ ║
                    ║  │             │  │  ✗ Missing: 3    │ ║
                    ║  │             │  │  Suggestions...  │ ║
                    ║  └──────────────┘  └──────────────────┘ ║
                    ║                                          ║
                    ║  [ Download PDF ]  [ Download DOCX ]    ║
                    ║  [ Regenerate ]    [ Back to Dashboard ] ║
                    ╚══════════════════════════════════════════╝
```

---

## State Machine

```
IDLE
  │
  ├──[user inputs job]──► JOB_ENTERED
  │
  ├──[user uploads resume]──► RESUME_UPLOADED
  │
  ├──[user clicks generate]──► VALIDATING
  │                                │
  │                    ┌───────────▼───────────┐
  │                    │ Enough tries / BYOK?   │
  │                    └───────────┬───────────┘
  │                    YES ◄───────┘───────► NO
  │                    │                     │
  │              PROCESSING              SHOW_BYOK_MODAL
  │                    │
  │         ┌──────────▼──────────┐
  │         │  agents running...   │
  │         │  ① Job   [████░░] ← streaming status
  │         │  ② Resume [███░░░]
  │         │  ③ Build  [waiting]
  │         │  ④ Score  [waiting]
  │         └──────────┬──────────┘
  │                    │
  │              COMPLETE
  │                    │
  │              SHOW_RESULT
  │
  └──[error]──► ERROR_STATE ──► retry or show error
```

---

## Trial Counter Logic

```
User has FREE_TRIES remaining?
│
├── YES (tries > 0):
│     Use SYSTEM OpenAI key
│     Decrement tries by 1
│     Show: "X tries remaining"
│
└── NO (tries = 0):
      Check: Does user have BYOK stored?
      │
      ├── YES: Use their encrypted key
      │         Unlimited generations
      │
      └── NO: Show modal:
                "You've used your 3 free generations.
                 Add your OpenAI API key for unlimited access."
                [ Enter API Key ] or [ Upgrade ]
```

---

## Error Handling Flow

```
Agent fails?
│
├── OpenAI rate limit → wait 2s, retry up to 3x
├── Invalid job URL → ask user to paste text instead
├── Resume parse fail → ask user to paste text
├── BYOK key invalid → show validation error
└── All retries failed → show friendly error + support link
```
