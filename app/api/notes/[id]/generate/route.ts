import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateNoteInsights } from "@/lib/groq";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findFirst({ where: { id: params.id, userId: user.id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await generateNoteInsights(note.title, note.content);

  const aiSummary = await prisma.aiSummary.upsert({
    where: { noteId: params.id },
    update: { ...result, generatedAt: new Date() },
    create: { noteId: params.id, ...result },
  });

  return NextResponse.json({ aiSummary });
}