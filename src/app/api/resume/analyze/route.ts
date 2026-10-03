import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractResumeText } from "@/lib/resumeParser";
import { askClaudeForJson } from "@/lib/anthropic";
import { RESUME_ANALYSIS_SYSTEM } from "@/lib/prompts";
import type { ResumeAnalysis } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const targetRole = (form.get("targetRole") as string) || user.targetRole || "";
  const targetCompany = (form.get("targetCompany") as string) || user.targetCompany || "";

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText: string;
  try {
    rawText = await extractResumeText(buffer, file.name);
  } catch (err) {
    return NextResponse.json({ error: "Could not read that file. Please upload a PDF or DOCX." }, { status: 400 });
  }

  if (!rawText.trim() || rawText.trim().length < 40) {
    return NextResponse.json({ error: "The resume appears empty or unreadable. Try a different file." }, { status: 400 });
  }

  let analysis: ResumeAnalysis;
  try {
    analysis = await askClaudeForJson<ResumeAnalysis>({
      system: RESUME_ANALYSIS_SYSTEM,
      user: `Target role: ${targetRole || "Not specified"}\nTarget company: ${targetCompany || "Not specified"}\n\nResume text:\n${rawText.slice(0, 12000)}`,
      maxTokens: 6000,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Resume analysis failed." },
      { status: 502 }
    );
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: file.name,
      rawText: rawText.slice(0, 20000),
      analysisJson: JSON.stringify(analysis),
      resumeScore: analysis.resumeScore ?? 0,
    },
  });

  if (targetRole || targetCompany) {
    await prisma.user.update({
      where: { id: user.id },
      data: { targetRole: targetRole || undefined, targetCompany: targetCompany || undefined },
    });
  }

  return NextResponse.json({ resumeId: resume.id, analysis });
}
