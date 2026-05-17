import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notes, aiCount, recentNotes] = await Promise.all([
    prisma.note.findMany({
      where: { userId: user.id },
      select: { tags: true, isArchived: true, isPinned: true, createdAt: true },
    }),
    prisma.aiSummary.count({ where: { note: { userId: user.id } } }),
    prisma.note.findMany({
      where: { userId: user.id, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { aiSummary: true },
    }),
  ]);

  const tagMap: Record<string, number> = {};
  notes.forEach((n) => n.tags.forEach((t) => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const mostUsedTags = Object.entries(tagMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  // Last 7 days activity
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return {
      date: dateStr,
      count: notes.filter((n) => n.createdAt.toISOString().slice(0, 10) === dateStr).length,
    };
  });

  return NextResponse.json({
    insights: {
      totalNotes: notes.length,
      activeNotes: notes.filter((n) => !n.isArchived).length,
      archivedCount: notes.filter((n) => n.isArchived).length,
      pinnedCount: notes.filter((n) => n.isPinned).length,
      aiUsageCount: aiCount,
      mostUsedTags,
      recentNotes,
      weeklyActivity,
    },
  });
}