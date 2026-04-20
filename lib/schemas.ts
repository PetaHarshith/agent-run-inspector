import { z } from "zod";

import type {
  ReviewReport,
  ReviewRequestPayload,
  TimelineEvent,
  TimelineEventKind,
} from "@/types";

const timelineEventKindSchema = z.enum([
  "scan",
  "read",
  "reason",
  "write",
  "complete",
] satisfies TimelineEventKind[]);

export const timelineEventSchema: z.ZodType<TimelineEvent> = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  timestampLabel: z.string().min(1),
  kind: timelineEventKindSchema,
  message: z.string().min(1),
});

export const reviewRequestSchema: z.ZodType<ReviewRequestPayload> = z.object({
  taskTitle: z.string().min(1),
  timelineEvents: z.array(timelineEventSchema).min(1),
  filesTouched: z.array(z.string().min(1)).min(1),
  redirectInstruction: z.string().min(1).optional(),
});

export const reviewReportSchema: z.ZodType<ReviewReport> = z.object({
  summary: z.string().min(1),
  rootCause: z.string().min(1),
  assumptions: z.array(z.string().min(1)).min(1),
  risks: z.array(z.string().min(1)).min(1),
  recommendedNextStep: z.string().min(1),
});
