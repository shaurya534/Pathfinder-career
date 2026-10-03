import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaude } from "@/lib/anthropic";
import { INTERVIEWER_SYSTEM } from "@/lib/prompts";
import type { ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { mode, targetCompany } = await req.json();
  if (!mode) return NextResponse.json({ error: "An interview mode is required." }, { status: 400 });

  const resume = await prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const analysis = resume ? JSON.parse(resume.analysisJson) : null;

  const interview = await prisma.mockInterview.create({
    data: {
      userId: user.id,
      mode,
      targetCompany: targetCompany || user.targetCompany || null,
      transcriptJson: "[]",
    },
  });

  const system = INTERVIEWER_SYSTEM({
    mode,
    targetCompany: interview.targetCompany,
    resumeSummary: analysis?.summary ?? null,
  });

  let opening: string;
  try {
    opening = await askClaude({
      system,
      messages: [{ role: "user", content: "Begin the interview with your opening question." }],
      maxTokens: 400,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Interviewer unavailable." }, { status: 502 });
  }

  const transcript: ChatMessage[] = [{ role: "assistant", content: opening, ts: Date.now() }];
  await prisma.mockInterview.update({
    where: { id: interview.id },
    data: { transcriptJson: JSON.stringify(transcript) },
  });

  return NextResponse.json({ interviewId: interview.id, opening });
}
