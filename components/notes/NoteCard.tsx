"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pin, Archive, Sparkles, Share2, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/types";
import { formatDate, truncate, stripHtml, tagColor } from "@/lib/utils";
import { useNotesStore } from "@/lib/store";

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter();
  const { updateNote, removeNote } = useNotesStore();
  const [loading, setLoading] = useState<string | null>(null);

  const hasAi = !!note.aiSummary;
  const recentlyUpdated = Date.now() - new Date(note.updatedAt).getTime() < 1000 * 60 * 30;

  async function patchNote(data: Partial<Note>) {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { note: updated } = await res.json();
      updateNote(note.id, updated);
    }
  }

  async function shareNote() {
    setLoading("share");
    const res = await fetch(`/api/notes/${note.id}/share`, { method: "POST" });
    const { note: updated, shareUrl } = await res.json();
    updateNote(note.id, updated);
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied!");
    } else {
      toast.success("Note made private");
    }
    setLoading(null);
  }

  async function deleteNote() {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    removeNote(note.id);
    toast.success("Note deleted");
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: note.isArchived ? 0.55 : 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group relative rounded-2xl cursor-pointer overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.028)",
        border: `1px solid ${note.isPinned ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: note.isPinned ? "0 0 20px rgba(139,92,246,0.08)" : undefined,
      }}
    >
      {recentlyUpdated && !note.isArchived && (
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />
      )}

      {hasAi && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="ai-shimmer absolute inset-0 rounded-2xl" />
        </div>
      )}

      <div className="p-4" onClick={() => router.push(`/notes/${note.id}`)}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>
            {note.title || "Untitled"}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {note.isPinned && <Pin size={12} style={{ color: "#8b5cf6" }} />}
            {note.isPublic && <Globe size={12} style={{ color: "#10b981" }} />}
            {hasAi && <Sparkles size={12} style={{ color: "#8b5cf6" }} className="animate-glow-pulse" />}
          </div>
        </div>

        {note.aiSummary ? (
          <p className="text-xs leading-relaxed line-clamp-3 mb-3" style={{ color: "var(--text-secondary)" }}>
            {note.aiSummary.summary}
          </p>
        ) : (
          <p className="text-xs leading-relaxed line-clamp-3 mb-3" style={{ color: "var(--text-muted)" }}>
            {truncate(stripHtml(note.content), 120) || "Empty note"}
          </p>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((tag) => {
              const c = tagColor(tag);
              return (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: "rgba(255,255,255,0.7)" }}>
                  {tag}
                </span>
              );
            })}
            {note.tags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "var(--text-muted)" }}>
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatDate(note.updatedAt)}</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {[
          { icon: Pin, action: () => patchNote({ isPinned: !note.isPinned }), color: "#8b5cf6", title: "Pin", key: "pin" },
          { icon: Share2, action: shareNote, color: "#10b981", title: "Share", key: "share" },
          { icon: Archive, action: () => patchNote({ isArchived: !note.isArchived }), color: "#f59e0b", title: note.isArchived ? "Restore" : "Archive", key: "archive" },
          { icon: Trash2, action: deleteNote, color: "#ef4444", title: "Delete", key: "delete" },
        ].map((btn) => (
          <motion.button key={btn.key} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={btn.action} title={btn.title} disabled={loading === btn.key}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <btn.icon size={12} style={{ color: btn.color }} />
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}