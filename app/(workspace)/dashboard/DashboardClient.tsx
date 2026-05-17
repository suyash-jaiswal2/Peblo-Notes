"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, Archive, Pin, TrendingUp, ArrowRight, Activity,
} from "lucide-react";
import { Insights, User } from "@/types";
import { formatDate, tagColor } from "@/lib/utils";

export default function DashboardClient({ user }: { user: User }) {
  const [data, setData] = useState<Insights | null>(null);

  useEffect(() => {
    fetch("/api/insights").then((r) => r.json()).then((d) => setData(d.insights));
  }, []);

  const stats = data
    ? [
        { label: "Total Notes", value: data.totalNotes, icon: FileText, color: "#06b6d4" },
        { label: "AI Analyses", value: data.aiUsageCount, icon: Sparkles, color: "#8b5cf6" },
        { label: "Pinned", value: data.pinnedCount, icon: Pin, color: "#f59e0b" },
        { label: "Archived", value: data.archivedCount, icon: Archive, color: "#6b7280" },
      ]
    : [];

  const maxActivity = data ? Math.max(...data.weeklyActivity.map((d) => d.count), 1) : 1;

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Good day</p>
        <h1 className="text-3xl font-bold">
          {user.name.split(" ")[0]}
          <span style={{ color: "var(--text-muted)" }}>.</span>
        </h1>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data
          ? stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-3">
                  <s.icon size={16} style={{ color: s.color }} />
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Activity size={14} style={{ color: "#06b6d4" }} />
            <p className="text-sm font-medium">Weekly Activity</p>
          </div>
          {data ? (
            <div className="flex items-end gap-2 h-24">
              {data.weeklyActivity.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div className="w-full rounded-md"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((d.count / maxActivity) * 80, 4)}px` }}
                    style={{ background: d.count > 0 ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.06)", minHeight: 4, border: d.count > 0 ? "1px solid rgba(6,182,212,0.3)" : "none" }}
                    transition={{ delay: 0.1 }} />
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2)}
                  </span>
                </div>
              ))}
            </div>
          ) : <div className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />}
        </motion.div>

        {/* Most used tags */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={14} style={{ color: "#8b5cf6" }} />
            <p className="text-sm font-medium">Top Tags</p>
          </div>
          {data?.mostUsedTags.length ? (
            <div className="space-y-2">
              {data.mostUsedTags.slice(0, 6).map((t, i) => {
                const c = tagColor(t.tag);
                const w = (t.count / data.mostUsedTags[0].count) * 100;
                return (
                  <div key={t.tag} className="flex items-center gap-2">
                    <span className="text-xs w-16 truncate" style={{ color: "var(--text-secondary)" }}>{t.tag}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: c.border }}
                        initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: i * 0.05 }} />
                    </div>
                    <span className="text-xs w-4 text-right" style={{ color: "var(--text-muted)" }}>{t.count}</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-xs" style={{ color: "var(--text-muted)" }}>No tags yet</p>}
        </motion.div>

        {/* Recent Notes */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-medium">Recent Notes</p>
            <Link href="/notes" className="text-xs flex items-center gap-1 opacity-50 hover:opacity-100" style={{ color: "var(--text-secondary)" }}>
              All <ArrowRight size={11} />
            </Link>
          </div>
          {data?.recentNotes.length ? (
            <div className="space-y-2">
              {data.recentNotes.slice(0, 5).map((note) => (
                <Link key={note.id} href={`/notes/${note.id}`}>
                  <motion.div whileHover={{ x: 3 }} className="flex items-center justify-between py-1.5 rounded-lg px-2"
                    style={{ transition: "background 0.15s" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      {note.aiSummary && <Sparkles size={10} style={{ color: "#8b5cf6", flexShrink: 0 }} />}
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{note.title || "Untitled"}</p>
                    </div>
                    <p className="text-[10px] flex-shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>{formatDate(note.updatedAt)}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : <p className="text-xs" style={{ color: "var(--text-muted)" }}>No notes yet</p>}
        </motion.div>
      </div>
    </div>
  );
}