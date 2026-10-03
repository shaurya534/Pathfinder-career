import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TeachersClient from "@/components/TeachersClient";

export default async function TeachersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex">
      <Sidebar active="/teachers" />
      <div className="flex-1">
        <TopBar
          title="Human Teachers"
          subtitle="Switch to a real mentor whenever AI isn't enough."
          userName={user.name}
        />
        <TeachersClient />
      </div>
    </div>
  );
}
