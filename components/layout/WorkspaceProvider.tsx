"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function WorkspaceProvider({
  user,
  children,
}: {
  user: { id: string; name: string; email: string; createdAt: Date };
  children: React.ReactNode;
}) {
  const setUser = useAppStore((s) => s.setUser);
  useEffect(() => { setUser(user as any); }, []);
  return <>{children}</>;
}