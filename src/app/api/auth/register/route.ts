import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, issueSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password, targetRole, targetCompany } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, targetRole, targetCompany },
  });

  issueSessionCookie(user.id);
  return NextResponse.json({ id: user.id, name: user.name });
}
