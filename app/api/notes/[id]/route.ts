import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function ownedNote(id: string, userId: string) {
  return prisma.note.findFirst({ where: { id, userId }, include: { aiSummary: true } });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const note = await ownedNote(params.id, user.id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await ownedNote(params.id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, content, tags, category, isArchived, isPinned, isPublic } = await req.json();
  const note = await prisma.note.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(tags !== undefined && { tags }),
      ...(category !== undefined && { category }),
      ...(isArchived !== undefined && { isArchived }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isPublic !== undefined && { isPublic }),
    },
    include: { aiSummary: true },
  });
  return NextResponse.json({ note });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await ownedNote(params.id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}