# Agent Run Inspector

Agent Run Inspector is a small full-stack prototype for reviewing multi-step agent runs after they complete or hit a human review checkpoint.

## At A Glance

- Purpose: inspect an entire agent run, not just one response or one diff
- Surface: task sidebar, execution timeline, files touched, and a structured review card
- Stack: Next.js App Router, React, TypeScript, Tailwind CSS, Zod
- Data: seeded local tasks and timeline events
- Review generation: single API route with deterministic fallback and optional OpenAI usage

## What It Is

This project is a trust and observability layer for agent execution. It helps a human reviewer understand what the agent scanned, what it reasoned about, which files were in scope, and what the next steering action should be.

## Why It Exists

Most AI tooling makes it easy to inspect one response, one diff, or one completion. That is useful, but it misses the bigger question: was the whole run legible and trustworthy?

Agent Run Inspector focuses on the run as a unit of review. The product surface is designed to answer:

- What did the agent do across the entire execution?
- Where did it pause or become risky?
- What should a human approve, retry, or redirect next?

## Core Features

- Seeded sidebar of agent tasks with workspace, model, status, start time, and duration
- Scan-friendly timeline for multi-step execution events
- Files touched panel for review scope
- Structured review panel with summary, root cause, assumptions, risks, and recommended next step
- Run actions to approve, retry, or redirect with a narrower instruction
- Single API route that generates a structured review artifact
- Deterministic fallback review generation so the app works without API keys
- Optional OpenAI-backed review generation when `OPENAI_API_KEY` is configured

## Project Structure

```text
app/
  api/review/route.ts
  layout.tsx
  page.tsx
components/
  RunInspectorApp.tsx
  TaskSidebar.tsx
  TaskHeader.tsx
  Timeline.tsx
  FilesTouched.tsx
  ReviewPanel.tsx
  RedirectModal.tsx
lib/
  data.ts
  review.ts
  schemas.ts
  format.ts
types/
  index.ts
```

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zod
- OpenAI Node SDK with graceful fallback

## Product Insight

This prototype is about run-level review, not response-level review.

Response-level review asks whether one answer looks good.
Run-level review asks whether the whole execution was understandable, appropriately scoped, and safe to continue.

That means the important artifact is not just the model output. It is the run summary: what the agent touched, what it inferred, what assumptions it made, and where a human should steer next.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Note: the local dev script uses webpack mode for stability with this Next.js 16 setup.

The app works without any API keys. If you want optional model-generated review output, set:

```bash
OPENAI_API_KEY=your_key_here
```

You can also override the model with:

```bash
OPENAI_MODEL=gpt-5.2
```

## Review API

`POST /api/review`

Request body:

```json
{
  "taskTitle": "Fix auth race on token refresh",
  "timelineEvents": [
    {
      "id": "auth-1",
      "taskId": "task-auth-refresh",
      "timestampLabel": "0.5s",
      "kind": "scan",
      "message": "scanned auth/session.ts, api/refresh.ts, and hooks/useAuth.ts for refresh entry points"
    }
  ],
  "filesTouched": ["auth/session.ts", "api/refresh.ts"]
}
```

Response body:

```json
{
  "summary": "string",
  "rootCause": "string",
  "assumptions": ["string"],
  "risks": ["string"],
  "recommendedNextStep": "string"
}
```

The route always works without an API key because it falls back to deterministic review generation when no LLM is configured or when model output fails validation.

## What I Would Build Next

- Diff-aware review that correlates the timeline with proposed code edits
- Review checkpoints during long-running execution, not just after a pause
- Reviewer annotations and approval history for each run
- Cross-run comparison to spot repeated failure modes or prompt drift
- Richer evidence panels for logs, commands, and test outcomes
