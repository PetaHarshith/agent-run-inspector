import { reviewReportSchema } from "@/lib/schemas";
import type { ReviewReport, ReviewRequestPayload } from "@/types";

function summarizeFiles(files: string[], limit = 3) {
  return files.slice(0, limit).join(", ");
}

function lowercaseFirstLetter(value: string) {
  if (!value) {
    return value;
  }

  return value[0].toLowerCase() + value.slice(1);
}

function summarizeInstruction(instruction: string, limit = 9) {
  return instruction.trim().split(/\s+/).slice(0, limit).join(" ");
}

function applyRedirectContext(
  payload: ReviewRequestPayload,
  review: ReviewReport,
): ReviewReport {
  if (!payload.redirectInstruction) {
    return review;
  }

  const instructionSummary = summarizeInstruction(payload.redirectInstruction);
  const scopedFiles = summarizeFiles(payload.filesTouched, 2);

  return {
    ...review,
    summary: `The redirected run followed "${instructionSummary}" and ${lowercaseFirstLetter(review.summary)}`,
    assumptions: [
      `The redirected pass stayed intentionally scoped to ${scopedFiles}.`,
      ...review.assumptions.slice(0, 2),
    ],
    recommendedNextStep: `Validate the redirected instruction against ${scopedFiles} before expanding the run beyond this narrower pass.`,
  };
}

function buildAuthRaceReview(payload: ReviewRequestPayload): ReviewReport {
  return {
    summary:
      "The run isolated a token refresh collision after expiry and paused at review before editing shared auth code. It narrowed the issue to concurrent refresh paths and converged on serializing refresh work instead of widening retry logic.",
    rootCause:
      "Refresh can be triggered from more than one path at the same time, so overlapping requests race to update session state and leave tabs with stale or inconsistent tokens.",
    assumptions: [
      "The existing refresh endpoint contract does not need to change to support serialized refresh handling.",
      "The affected behavior is centered in shared auth utilities rather than a single screen-specific flow.",
      `The most relevant evidence is already in ${summarizeFiles(payload.filesTouched)}.`,
    ],
    risks: [
      "A local mutex may still miss cross-tab coordination and produce divergent browser state.",
      "Applying the fix only in hooks could leave background API refresh paths unsynchronized.",
      "If failed refreshes are not collapsed, the app may still show noisy sign-out or retry loops.",
    ],
    recommendedNextStep:
      "Retry the run with a narrowly scoped patch across backend refresh plumbing and shared session coordination, then add a multi-tab expiry regression check before approval.",
  };
}

function buildVirtualizationReview(
  payload: ReviewRequestPayload,
): ReviewReport {
  return {
    summary:
      "The run traced file-tree jank to virtualization strategy rather than raw rendering cost. It moved from scanning adapters to proposing segmented windowing and stopped at review because navigation behavior could regress even if scroll performance improves.",
    rootCause:
      "Large repos amplify overscan churn and unstable row identity, which causes repeated measurement work, remounts, and visible jitter as the viewport shifts.",
    assumptions: [
      "The largest regressions appear in deeply nested repositories with fast expand or collapse interactions.",
      "A stable measurement cache can be introduced without changing the external file-tree API.",
      `The current run context from ${summarizeFiles(payload.filesTouched)} is enough to shape the next pass.`,
    ],
    risks: [
      "More aggressive windowing can break keyboard traversal, focus retention, or screen-reader order.",
      "Caching row measurements without invalidation rules can preserve stale heights after expansion.",
      "Improving scroll smoothness alone may hide, rather than fix, expensive reconciliation work.",
    ],
    recommendedNextStep:
      "Retry with the scope limited to virtualization primitives and add a manual verification checklist for focus order, expansion state, and 10k-node scroll behavior.",
  };
}

function buildDocsCelebrateReview(payload: ReviewRequestPayload): ReviewReport {
  return {
    summary:
      "The run recognized that the brief was drifting from source-backed storytelling into generic celebration copy. It collected the right docs, proposed a tighter narrative, and was redirected before touching content because the instruction needed firmer scope.",
    rootCause:
      "The task framing is broad enough that the run can over-index on upbeat tone and synthesize claims that are not clearly anchored to the source documents.",
    assumptions: [
      "The strongest output should stay grounded in internal docs instead of inventing supporting metrics or quotes.",
      "A narrower instruction can reuse the current source sweep without redoing the whole run.",
      `The files in scope remain document-first: ${summarizeFiles(payload.filesTouched)}.`,
    ],
    risks: [
      "Unsourced celebration language can reduce trust even if the tone feels polished.",
      "Document-only scope may still need a reviewer decision on which wins are material enough to highlight.",
      "If the run rewrites too broadly, it may erase useful nuance from the underlying source docs.",
    ],
    recommendedNextStep:
      "Retry with an explicit document-only instruction, require every claim to map back to a source file, and ask for a concise editorial outline before any final rewrite.",
  };
}

function buildGenericReview(payload: ReviewRequestPayload): ReviewReport {
  const primaryReason =
    payload.timelineEvents.find((event) => event.kind === "reason")?.message ??
    "identified the primary issue";
  const proposedChange =
    payload.timelineEvents.find((event) => event.kind === "write")?.message ??
    "outlined a candidate change";

  return {
    summary: `${payload.taskTitle} reached a review point after the run ${primaryReason} and ${proposedChange}. The current artifact is useful as a steerable run summary rather than a final implementation decision.`,
    rootCause: `The run evidence suggests the issue sits in an interaction between the touched files (${payload.filesTouched.join(", ")}) rather than in an isolated single-step failure.`,
    assumptions: [
      "The timeline is representative of the actual steps that shaped the run.",
      "The currently touched files are enough to narrow the next attempt.",
      "A human reviewer wants steering guidance more than raw logs.",
    ],
    risks: [
      "The run may have stopped before validating the proposal against edge cases.",
      "Important context could still live outside the currently touched files.",
      "A retry without tighter scope may repeat the same exploratory loop.",
    ],
    recommendedNextStep:
      "Retry with a narrower instruction that either limits file scope or requires explicit validation before any write step.",
  };
}

export function generateDeterministicReviewReport(
  payload: ReviewRequestPayload,
): ReviewReport {
  const title = payload.taskTitle.toLowerCase();
  const review = title.includes("auth") && title.includes("token refresh")
    ? buildAuthRaceReview(payload)
    : title.includes("virtualization")
      ? buildVirtualizationReview(payload)
      : title.includes("celebrate the quarter")
        ? buildDocsCelebrateReview(payload)
        : buildGenericReview(payload);

  return applyRedirectContext(payload, review);
}

export async function generateReviewReport(
  payload: ReviewRequestPayload,
): Promise<ReviewReport> {
  return reviewReportSchema.parse(generateDeterministicReviewReport(payload));
}
