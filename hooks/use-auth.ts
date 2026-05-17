import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export function useAuth() {
  const router = useRouter();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (!user) {
      fetch("/api/auth/me").then((r) => {
        if (r.ok) r.json().then((d) => setUser(d.user));
        else router.push("/login");
      });
    }
  }, []);

  return { user };
}