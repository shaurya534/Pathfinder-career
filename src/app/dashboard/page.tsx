import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ReadinessGauge from "@/components/ReadinessGauge";
import ScoreStat from "@/components/ScoreStat";
import type { ResumeAnalysis } from "@/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [resume, roadmap, lessons, interviews, bookings] = await Promise.all([
    prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.roadmap.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.lesson.count({ where: { userId: user.id } }),
    prisma.mockInterview.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.booking.findMany({ where: { userId: user.id }, include: { teacher: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const analysis: ResumeAnalysis | null = resume ? JSON.parse(resume.analysisJson) : null;
  const currentWeek = roadmap ? JSON.parse(roadmap.weeksJson).find((w: any) => w.week === roadmap.currentWeek) : null;

  const completedInterviews = interviews.filter((i: any) => i.status === "completed");
  const avgInterviewScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum: number, i: any) => {
            const r = i.reportJson ? JSON.parse(i.reportJson) : null;
            return sum + (r?.overallScore ?? 0);
          }, 0) / completedInterviews.length
        )
      : 0;

  const readiness = Math.round(
    ((resume?.resumeScore ?? 0) * 0.3 + avgInterviewScore * 0.5 + Math.min(lessons * 5, 100) * 0.2)
  );

  return (
    <div className="flex">
      <Sidebar active="/dashboard" />
      <div className="flex-1">
        <TopBar title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle={user.targetCompany ? `Target: ${user.targetRole} @ ${user.targetCompany}` : "Set a target role and company to get started"} userName={user.name} />

        <div className="p-6 md:p-10 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border border-line rounded-md bg-white p-6 flex flex-col items-center">
            <p className="text-xs uppercase text-ink/40 mb-2">Interview readiness</p>
            <ReadinessGauge score={readiness} label="Overall readiness" />
            {!resume && (
              <Link href="/resume" className="text-xs text-teal mt-3 hover:underline">
                Upload your resume to calculate this →
              </Link>
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <ScoreStat label="Resume score" value={resume ? `${resume.resumeScore}/100` : "—"} accent="teal" />
            <ScoreStat label="Avg. mock interview score" value={completedInterviews.length ? `${avgInterviewScore}/100` : "—"} accent="amber" />
            <ScoreStat label="Lessons completed" value={lessons} />
            <ScoreStat label="Mock interviews taken" value={interviews.length} accent="rose" />
          </div>

          <div className="md:col-span-2 border border-line rounded-md bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-ink">Current roadmap</h2>
              <Link href="/roadmap" className="text-xs text-teal hover:underline">View full roadmap →</Link>
            </div>
            {roadmap && currentWeek ? (
              <div>
                <p className="text-sm text-ink/50 mb-2">Week {currentWeek.week} of {JSON.parse(roadmap.weeksJson).length} · {roadmap.targetRole} @ {roadmap.targetCompany}</p>
                <p className="font-medium text-ink mb-2">{currentWeek.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentWeek.topics.map((t: string) => (
                    <span key={t} className="text-xs bg-teal-dim text-teal px-2 py-0.5 rounded-sm">{t}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/50">No roadmap yet. <Link href="/roadmap" className="text-teal hover:underline">Generate one</Link> once your resume is analyzed.</p>
            )}
          </div>

          <div className="md:col-span-1 border border-line rounded-md bg-white p-6">
            <h2 className="font-display text-lg text-ink mb-4">Weak skills</h2>
            {analysis?.missingSkillsForTarget?.length ? (
              <ul className="space-y-2">
                {analysis.missingSkillsForTarget.slice(0, 6).map((s) => (
                  <li key={s} className="text-sm text-ink/70 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose" /> {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/50">Upload a resume to see gaps for your target role.</p>
            )}
          </div>

          <div className="md:col-span-2 border border-line rounded-md bg-white p-6">
            <h2 className="font-display text-lg text-ink mb-4">Mock interview history</h2>
            {interviews.length ? (
              <ul className="divide-y divide-line">
                {interviews.map((i: any) => {
                  const r = i.reportJson ? JSON.parse(i.reportJson) : null;
                  return (
                    <li key={i.id} className="py-2.5 flex items-center justify-between text-sm">
                      <span className="capitalize text-ink/70">{i.mode} interview{i.targetCompany ? ` · ${i.targetCompany}` : ""}</span>
                      <span className={r ? "font-medium text-ink" : "text-ink/40"}>
                        {r ? `${r.overallScore}/100` : "In progress"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-ink/50">No mock interviews yet. <Link href="/interview" className="text-teal hover:underline">Start one</Link>.</p>
            )}
          </div>

          <div className="md:col-span-1 border border-line rounded-md bg-white p-6">
            <h2 className="font-display text-lg text-ink mb-4">Human sessions</h2>
            {bookings.length ? (
              <ul className="space-y-2">
                {bookings.map((b: any) => (
                  <li key={b.id} className="text-sm text-ink/70">
                    {b.teacher.name} · {new Date(b.slot).toLocaleDateString()}
                    <span className="block text-xs text-ink/40 capitalize">{b.status.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/50">No sessions booked. <Link href="/teachers" className="text-teal hover:underline">Browse teachers</Link>.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
