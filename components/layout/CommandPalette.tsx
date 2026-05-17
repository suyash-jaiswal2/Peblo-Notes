"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, Plus, Search } from "lucide-react";
import { useAppStore, useNotesStore } from "@/lib/store";

export default function CommandPalette() {
  const router = useRouter();
  const open = useAppStore((s) => s.commandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const notes = useNotesStore((s) => s.notes);
  const setSearch = useNotesStore((s) => s.setSearchQuery);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(!open); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  async function newNote() {
    const res = await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    const { note } = await res.json();
    setOpen(false);
    router.push(`/notes/${note.id}`);
  }

  function runCommand(fn: () => void) { setOpen(false); fn(); }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4" onClick={() => setOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: "rgba(12,12,18,0.96)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)" }}>
              <Command label="Command Menu">
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="flex items-center px-4">
                  <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <Command.Input placeholder="Search notes, actions..." />
                </div>
                <Command.List>
                  <Command.Empty>No results.</Command.Empty>
                  <Command.Group heading="Actions">
                    <Command.Item onSelect={newNote}>
                      <Plus size={15} /> New note
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => router.push("/dashboard"))}>
                      <LayoutDashboard size={15} /> Go to Dashboard
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => router.push("/notes"))}>
                      <FileText size={15} /> Go to Notes
                    </Command.Item>
                  </Command.Group>
                  {notes.length > 0 && (
                    <Command.Group heading="Recent Notes">
                      {notes.slice(0, 8).map((note) => (
                        <Command.Item key={note.id} onSelect={() => runCommand(() => router.push(`/notes/${note.id}`))}>
                          <FileText size={14} />
                          <span>{note.title || "Untitled"}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}
                </Command.List>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}