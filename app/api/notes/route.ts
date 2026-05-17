import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const tags = searchParams.getAll("tag");
  const archived = searchParams.get("archived") === "true";

  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
      isArchived: archived,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tags.length > 0 && { tags: { hasEvery: tags } }),
    },
    include: { aiSummary: true },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const note = await prisma.note.create({
    data: {
      title: body.title ?? "Untitled",
      content: body.content ?? "",
      tags: body.tags ?? [],
      category: body.category ?? null,
      userId: user.id,
    },
    include: { aiSummary: true },
  });

  return NextResponse.json({ note }, { status: 201 });
}