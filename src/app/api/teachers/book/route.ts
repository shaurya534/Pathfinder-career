import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { teacherId, slot, subject } = await req.json();
  if (!teacherId || !slot) {
    return NextResponse.json({ error: "A teacher and time slot are required." }, { status: 400 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return NextResponse.json({ error: "Teacher not found." }, { status: 404 });

  // NOTE: status stays "pending_payment" — this is where a Stripe/Razorpay
  // Checkout session would be created and its webhook would flip this to
  // "confirmed". See README "What's stubbed" for wiring instructions.
  const booking = await prisma.booking.create({
    data: { userId: user.id, teacherId, subject: subject ?? teacher.subjects.split(",")[0].trim(), slot },
  });

  return NextResponse.json({ bookingId: booking.id, status: booking.status });
}
