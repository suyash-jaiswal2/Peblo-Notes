"use client";

import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/lib/store";
import NoteCard from "@/components/notes/NoteCard";

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const archived = searchParams.get("archived") === "true";
  const {
    setNotes, addNote, searchQuery, setSearchQuery, selectedTags, toggleTag,
    clearFilters, showArchived, setShowArchived, isLoading, setLoading, getFilteredNotes, notes,
  } = useNotesStore();

  useEffect(() => { setShowArchived(archived); }, [archived]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/notes?archived=${archived}`);
    if (res.ok) { const { notes } = await res.json(); setNotes(notes); }
    setLoading(false);
  }, [archived]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const filtered = getFilteredNotes();
  const allTags = [...new Set(notes.flatMap((n) => n.tags))].slice(0, 16);

  async function newNote() {
    const res = await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    const { note } = await res.json();
    addNote(note);
    router.push(`/notes/${note.id}`);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex-shrink-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">{archived ? "Archive" : "Notes"}</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {filtered.length} {filtered.length === 1 ? "note" : "notes"}
            </p>
          </div>
          {!archived && (
            <motion.button onClick={newNote} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", color: "white", boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}>
              <Plus size={15} /> New note
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes…" className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <motion.button key={tag} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => toggleTag(tag)}
                  className="text-xs px-3 py-1 rounded-full transition-all"
                  style={{
                    background: active ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#a78bfa" : "var(--text-muted)",
                  }}>
                  {tag}
                </motion.button>
              );
            })}
            {selectedTags.length > 0 && (
              <button onClick={clearFilters} className="text-xs px-2 py-1 opacity-50 hover:opacity-100 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <X size={11} /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-5xl">✦</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {searchQuery || selectedTags.length > 0 ? "No notes match your filters" : archived ? "No archived notes" : "Create your first note"}
            </p>
            {!archived && !searchQuery && selectedTags.length === 0 && (
              <motion.button onClick={newNote} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                New note
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((note) => <NoteCard key={note.id} note={note} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}