import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { shareId: string } }) {
  const note = await prisma.note.findFirst({
    where: { shareId: params.shareId, isPublic: true },
    include: { aiSummary: true, user: { select: { name: true } } },
  });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}