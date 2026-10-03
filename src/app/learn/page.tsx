import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LearnClient from "@/components/LearnClient";

export default async function LearnPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex">
      <Sidebar active="/learn" />
      <div className="flex-1">
        <TopBar title="Text-Based Learning" subtitle="Structured notes, MCQs, coding and interview questions on any topic." userName={user.name} />
        <LearnClient />
      </div>
    </div>
  );
}
