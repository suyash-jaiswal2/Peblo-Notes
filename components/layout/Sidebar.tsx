"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, Archive, Search, Plus, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", color: "#06b6d4" },
  { icon: FileText, label: "Notes", href: "/notes", color: "#8b5cf6" },
  { icon: Archive, label: "Archive", href: "/notes?archived=true", color: "#f59e0b" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const user = useAppStore((s) => s.user);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function newNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    const { note } = await res.json();
    router.push(`/notes/${note.id}`);
  }

  return (
    <motion.aside
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
      animate={{ width: expanded ? 220 : 68 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-shrink-0 flex flex-col h-screen z-20 relative"
      style={{ background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", boxShadow: "0 0 14px rgba(139,92,246,0.35)" }}
        >
          <span className="text-white text-sm font-bold">P</span>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-sm whitespace-nowrap"
            >
              Peblo Notes
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* New note */}
      <div className="px-3 mb-4">
        <motion.button
          onClick={newNote}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)" }}
        >
          <Plus size={17} style={{ color: "#a78bfa", flexShrink: 0 }} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-violet-300 whitespace-nowrap"
              >
                New note
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const itemPath = item.href.split("?")[0];
          const itemQuery = new URLSearchParams(item.href.includes("?") ? item.href.split("?")[1] : "");
          const isArchiveItem = itemQuery.get("archived") === "true";
          const currentlyArchived = searchParams.get("archived") === "true";
          const isActive = (pathname === itemPath || pathname.startsWith(itemPath + "/")) &&
            (isArchiveItem ? currentlyArchived : !currentlyArchived || itemPath === "/dashboard");
          return (
            <Link key={item.label} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative"
                style={{ background: isActive ? "rgba(255,255,255,0.06)" : "transparent" }}
              >
                <item.icon
                  size={17}
                  style={{ color: isActive ? item.color : "rgba(255,255,255,0.38)", flexShrink: 0 }}
                />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm whitespace-nowrap"
                      style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-0.5 h-6 rounded-r-full"
                    style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Search */}
        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
        >
          <Search size={17} style={{ color: "rgba(255,255,255,0.38)", flexShrink: 0 }} />
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between flex-1"
              >
                <span className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  Search
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
                >
                  ⌘K
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))" }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <AnimatePresence>
            {expanded && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {user.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 2 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full opacity-50 hover:opacity-100 transition-opacity"
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}