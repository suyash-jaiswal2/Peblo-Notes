"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl">✦</motion.p>
      <h1 className="text-2xl font-bold">Note not found</h1>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>This note may have been made private or deleted.</p>
      <Link href="/" className="mt-2 px-4 py-2 rounded-xl text-sm"
        style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
        Go home
      </Link>
    </div>
  );
}