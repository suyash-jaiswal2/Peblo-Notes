"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Share2, Pin, Archive, Globe, Loader2,
  Bold, Italic, List, ListOrdered, Heading2, Code, Quote, X, Tag
} from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/types";
import { useNotesStore } from "@/lib/store";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate, tagColor } from "@/lib/utils";
import AiPanel from "@/components/ai/AiPanel";

export default function NoteEditor({ initialNote }: { initialNote: Note }) {
  const router = useRouter();
  const { updateNote } = useNotesStore();
  const [note, setNote] = useState<Note>(initialNote);
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(!!initialNote.aiSummary);
  const [shareLoading, setShareLoading] = useState(false);

  const debouncedTitle = useDebounce(title, 800);
  const debouncedContent = useDebounce(content, 800);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({ placeholder: "Start writing your note…" }),
    ],
    content: note.content,
    onUpdate({ editor }) { setContent(editor.getHTML()); setSaved(false); },
    editorProps: { attributes: { class: "ProseMirror" } },
  });

  const saveNote = useCallback(async (t: string, c: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, content: c }),
      });
      if (res.ok) { const { note: updated } = await res.json(); setNote(updated); updateNote(note.id, updated); setSaved(true); }
    } finally { setSaving(false); }
  }, [note.id]);

  useEffect(() => {
    if (!saved) saveNote(debouncedTitle, debouncedContent);
  }, [debouncedTitle, debouncedContent]);

  async function patch(data: Partial<Note>) {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (res.ok) { const { note: updated } = await res.json(); setNote(updated); updateNote(note.id, updated); }
  }

  async function addTag(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (!note.tags.includes(tag)) {
        const newTags = [...note.tags, tag];
        setNote((n) => ({ ...n, tags: newTags }));
        await patch({ tags: newTags });
      }
      setTagInput("");
    }
  }

  async function removeTag(tag: string) {
    const newTags = note.tags.filter((t) => t !== tag);
    setNote((n) => ({ ...n, tags: newTags }));
    await patch({ tags: newTags });
  }

  async function generateAi() {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/generate`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { aiSummary } = await res.json();
      setNote((n) => ({ ...n, aiSummary }));
      updateNote(note.id, { aiSummary });
      setShowAi(true);
      toast.success("AI analysis complete");
    } catch { toast.error("AI generation failed"); }
    finally { setAiLoading(false); }
  }

  async function shareNote() {
    setShareLoading(true);
    const res = await fetch(`/api/notes/${note.id}/share`, { method: "POST" });
    const { note: updated, shareUrl } = await res.json();
    setNote(updated); updateNote(note.id, updated);
    if (shareUrl) { navigator.clipboard.writeText(shareUrl); toast.success("Share link copied!"); }
    else { toast.success("Note made private"); }
    setShareLoading(false);
  }

  const ToolbarBtn = ({ onClick, active, children, title }: any) => (
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      onClick={onClick} title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
      style={{ background: active ? "rgba(139,92,246,0.25)" : "transparent", color: active ? "#a78bfa" : "rgba(255,255,255,0.45)" }}>
      {children}
    </motion.button>
  );

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ x: -2 }} onClick={() => router.back()}
              className="opacity-50 hover:opacity-100 transition-opacity">
              <ArrowLeft size={18} />
            </motion.button>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${saving ? "bg-amber-400 animate-pulse" : saved ? "bg-emerald-400" : "bg-gray-500"}`} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {saving ? "Saving…" : `Updated ${formatDate(note.updatedAt)}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { icon: Pin, action: () => patch({ isPinned: !note.isPinned }), active: note.isPinned, color: "#8b5cf6", title: "Pin" },
              { icon: Archive, action: () => patch({ isArchived: !note.isArchived }), active: note.isArchived, color: "#f59e0b", title: "Archive" },
            ].map((b) => (
              <motion.button key={b.title} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={b.action}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: b.active ? `${b.color}22` : "rgba(255,255,255,0.05)", border: `1px solid ${b.active ? b.color + "44" : "rgba(255,255,255,0.08)"}` }}>
                <b.icon size={14} style={{ color: b.active ? b.color : "rgba(255,255,255,0.4)" }} />
              </motion.button>
            ))}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={shareNote}
              disabled={shareLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: note.isPublic ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${note.isPublic ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`, color: note.isPublic ? "#10b981" : "rgba(255,255,255,0.5)" }}>
              {shareLoading ? <Loader2 size={12} className="animate-spin" /> : <>{note.isPublic ? <Globe size={12} /> : <Share2 size={12} />} {note.isPublic ? "Public" : "Share"}</>}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateAi}
              disabled={aiLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs relative overflow-hidden"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
              {aiLoading && <div className="scan-line" />}
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {aiLoading ? "Analyzing…" : "AI Analyze"}
            </motion.button>
          </div>
        </div>

        {/* Toolbar */}
        {editor && (
          <div className="flex items-center gap-1 px-6 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading"><Heading2 size={13} /></ToolbarBtn>
            <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list"><ListOrdered size={13} /></ToolbarBtn>
            <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
            <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code"><Code size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote"><Quote size={13} /></ToolbarBtn>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <textarea value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
              placeholder="Note title…" rows={1}
              className="w-full text-2xl font-bold mb-4 resize-none bg-transparent outline-none"
              style={{ color: "var(--text-primary)", lineHeight: "1.3" }}
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }} />

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {note.tags.map((tag) => {
                const c = tagColor(tag);
                return (
                  <span key={tag} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: "rgba(255,255,255,0.75)" }}>
                    <Tag size={9} />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100"><X size={10} /></button>
                  </span>
                );
              })}
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder="+ Add tag" className="text-xs bg-transparent outline-none px-2 py-1"
                style={{ color: "var(--text-muted)", minWidth: 60 }} />
            </div>

            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* AI Panel */}
      <AnimatePresence>
        {showAi && (
          <AiPanel note={note} onClose={() => setShowAi(false)} onApplyTitle={(t) => { setTitle(t); setSaved(false); }} />
        )}
      </AnimatePresence>
    </div>
  );
}