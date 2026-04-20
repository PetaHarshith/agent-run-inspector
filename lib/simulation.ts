import type { AgentTask, TaskSimulationRun, TimelineEvent } from "@/types";

function summarizeInstruction(instruction: string, maxWords = 8) {
  return instruction.trim().split(/\s+/).slice(0, maxWords).join(" ");
}

function parseTimestampLabel(timestampLabel: string) {
  return Number.parseFloat(timestampLabel.replace("s", ""));
}

function formatTimestampLabel(seconds: number) {
  return `${seconds.toFixed(1)}s`;
}

function inferRedirectFocus(instruction: string) {
  const normalizedInstruction = instruction.toLowerCase();

  if (
    normalizedInstruction.includes("backend") ||
    normalizedInstruction.includes("server") ||
    normalizedInstruction.includes("api") ||
    normalizedInstruction.includes("auth")
  ) {
    return "backend auth flow";
  }

  if (
    normalizedInstruction.includes("docs") ||
    normalizedInstruction.includes("document") ||
    normalizedInstruction.includes("source") ||
    normalizedInstruction.includes("content")
  ) {
    return "document-backed source material";
  }

  if (
    normalizedInstruction.includes("ui") ||
    normalizedInstruction.includes("frontend") ||
    normalizedInstruction.includes("component") ||
    normalizedInstruction.includes("hook")
  ) {
    return "UI-facing surfaces";
  }

  if (
    normalizedInstruction.includes("virtual") ||
    normalizedInstruction.includes("perf") ||
    normalizedInstruction.includes("tree") ||
    normalizedInstruction.includes("viewport")
  ) {
    return "virtualization hot path";
  }

  return summarizeInstruction(instruction);
}

function selectRedirectedFiles(files: string[], instruction: string) {
  const normalizedInstruction = instruction.toLowerCase();
  const keywordGroups = [
    ["backend", "server", "api", "auth", "session"],
    ["docs", "document", "source", "content", "outline"],
    ["ui", "frontend", "component", "hook", "screen"],
    ["virtual", "perf", "tree", "viewport", "measurement"],
  ];

  for (const keywords of keywordGroups) {
    if (!keywords.some((keyword) => normalizedInstruction.includes(keyword))) {
      continue;
    }

    const matchedFiles = files.filter((file) =>
      keywords.some((keyword) => file.toLowerCase().includes(keyword)),
    );

    if (matchedFiles.length >= 1) {
      const limitedMatches = matchedFiles.slice(0, Math.min(3, matchedFiles.length));

      if (limitedMatches.length < files.length) {
        return limitedMatches;
      }
    }
  }

  if (files.length <= 2) {
    return files;
  }

  return files.slice(0, files.length - 1);
}

function summarizeFiles(files: string[]) {
  return files.slice(0, 2).join(", ");
}

function buildScopeCheckpointEvent(
  baseRun: TaskSimulationRun,
  filesTouched: string[],
  instruction: string,
) {
  const scanEvent = baseRun.timelineEvents.find((event) => event.kind === "scan");
  const reasonEvent = baseRun.timelineEvents.find((event) => event.kind === "reason");
  const focusLabel = inferRedirectFocus(instruction);
  const scopedFiles = summarizeFiles(filesTouched);
  const scanTime = scanEvent ? parseTimestampLabel(scanEvent.timestampLabel) : 0.4;
  const reasonTime = reasonEvent
    ? parseTimestampLabel(reasonEvent.timestampLabel)
    : scanTime + 0.7;

  return {
    id: `${baseRun.timelineEvents[0]?.id ?? "task"}-redirect-scope`,
    taskId: baseRun.timelineEvents[0]?.taskId ?? "",
    timestampLabel: formatTimestampLabel((scanTime + reasonTime) / 2),
    kind: "reason" as const,
    message: `narrowed scope to ${focusLabel} and kept the redirected pass inside ${scopedFiles}`,
  };
}

function removeBroadExplorationStep(events: TimelineEvent[]) {
  const removableIndex = events.findIndex((event) => event.kind === "read");

  if (removableIndex === -1) {
    return events;
  }

  return events.filter((_, index) => index !== removableIndex);
}

function buildRedirectedMessage(
  event: TimelineEvent,
  filesTouched: string[],
  instruction: string,
) {
  const instructionSummary = summarizeInstruction(instruction);
  const focusLabel = inferRedirectFocus(instruction);
  const scopedFiles = summarizeFiles(filesTouched);

  if (event.id.includes("redirect-scope")) {
    return `narrowed scope to ${focusLabel} and removed work outside ${scopedFiles}`;
  }

  switch (event.kind) {
    case "scan":
      return `rescanned ${scopedFiles} after redirecting the run to focus on ${focusLabel}`;
    case "read":
      return `re-read the highest-signal context while following the redirect instruction: ${instructionSummary}`;
    case "reason":
      return `reframed the issue around ${focusLabel} instead of the broader initial pass`;
    case "write":
      return `outlined a narrower follow-up plan constrained to ${scopedFiles}`;
    case "complete":
      return `completed the redirected pass after applying the tighter instruction: ${instructionSummary}`;
    default:
      return event.message;
  }
}

export function buildBaseSimulationRuns(
  timelineEvents: TimelineEvent[],
  filesTouchedByTaskId: Record<string, string[]>,
): Record<string, TaskSimulationRun> {
  const taskIds = new Set([
    ...timelineEvents.map((event) => event.taskId),
    ...Object.keys(filesTouchedByTaskId),
  ]);

  return Object.fromEntries(
    [...taskIds].map((taskId) => [
      taskId,
      {
        timelineEvents: timelineEvents.filter((event) => event.taskId === taskId),
        filesTouched: filesTouchedByTaskId[taskId] ?? [],
      },
    ]),
  );
}

export function buildRedirectedSimulationRun(
  baseRun: TaskSimulationRun,
  instruction: string,
): TaskSimulationRun {
  const filesTouched = selectRedirectedFiles(baseRun.filesTouched, instruction);
  const scopeCheckpointEvent = buildScopeCheckpointEvent(
    baseRun,
    filesTouched,
    instruction,
  );
  const redirectedTimeline = removeBroadExplorationStep(baseRun.timelineEvents);
  const scanEventIndex = redirectedTimeline.findIndex((event) => event.kind === "scan");
  const timelineWithCheckpoint =
    scanEventIndex === -1
      ? [scopeCheckpointEvent, ...redirectedTimeline]
      : [
        ...redirectedTimeline.slice(0, scanEventIndex + 1),
        scopeCheckpointEvent,
        ...redirectedTimeline.slice(scanEventIndex + 1),
      ];

  return {
    redirectInstruction: instruction,
    filesTouched,
    timelineEvents: timelineWithCheckpoint.map((event, index) => ({
      ...event,
      id: `${event.id}-redirect-${index}`,
      message: buildRedirectedMessage(event, filesTouched, instruction),
    })),
  };
}

export function buildInitialSimulationRuns(
  tasks: AgentTask[],
  timelineEvents: TimelineEvent[],
  filesTouchedByTaskId: Record<string, string[]>,
) {
  const baseRuns = buildBaseSimulationRuns(timelineEvents, filesTouchedByTaskId);

  return {
    baseRuns,
    initialRunsByTaskId: Object.fromEntries(
      tasks.map((task) => [
        task.id,
        task.redirectInstruction
          ? buildRedirectedSimulationRun(baseRuns[task.id], task.redirectInstruction)
          : baseRuns[task.id],
      ]),
    ) satisfies Record<string, TaskSimulationRun>,
  };
}
