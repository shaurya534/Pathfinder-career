import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { askClaude } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { topic, question } = await req.json();
  if (!question) return NextResponse.json({ error: "A question is required." }, { status: 400 });

  try {
    const reply = await askClaude({
      system: `You are a helpful AI tutor. The learner is mid-way through a video lesson on "${topic}" and paused to ask a quick question. Answer clearly and concisely (3-5 sentences), then let them know they can resume the lesson.`,
      messages: [{ role: "user", content: question }],
      maxTokens: 500,
    });
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Tutor unavailable." }, { status: 502 });
  }
}
