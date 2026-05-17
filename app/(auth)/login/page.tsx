"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Login failed"); return; }
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-primary)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div
        className="rounded-3xl p-8"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
      >
        <h1 className="text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Welcome back to your workspace</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-violet-500/40"
              style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-violet-500/40"
                style={inputStyle} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", color: "white", boxShadow: "0 0 20px rgba(139,92,246,0.3)", opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
          No account?{" "}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">Sign up</Link>
        </p>
      </div>
    </motion.div>
  );
}