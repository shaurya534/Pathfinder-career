import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ResumeClient from "@/components/ResumeClient";
import type { ResumeAnalysis } from "@/types";

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const analysis: ResumeAnalysis | null = resume ? JSON.parse(resume.analysisJson) : null;

  return (
    <div className="flex">
      <Sidebar active="/resume" />
      <div className="flex-1">
        <TopBar
          title="Resume Intelligence"
          subtitle="Upload your resume to get a score, skill gaps, and your personal knowledge map."
          userName={user.name}
        />
        <ResumeClient
          initialAnalysis={analysis}
          defaultRole={user.targetRole ?? ""}
          defaultCompany={user.targetCompany ?? ""}
        />
      </div>
    </div>
  );
}
