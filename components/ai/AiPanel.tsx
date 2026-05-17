"use client";

import { motion } from "framer-motion";
import { Sparkles, X, CheckCircle2, Wand2 } from "lucide-react";
import { Note } from "@/types";

export default function AiPanel({
  note, onClose, onApplyTitle,
}: { note: Note; onClose: () => void; onApplyTitle: (t: string) => void }) {
  const ai = note.aiSummary;
  if (!ai) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20, width: 0 }}
      animate={{ opacity: 1, x: 0, width: 320 }}
      exit={{ opacity: 0, x: 20, width: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen overflow-auto flex-shrink-0 relative"
      style={{ borderLeft: "1px solid rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.04)" }}
    >
      <div className="scan-line" />

      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: "#8b5cf6" }} className="animate-glow-pulse" />
            <span className="text-sm font-semibold" style={{ color: "#a78bfa" }}>AI Analysis</span>
          </div>
          <button onClick={onClose} className="opacity-40 hover:opacity-80 transition-opacity"><X size={15} /></button>
        </div>

        {/* Summary */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Summary</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ai.summary}</p>
        </div>

        {/* Suggested Title */}
        {ai.suggestedTitle && (
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Suggested Title</p>
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-xs flex-1" style={{ color: "var(--text-primary)" }}>{ai.suggestedTitle}</p>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => onApplyTitle(ai.suggestedTitle!)}
                className="flex-shrink-0 p-1.5 rounded-lg"
                style={{ background: "rgba(139,92,246,0.2)" }} title="Apply title">
                <Wand2 size={12} style={{ color: "#a78bfa" }} />
              </motion.button>
            </div>
          </div>
        )}

        {/* Action Items */}
        {ai.actionItems.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Action Items</p>
            <ul className="space-y-2">
              {ai.actionItems.map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#8b5cf6" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
            Generated {new Date(ai.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </motion.aside>
  );
}