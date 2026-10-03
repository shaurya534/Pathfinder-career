import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaude } from "@/lib/anthropic";
import { INTERVIEWER_SYSTEM } from "@/lib/prompts";
import type { ChatMessage } from "@/types";

const MAX_QUESTIONS = 8;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { sessionId, message } = await req.json();
  const interview = await prisma.mockInterview.findFirst({ where: { id: sessionId, userId: user.id } });
  if (!interview) return NextResponse.json({ error: "Interview session not found." }, { status: 404 });
  if (interview.status === "completed") {
    return NextResponse.json({ error: "This interview has already ended." }, { status: 400 });
  }

  const transcript: ChatMessage[] = JSON.parse(interview.transcriptJson);
  const resume = await prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const analysis = resume ? JSON.parse(resume.analysisJson) : null;

  const questionsSoFar = transcript.filter((m) => m.role === "assistant").length;
  const shouldWrapUp = questionsSoFar >= MAX_QUESTIONS;

  const system = INTERVIEWER_SYSTEM({
    mode: interview.mode,
    targetCompany: interview.targetCompany,
    resumeSummary: analysis?.summary ?? null,
  });

  let reply: string;
  try {
    reply = await askClaude({
      system: shouldWrapUp
        ? `${system}\n\nThis is the final exchange. Thank the candidate briefly and let them know the interview has concluded — do not ask another question.`
        : system,
      messages: [
        ...transcript.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
      maxTokens: 400,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Interviewer unavailable." }, { status: 502 });
  }

  const updated: ChatMessage[] = [
    ...transcript,
    { role: "user", content: message, ts: Date.now() },
    { role: "assistant", content: reply, ts: Date.now() },
  ];

  await prisma.mockInterview.update({
    where: { id: interview.id },
    data: {
      transcriptJson: JSON.stringify(updated),
      status: shouldWrapUp ? "ready_for_report" : "in_progress",
    },
  });

  return NextResponse.json({ reply, done: shouldWrapUp });
}
