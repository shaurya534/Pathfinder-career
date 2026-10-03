import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaudeForJson } from "@/lib/anthropic";
import { LESSON_GENERATION_SYSTEM } from "@/lib/prompts";
import type { LessonContent } from "@/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { topic } = await req.json();
  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "A topic is required." }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const analysis = resume ? JSON.parse(resume.analysisJson) : null;

  let content: LessonContent;
  try {
    content = await askClaudeForJson<LessonContent>({
      system: LESSON_GENERATION_SYSTEM,
      user: `Topic: ${topic}\nLearner's target role: ${user.targetRole ?? "software engineering"}\nKnown weak areas: ${
        analysis?.missingSkillsForTarget?.join(", ") ?? "none specified"
      }`,
      maxTokens: 3000,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Lesson generation failed." }, { status: 502 });
  }

  const lesson = await prisma.lesson.create({
    data: { userId: user.id, topic, contentJson: JSON.stringify(content) },
  });

  return NextResponse.json({ lessonId: lesson.id, content });
}
