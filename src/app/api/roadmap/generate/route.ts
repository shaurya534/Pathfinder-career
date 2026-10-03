import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaudeForJson } from "@/lib/anthropic";
import { ROADMAP_SYSTEM } from "@/lib/prompts";
import type { RoadmapPlan, ResumeAnalysis } from "@/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const targetRole = body.targetRole || user.targetRole;
  const targetCompany = body.targetCompany || user.targetCompany;

  if (!targetRole || !targetCompany) {
    return NextResponse.json({ error: "A target role and company are required." }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const analysis: ResumeAnalysis | null = resume ? JSON.parse(resume.analysisJson) : null;

  let plan: RoadmapPlan;
  try {
    plan = await askClaudeForJson<RoadmapPlan>({
      system: ROADMAP_SYSTEM,
      user: `Target role: ${targetRole}\nTarget company: ${targetCompany}\n\nCandidate resume analysis (may be empty if no resume uploaded yet):\n${
        analysis ? JSON.stringify(analysis) : "No resume uploaded yet — build a general strong roadmap for this role."
      }`,
      maxTokens: 2500,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Roadmap generation failed." }, { status: 502 });
  }

  const roadmap = await prisma.roadmap.create({
    data: {
      userId: user.id,
      targetCompany,
      targetRole,
      weeksJson: JSON.stringify(
        plan.weeks.map((w, i) => ({ ...w, status: i === 0 ? "current" : "locked" }))
      ),
      currentWeek: 1,
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { targetRole, targetCompany } });

  return NextResponse.json({ roadmapId: roadmap.id, plan: { ...plan, weeks: JSON.parse(roadmap.weeksJson) } });
}
