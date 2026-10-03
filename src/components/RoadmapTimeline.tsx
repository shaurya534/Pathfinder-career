import type { RoadmapWeek } from "@/types";

export default function RoadmapTimeline({ weeks }: { weeks: RoadmapWeek[] }) {
  return (
    <ol className="space-y-0">
      {weeks.map((w, i) => (
        <li key={w.week} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                w.status === "done"
                  ? "bg-teal text-white"
                  : w.status === "current"
                  ? "bg-amber text-ink"
                  : "bg-line text-ink/50"
              }`}
            >
              {w.week}
            </div>
            {i < weeks.length - 1 && <div className="w-px flex-1 bg-line mt-1" />}
          </div>
          <div className="pb-8">
            <p className="font-display text-lg text-ink">{w.title}</p>
            <p className="text-xs text-ink/40 mb-2">{w.estimatedHours}h estimated</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {w.topics.map((t) => (
                <span
                  key={t}
                  className="text-xs bg-teal-dim text-teal px-2 py-0.5 rounded-sm"
                >
                  {t}
                </span>
              ))}
            </div>
            <ul className="text-sm text-ink/60 list-disc pl-4 space-y-0.5">
              {w.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
