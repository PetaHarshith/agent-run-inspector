import type { AgentTask, TimelineEvent } from "@/types";

export const seededTasks: AgentTask[] = [
  {
    id: "task-auth-refresh",
    title: "Fix auth race on token refresh",
    workspaceName: "platform-web",
    modelName: "gpt-5.4",
    status: "needs_review",
    startedAt: "2026-04-20T09:14:00-05:00",
    durationMs: 18400,
  },
  {
    id: "task-file-tree-virtualization",
    title: "File-tree virtualization jank on 10k-node repos",
    workspaceName: "repo-browser",
    modelName: "gpt-5.4-mini",
    status: "running",
    startedAt: "2026-04-20T10:02:00-05:00",
    durationMs: 32100,
  },
  {
    id: "task-quarter-docs",
    title: "Celebrate the quarter from docs",
    workspaceName: "docs-hub",
    modelName: "gpt-5.2",
    status: "redirected",
    startedAt: "2026-04-20T08:32:00-05:00",
    durationMs: 12700,
    redirectInstruction:
      "Retry, but stay inside the source docs, cite the exact wins that are documented, and avoid any invented claims or marketing filler.",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "auth-1",
    taskId: "task-auth-refresh",
    timestampLabel: "0.5s",
    kind: "scan",
    message: "scanned auth/session.ts, api/refresh.ts, and hooks/useAuth.ts for refresh entry points",
  },
  {
    id: "auth-2",
    taskId: "task-auth-refresh",
    timestampLabel: "1.2s",
    kind: "read",
    message: "read docs/known-issues.md and the token-expiry incident note for prior regression details",
  },
  {
    id: "auth-3",
    taskId: "task-auth-refresh",
    timestampLabel: "2.7s",
    kind: "reason",
    message: "identified duplicate refresh calls firing after token expiry when foreground and background requests overlap",
  },
  {
    id: "auth-4",
    taskId: "task-auth-refresh",
    timestampLabel: "4.0s",
    kind: "write",
    message: "proposed a mutex-based refresh gate with a single shared promise for in-flight token renewal",
  },
  {
    id: "auth-5",
    taskId: "task-auth-refresh",
    timestampLabel: "5.1s",
    kind: "complete",
    message: "paused for review after flagging that multi-tab session state could still drift even with serialized refresh calls",
  },
  {
    id: "tree-1",
    taskId: "task-file-tree-virtualization",
    timestampLabel: "0.4s",
    kind: "scan",
    message: "scanned tree rendering, row measurement, and viewport adapter code in the repo browser",
  },
  {
    id: "tree-2",
    taskId: "task-file-tree-virtualization",
    timestampLabel: "0.9s",
    kind: "read",
    message: "read perf-notes/virtualization.md and recent benchmark notes from the 10k-node test fixture",
  },
  {
    id: "tree-3",
    taskId: "task-file-tree-virtualization",
    timestampLabel: "1.8s",
    kind: "reason",
    message: "identified overscan churn, row-key instability, and repeated height invalidation in large repos",
  },
  {
    id: "tree-4",
    taskId: "task-file-tree-virtualization",
    timestampLabel: "3.1s",
    kind: "write",
    message: "proposed segmented windowing plus a stable measurement cache keyed by immutable tree node ids",
  },
  {
    id: "tree-5",
    taskId: "task-file-tree-virtualization",
    timestampLabel: "4.6s",
    kind: "complete",
    message: "generated a review checkpoint because keyboard traversal and focus retention could regress under more aggressive virtualization",
  },
  {
    id: "docs-1",
    taskId: "task-quarter-docs",
    timestampLabel: "0.3s",
    kind: "scan",
    message: "scanned the quarter recap brief, source docs, and the current draft celebration outline",
  },
  {
    id: "docs-2",
    taskId: "task-quarter-docs",
    timestampLabel: "0.8s",
    kind: "read",
    message: "read docs/voice-and-tone.md and the source notes for customer wins and launch milestones",
  },
  {
    id: "docs-3",
    taskId: "task-quarter-docs",
    timestampLabel: "1.6s",
    kind: "reason",
    message: "identified a mismatch between celebratory copy in the brief and the source-backed metrics in the docs",
  },
  {
    id: "docs-4",
    taskId: "task-quarter-docs",
    timestampLabel: "2.5s",
    kind: "write",
    message: "proposed a tighter narrative with sourced callouts and a shorter editorial outline before any rewrite",
  },
  {
    id: "docs-5",
    taskId: "task-quarter-docs",
    timestampLabel: "3.4s",
    kind: "complete",
    message: "redirected before editing because the task needed a stricter document-only instruction and explicit sourcing",
  },
];

export const filesTouchedByTaskId: Record<string, string[]> = {
  "task-auth-refresh": [
    "auth/session.ts",
    "api/refresh.ts",
    "hooks/useAuth.ts",
    "docs/known-issues.md",
  ],
  "task-file-tree-virtualization": [
    "components/FileTree.tsx",
    "components/VirtualRow.tsx",
    "lib/tree-measurement.ts",
    "lib/useViewportWindow.ts",
    "perf-notes/virtualization.md",
  ],
  "task-quarter-docs": [
    "docs/quarter-highlights.md",
    "docs/voice-and-tone.md",
    "content/celebration-outline.md",
    "content/customer-wins.md",
  ],
};
