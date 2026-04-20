"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { FilesTouched } from "@/components/FilesTouched";
import { RedirectModal } from "@/components/RedirectModal";
import { ReviewPanel } from "@/components/ReviewPanel";
import { RunStatusStrip } from "@/components/RunStatusStrip";
import { TaskHeader } from "@/components/TaskHeader";
import { TaskSidebar } from "@/components/TaskSidebar";
import { Timeline } from "@/components/Timeline";
import { reviewReportSchema } from "@/lib/schemas";
import {
  buildInitialSimulationRuns,
  buildRedirectedSimulationRun,
} from "@/lib/simulation";
import type {
  AgentTask,
  ReviewReport,
  TaskSimulationRun,
  TaskStatus,
  TimelineEvent,
} from "@/types";

interface RunInspectorAppProps {
  initialTasks: AgentTask[];
  initialReviewsByTaskId: Record<string, ReviewReport>;
  timelineEvents: TimelineEvent[];
  filesTouchedByTaskId: Record<string, string[]>;
}

function deriveRunStage(
  visibleEvents: TimelineEvent[],
  isTimelineSimulationComplete: boolean,
  isReviewLoading: boolean,
  hasReviewArtifact: boolean,
) {
  if (isTimelineSimulationComplete) {
    return isReviewLoading || !hasReviewArtifact ? "reviewing" : "ready";
  }

  const latestEvent = visibleEvents.at(-1);

  if (!latestEvent || latestEvent.kind === "scan" || latestEvent.kind === "read") {
    return "scanning";
  }

  return "reasoning";
}

function buildEventFileRevealMap(
  events: TimelineEvent[],
  files: string[],
): Record<string, string[]> {
  const filesByEventId: Record<string, string[]> = {};
  let nextFileIndex = 0;

  for (const [index, event] of events.entries()) {
    const remainingFiles = files.length - nextFileIndex;
    const remainingEvents = events.length - index;

    if (remainingFiles <= 0) {
      filesByEventId[event.id] = [];
      continue;
    }

    const revealCount = remainingFiles > remainingEvents ? 2 : 1;

    filesByEventId[event.id] = files.slice(
      nextFileIndex,
      nextFileIndex + revealCount,
    );
    nextFileIndex += revealCount;
  }

  return filesByEventId;
}

