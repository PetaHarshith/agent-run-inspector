export type TaskStatus = "running" | "needs_review" | "approved" | "redirected";

export type TimelineEventKind =
  | "scan"
  | "read"
  | "reason"
  | "write"
  | "complete";

export interface AgentTask {
  id: string;
  title: string;
  workspaceName: string;
  modelName: string;
  status: TaskStatus;
  startedAt: string;
  durationMs: number;
  redirectInstruction?: string;
}

export interface TimelineEvent {
  id: string;
  taskId: string;
  timestampLabel: string;
  kind: TimelineEventKind;
  message: string;
}

export interface TaskSimulationRun {
  timelineEvents: TimelineEvent[];
  filesTouched: string[];
  redirectInstruction?: string;
}

export interface ReviewRequestPayload {
  taskTitle: string;
  timelineEvents: TimelineEvent[];
  filesTouched: string[];
  redirectInstruction?: string;
}

export interface ReviewReport {
  summary: string;
  rootCause: string;
  assumptions: string[];
  risks: string[];
  recommendedNextStep: string;
}
