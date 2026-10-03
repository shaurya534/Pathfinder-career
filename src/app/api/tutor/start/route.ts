import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const session = await prisma.chatSession.create({
    data: { userId: user.id, mode: "tutor", messagesJson: "[]" },
  });
  return NextResponse.json({ sessionId: session.id });
}
