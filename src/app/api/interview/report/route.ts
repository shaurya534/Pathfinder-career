import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askClaudeForJson } from "@/lib/anthropic";
import { INTERVIEW_REPORT_SYSTEM } from "@/lib/prompts";
import type { InterviewReport, ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { interviewId } = await req.json();
  const interview = await prisma.mockInterview.findFirst({ where: { id: interviewId, userId: user.id } });
  if (!interview) return NextResponse.json({ error: "Interview not found." }, { status: 404 });

  if (interview.reportJson) {
    return NextResponse.json({ report: JSON.parse(interview.reportJson) });
  }

    const transcript: ChatMessage[] = JSON.parse(interview.transcriptJson);

  // Guard: if the candidate never actually answered anything, don't ask the
  // model to "evaluate" — it will hallucinate a plausible-sounding report.
  // Return an honest zero-score report instead.
  const candidateAnswers = transcript.filter(
    (m) => m.role === "user" && m.content.trim().length > 0
  );
  if (candidateAnswers.length === 0) {
    const emptyReport: InterviewReport = {
      overallScore: 0,
      technicalKnowledge: { score: 0, notes: "No answers were given, so this could not be assessed." },
      communication: { score: 0, notes: "No answers were given, so this could not be assessed." },
      confidence: { score: 0, notes: "No answers were given, so this could not be assessed." },
      answerQuality: { score: 0, notes: "No answers were given during this interview." },
      problemSolvingApproach: { score: 0, notes: "No answers were given during this interview." },
      strengths: [],
      areasForImprovement: ["Answer at least one question before ending the interview to get a real evaluation."],
      recommendedTopics: [],
    };
    await prisma.mockInterview.update({
      where: { id: interview.id },
      data: { reportJson: JSON.stringify(emptyReport), status: "completed" },
    });
    return NextResponse.json({ report: emptyReport });
  }
  const transcriptText = transcript
    .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n\n");

  let report: InterviewReport;
  try {
    report = await askClaudeForJson<InterviewReport>({
      system: INTERVIEW_REPORT_SYSTEM,
      user: `Interview mode: ${interview.mode}\n\nTranscript:\n${transcriptText}`,
      maxTokens: 2000,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Report generation failed." }, { status: 502 });
  }

  await prisma.mockInterview.update({
    where: { id: interview.id },
    data: { reportJson: JSON.stringify(report), status: "completed" },
  });

  return NextResponse.json({ report });
}
