import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import CommandPalette from "@/components/layout/CommandPalette";
import WorkspaceProvider from "@/components/layout/WorkspaceProvider";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <WorkspaceProvider user={user as any}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto relative z-10">{children}</main>
        <CommandPalette />
      </div>
    </WorkspaceProvider>
  );
}