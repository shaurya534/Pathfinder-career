import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { roadmapId } = await req.json();
  const roadmap = await prisma.roadmap.findFirst({ where: { id: roadmapId, userId: user.id } });
  if (!roadmap) return NextResponse.json({ error: "Roadmap not found." }, { status: 404 });

  const weeks = JSON.parse(roadmap.weeksJson) as { week: number; status: string }[];
  const nextWeek = roadmap.currentWeek + 1;
  const updatedWeeks = weeks.map((w) => ({
    ...w,
    status: w.week < nextWeek ? "done" : w.week === nextWeek ? "current" : "locked",
  }));

  const updated = await prisma.roadmap.update({
    where: { id: roadmap.id },
    data: { currentWeek: Math.min(nextWeek, weeks.length), weeksJson: JSON.stringify(updatedWeeks) },
  });

  return NextResponse.json({ weeks: JSON.parse(updated.weeksJson), currentWeek: updated.currentWeek });
}
