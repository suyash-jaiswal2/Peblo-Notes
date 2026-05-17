"use client";

import { motion } from "framer-motion";
import { Globe, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Note } from "@/types";
import { tagColor } from "@/lib/utils";

export default function PublicShareClient({ note }: { note: Note & { user: { name: string } } }) {
  const wordCount = note.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.round(wordCount / 200));
  const plainText = note.content.replace(/<[^>]+>/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 60%)" }} className="absolute inset-0" />
        <div style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} className="absolute inset-0 opacity-50" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Globe size={12} style={{ color: "#10b981" }} />
          <span className="text-xs" style={{ color: "#34d399" }}>Public note · Peblo Notes</span>
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
          {note.title || "Untitled"}
        </motion.h1>

        {/* Meta */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>By {(note as any).user?.name}</span>
          <span className="w-1 h-1 rounded-full" style={{ background: "var(--text-muted)" }} />
          <span className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Calendar size={12} />
            {new Date(note.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="w-1 h-1 rounded-full" style={{ background: "var(--text-muted)" }} />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{readMins} min read</span>
        </motion.div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            className="flex flex-wrap gap-1.5 mb-8">
            {note.tags.map((tag) => {
              const c = tagColor(tag);
              return (
                <span key={tag} className="text-xs px-3 py-1 rounded-full"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: "rgba(255,255,255,0.7)" }}>
                  {tag}
                </span>
              );
            })}
          </motion.div>
        )}

        {/* Divider */}
        <div className="h-px mb-8" style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.4), transparent)" }} />

        {/* AI Summary */}
        {note.aiSummary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="rounded-2xl p-5 mb-8"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} style={{ color: "#8b5cf6" }} />
              <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>AI Summary</span>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>{note.aiSummary.summary}</p>
            {note.aiSummary.actionItems.length > 0 && (
              <ul className="space-y-1.5">
                {note.aiSummary.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#8b5cf6" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="prose-dark">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{plainText}</ReactMarkdown>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Shared via{" "}
            <a href="/" className="text-violet-400 hover:text-violet-300">Peblo Notes</a>
          </p>
        </div>
      </div>
    </div>
  );
}