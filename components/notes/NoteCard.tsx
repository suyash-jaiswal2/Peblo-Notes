"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Archive, Sparkles, Share2, Trash2, Globe, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/types";
import { formatDate, truncate, stripHtml, tagColor } from "@/lib/utils";
import { useNotesStore } from "@/lib/store";

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter();
  const { updateNote, removeNote } = useNotesStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasAi = !!note.aiSummary;
  const recentlyUpdated = Date.now() - new Date(note.updatedAt).getTime() < 1000 * 60 * 30;

  async function patch(data: Partial<Note>) {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (res.ok) { const { note: updated } = await res.json(); updateNote(note.id, updated); }
  }

  async function togglePin(e: React.MouseEvent) {
    e.stopPropagation();
    // Optimistic update
    updateNote(note.id, { isPinned: !note.isPinned });
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      if (!res.ok) {
        // Rollback on failure
        updateNote(note.id, { isPinned: note.isPinned });
        toast.error("Failed to update pin");
      } else {
        toast.success(note.isPinned ? "Unpinned" : "Pinned");
      }
    } catch {
      updateNote(note.id, { isPinned: note.isPinned });
      toast.error("Failed to update pin");
    }
  }

  async function toggleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    // Optimistic update
    updateNote(note.id, { isArchived: !note.isArchived });
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !note.isArchived }),
      });
      if (!res.ok) {
        updateNote(note.id, { isArchived: note.isArchived });
        toast.error("Failed to update archive status");
      } else {
        toast.success(note.isArchived ? "Note restored" : "Note archived");
      }
    } catch {
      updateNote(note.id, { isArchived: note.isArchived });
      toast.error("Failed to update archive status");
    }
  }

  async function shareNote(e: React.MouseEvent) {
    e.stopPropagation();
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
    setConfirmDelete(false);
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
      {/* Glow on recently active */}
      {recentlyUpdated && !note.isArchived && (
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />
      )}

      {/* AI shimmer */}
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
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "var(--text-muted)" }}>+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatDate(note.updatedAt)}</p>
      </div>

      {/* Hover actions */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {[
          { icon: Pin, action: togglePin, color: "#8b5cf6", title: note.isPinned ? "Unpin" : "Pin", key: "pin" },
          { icon: Share2, action: shareNote, color: "#10b981", title: "Share", key: "share" },
          { icon: Archive, action: toggleArchive, color: "#f59e0b", title: note.isArchived ? "Restore" : "Archive", key: "archive" },
          { icon: Trash2, action: (e: React.MouseEvent) => { e.stopPropagation(); setConfirmDelete(true); }, color: "#ef4444", title: "Delete", key: "delete" },
        ].map((btn) => (
          <motion.button key={btn.key} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={btn.action} title={btn.title} disabled={loading === btn.key}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <btn.icon size={13} style={{ color: btn.color }} />
          </motion.button>
        ))}
      </div>

      {/* Custom Delete Confirmation Dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-10"
            style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(8px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2" style={{ color: "#ef4444" }}>
              <AlertTriangle size={16} />
              <span className="text-xs font-semibold">Delete this note?</span>
            </div>
            <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={deleteNote}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444" }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}