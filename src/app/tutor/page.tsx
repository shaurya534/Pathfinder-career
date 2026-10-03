import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TutorTabs from "@/components/TutorTabs";

export default async function TutorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex">
      <Sidebar active="/tutor" />
      <div className="flex-1">
        <TopBar title="AI Tutor" subtitle="A personalized 1:1 tutor that adapts to how you learn." userName={user.name} />
        <TutorTabs />
      </div>
    </div>
  );
}
