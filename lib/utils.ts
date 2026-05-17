import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "..." : str;
}

const PALETTE = [
  { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.35)" },
  { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)" },
  { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
  { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
  { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)" },
];

function hashStr(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export function tagColor(tag: string) {
  return PALETTE[hashStr(tag) % PALETTE.length];
}