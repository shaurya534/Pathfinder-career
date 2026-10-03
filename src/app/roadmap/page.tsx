import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import RoadmapClient from "@/components/RoadmapClient";

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const roadmap = await prisma.roadmap.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="flex">
      <Sidebar active="/roadmap" />
      <div className="flex-1">
        <TopBar title="Your Roadmap" subtitle="A week-by-week plan built from your resume and target company." userName={user.name} />
        <RoadmapClient
          initialRoadmapId={roadmap?.id ?? null}
          initialWeeks={roadmap ? JSON.parse(roadmap.weeksJson) : null}
          initialCompany={roadmap?.targetCompany ?? ""}
          initialRole={roadmap?.targetRole ?? ""}
          defaultRole={user.targetRole ?? ""}
          defaultCompany={user.targetCompany ?? ""}
          companyNote={null}
        />
      </div>
    </div>
  );
}
