import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import InterviewTabs from "@/components/InterviewTabs";

export default async function InterviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex">
      <Sidebar active="/interview" />
      <div className="flex-1">
        <TopBar
          title="Mock Interview"
          subtitle="Practice under real interview pressure, then get a scored report."
          userName={user.name}
        />
        <InterviewTabs defaultCompany={user.targetCompany ?? ""} />
      </div>
    </div>
  );
}
