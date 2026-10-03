import type { InterviewReport } from "@/types";

export default function InterviewReportView({
  report,
  onRestart,
}: {
  report: InterviewReport;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="border border-line rounded-md bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Performance report</h2>
          <span className="font-display text-3xl text-amber">{report.overallScore}/100</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {(
            [
              ["Technical knowledge", report.technicalKnowledge],
              ["Communication", report.communication],
              ["Confidence", report.confidence],
              ["Answer quality", report.answerQuality],
              ["Problem-solving approach", report.problemSolvingApproach],
            ] as const
          ).map(([label, data]) => (
            <div key={label} className="border border-line rounded-md p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-ink">{label}</p>
                <span className="text-sm text-teal font-medium">{data.score}/100</span>
              </div>
              <p className="text-xs text-ink/60">{data.notes}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-line rounded-md bg-white p-6">
          <h3 className="font-display text-base text-ink mb-3">Strengths</h3>
          <ul className="text-sm text-ink/70 list-disc pl-4 space-y-1">
            {report.strengths.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div className="border border-line rounded-md bg-white p-6">
          <h3 className="font-display text-base text-ink mb-3">Areas for improvement</h3>
          <ul className="text-sm text-ink/70 list-disc pl-4 space-y-1">
            {report.areasForImprovement.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </div>
      <div className="border border-line rounded-md bg-white p-6">
        <h3 className="font-display text-base text-ink mb-3">Recommended topics to study</h3>
        <div className="flex flex-wrap gap-1.5">
          {report.recommendedTopics.map((t) => (
            <span key={t} className="text-xs bg-teal-dim text-teal px-2 py-0.5 rounded-sm">{t}</span>
          ))}
        </div>
      </div>
      <button onClick={onRestart} className="px-5 py-2.5 rounded-md bg-ink text-white text-sm font-medium">
        Start another mock interview
      </button>
    </div>
  );
}
