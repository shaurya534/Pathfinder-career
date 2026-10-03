import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { lessonId, topic, score, total } = await req.json();
  const attempt = await prisma.quizAttempt.create({
    data: { userId: user.id, lessonId: lessonId ?? null, topic, score, total },
  });
  return NextResponse.json({ id: attempt.id });
}