export function RunInspectorApp({
  initialTasks,
  initialReviewsByTaskId,
  timelineEvents,
  filesTouchedByTaskId,
}: RunInspectorAppProps) {
  const [{ baseRuns, initialRunsByTaskId }] = useState(() =>
    buildInitialSimulationRuns(initialTasks, timelineEvents, filesTouchedByTaskId),
  );
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTasks[0]?.id ?? "");
  const [reviewsByTaskId, setReviewsByTaskId] = useState(initialReviewsByTaskId);
  const [reviewErrorsByTaskId, setReviewErrorsByTaskId] = useState<
    Record<string, string | undefined>
  >({});
  const [simulationRunsByTaskId, setSimulationRunsByTaskId] =
    useState<Record<string, TaskSimulationRun>>(initialRunsByTaskId);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [isRedirectOpen, setIsRedirectOpen] = useState(false);
  const [visibleTimelineEvents, setVisibleTimelineEvents] = useState<
    TimelineEvent[]
  >([]);
  const [visibleFilesTouched, setVisibleFilesTouched] = useState<string[]>([]);
  const [isTimelineSimulationComplete, setIsTimelineSimulationComplete] =
    useState(false);
  const [simulationRunToken, setSimulationRunToken] = useState(0);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null;
  const selectedTimelineTaskId = selectedTask?.id;
  const selectedSimulationRun = selectedTimelineTaskId
    ? simulationRunsByTaskId[selectedTimelineTaskId] ?? baseRuns[selectedTimelineTaskId]
    : null;
  const selectedReview = selectedTask ? reviewsByTaskId[selectedTask.id] : undefined;
  const selectedError = selectedTask
    ? reviewErrorsByTaskId[selectedTask.id]
    : undefined;
  const isSelectedTaskLoading = loadingTaskId === selectedTask?.id;

  useEffect(() => {
    setVisibleTimelineEvents([]);
    setVisibleFilesTouched([]);
    setIsTimelineSimulationComplete(false);

    if (!selectedTimelineTaskId || !selectedSimulationRun) {
      return;
    }
    const eventsForTask = selectedSimulationRun.timelineEvents;

    if (eventsForTask.length === 0) {
      setIsTimelineSimulationComplete(true);
      return;
    }

    const filesForTask = selectedSimulationRun.filesTouched;
    const filesToRevealByEventId = buildEventFileRevealMap(
      eventsForTask,
      filesForTask,
    );
    const revealDelaysMs = [320, 470, 610, 760];
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let cumulativeDelayMs = 0;

    for (const [index, event] of eventsForTask.entries()) {
      cumulativeDelayMs += revealDelaysMs[index % revealDelaysMs.length];
      const timeoutId = setTimeout(() => {
        setVisibleTimelineEvents((current) => [...current, event]);

        if (index === eventsForTask.length - 1) {
          setIsTimelineSimulationComplete(true);
        }

        const filesForEvent = filesToRevealByEventId[event.id] ?? [];

        if (filesForEvent.length === 0) {
          return;
        }

        setVisibleFilesTouched((current) => {
          const nextFiles = [...current];

          for (const file of filesForEvent) {
            if (!nextFiles.includes(file)) {
              nextFiles.push(file);
            }
          }

          return nextFiles;
        });
      }, cumulativeDelayMs);
      timeoutIds.push(timeoutId);
    }

    return () => {
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [
    selectedSimulationRun,
    selectedTimelineTaskId,
    simulationRunToken,
  ]);

  const selectedFilesTouched = selectedTask ? visibleFilesTouched : [];

  function clearReviewForTask(taskId: string) {
    setReviewsByTaskId((current) => {
      if (!(taskId in current)) {
        return current;
      }

      const nextReviews = { ...current };
      delete nextReviews[taskId];
      return nextReviews;
    });
    setReviewErrorsByTaskId((current) => ({
      ...current,
      [taskId]: undefined,
    }));
  }

  function restartSimulation(taskId: string) {
    clearReviewForTask(taskId);
    setVisibleTimelineEvents([]);
    setVisibleFilesTouched([]);
    setIsTimelineSimulationComplete(false);
    setSimulationRunToken((current) => current + 1);
  }

  const requestReview = useEffectEvent(async function requestReview(
    task: AgentTask,
    options?: {
      afterSuccessStatus?: TaskStatus;
      afterErrorStatus?: TaskStatus;
    },
  ) {
    setLoadingTaskId(task.id);
    setReviewErrorsByTaskId((current) => ({
      ...current,
      [task.id]: undefined,
    }));

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          taskTitle: task.title,
          timelineEvents: simulationRunsByTaskId[task.id]?.timelineEvents ?? [],
          filesTouched: simulationRunsByTaskId[task.id]?.filesTouched ?? [],
          redirectInstruction: simulationRunsByTaskId[task.id]?.redirectInstruction,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(errorPayload?.error ?? "The review request failed.");
      }

      const parsedReview = reviewReportSchema.parse(await response.json());

      setReviewsByTaskId((current) => ({
        ...current,
        [task.id]: parsedReview,
      }));

      const afterSuccessStatus = options?.afterSuccessStatus;

      if (afterSuccessStatus) {
        setTasks((current) =>
          current.map((candidate) =>
            candidate.id === task.id
              ? { ...candidate, status: afterSuccessStatus }
              : candidate,
          ),
        );
      }
    } catch (error) {
      console.error(error);
      setReviewErrorsByTaskId((current) => ({
        ...current,
        [task.id]:
          error instanceof Error
            ? error.message
            : "The review artifact could not be generated. Retry to regenerate the run summary.",
      }));

      const afterErrorStatus = options?.afterErrorStatus;

      if (afterErrorStatus) {
        setTasks((current) =>
          current.map((candidate) =>
            candidate.id === task.id
              ? { ...candidate, status: afterErrorStatus }
              : candidate,
          ),
        );
      }
    } finally {
      setLoadingTaskId(null);
    }
  });

  useEffect(() => {
    if (!selectedTask || !isTimelineSimulationComplete) {
      return;
    }

    if (isSelectedTaskLoading || selectedReview || selectedError) {
      return;
    }

    void requestReview(selectedTask, {
      afterSuccessStatus:
        selectedTask.status === "running" ? "needs_review" : undefined,
    });
  }, [
    isSelectedTaskLoading,
    isTimelineSimulationComplete,
    selectedError,
    selectedReview,
    selectedTask,
  ]);

  if (!selectedTask) {
    return null;
  }

  const shouldShowSelectedReview =
    isTimelineSimulationComplete && !isSelectedTaskLoading;
  const selectedRunStage = deriveRunStage(
    visibleTimelineEvents,
    isTimelineSimulationComplete,
    isSelectedTaskLoading,
    Boolean(selectedReview || selectedError),
  );

  function updateTaskStatus(taskId: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );
  }

  function handleSelectTask(taskId: string) {
    if (taskId === selectedTaskId) {
      return;
    }

    setSelectedTaskId(taskId);
    restartSimulation(taskId);
  }

  function handleApprove() {
    updateTaskStatus(selectedTask.id, "approved");
  }

  function handleRetry() {
    setSimulationRunsByTaskId((current) => ({
      ...current,
      [selectedTask.id]: baseRuns[selectedTask.id],
    }));
    setTasks((current) =>
      current.map((task) =>
        task.id === selectedTask.id
          ? {
            ...task,
            status: "running",
            redirectInstruction: undefined,
          }
          : task,
      ),
    );
    restartSimulation(selectedTask.id);
  }

  function handleRedirectOpen() {
    setIsRedirectOpen(true);
  }

  function handleRedirectSubmit(trimmedInstruction: string) {
    setSimulationRunsByTaskId((current) => ({
      ...current,
      [selectedTask.id]: buildRedirectedSimulationRun(
        baseRuns[selectedTask.id],
        trimmedInstruction,
      ),
    }));
    setTasks((current) =>
      current.map((task) =>
        task.id === selectedTask.id
          ? {
            ...task,
            status: "redirected",
            redirectInstruction: trimmedInstruction,
          }
          : task,
      ),
    );
    setIsRedirectOpen(false);
    restartSimulation(selectedTask.id);
  }

  return (
    <>
      <div className="min-h-screen lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <TaskSidebar
          tasks={tasks}
          selectedTaskId={selectedTask.id}
          onSelectTask={handleSelectTask}
        />

        <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-6">
            <TaskHeader task={selectedTask} />
            <RunStatusStrip
              currentStage={selectedRunStage}
              isRedirectedRun={Boolean(selectedSimulationRun?.redirectInstruction)}
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
              <div className="space-y-6">
                <Timeline events={visibleTimelineEvents} />
                <FilesTouched files={selectedFilesTouched} />
              </div>

              <ReviewPanel
                task={selectedTask}
                review={shouldShowSelectedReview ? selectedReview : undefined}
                isLoading={!isTimelineSimulationComplete || isSelectedTaskLoading}
                error={shouldShowSelectedReview ? selectedError : undefined}
                onApprove={handleApprove}
                onRetry={handleRetry}
                onRedirect={handleRedirectOpen}
              />
            </div>
          </div>
        </main>
      </div>

      <RedirectModal
        key={selectedTask.id}
        isOpen={isRedirectOpen}
        initialValue={selectedTask.redirectInstruction}
        onClose={() => setIsRedirectOpen(false)}
        onSubmit={handleRedirectSubmit}
      />
    </>
  );
}
