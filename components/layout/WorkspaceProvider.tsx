"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { User } from "@/types";

export default function WorkspaceProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const setUser = useAppStore((s) => s.setUser);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setUser(user); }, []);
  return <>{children}</>;
}