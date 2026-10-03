import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const subject = req.nextUrl.searchParams.get("subject");
  const teachers = await prisma.teacher.findMany({
    where: subject ? { subjects: { contains: subject } } : undefined,
    orderBy: { rating: "desc" },
  });
  return NextResponse.json({ teachers });
}
