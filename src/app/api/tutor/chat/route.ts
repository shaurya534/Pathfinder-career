import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaude } from "@/lib/anthropic";
import { TUTOR_SYSTEM } from "@/lib/prompts";
import type { ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { sessionId, message } = await req.json();
  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId: user.id } });
  if (!session) return NextResponse.json({ error: "Chat session not found." }, { status: 404 });

  const history: ChatMessage[] = JSON.parse(session.messagesJson);

  const resume = await prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const analysis = resume ? JSON.parse(resume.analysisJson) : null;

  let reply: string;
  try {
    reply = await askClaude({
      system: TUTOR_SYSTEM({
        name: user.name,
        targetRole: user.targetRole,
        targetCompany: user.targetCompany,
        weakSkills: analysis?.missingSkillsForTarget,
      }),
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Tutor is unavailable." }, { status: 502 });
  }

  const updatedHistory: ChatMessage[] = [
    ...history,
    { role: "user", content: message, ts: Date.now() },
    { role: "assistant", content: reply, ts: Date.now() },
  ];

  await prisma.chatSession.update({
    where: { id: session.id },
    data: { messagesJson: JSON.stringify(updatedHistory) },
  });

  return NextResponse.json({ reply });
}
