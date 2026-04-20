import { RunInspectorApp } from "@/components/RunInspectorApp";
import { filesTouchedByTaskId, seededTasks, timelineEvents } from "@/lib/data";

export default function Home() {
  return (
    <RunInspectorApp
      initialTasks={seededTasks}
      initialReviewsByTaskId={{}}
      timelineEvents={timelineEvents}
      filesTouchedByTaskId={filesTouchedByTaskId}
    />
  );
}
