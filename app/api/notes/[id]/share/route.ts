import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findFirst({ where: { id: params.id, userId: user.id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (note.isPublic) {
    const updated = await prisma.note.update({
      where: { id: params.id },
      data: { isPublic: false, shareId: null },
      include: { aiSummary: true },
    });
    return NextResponse.json({ note: updated, shareUrl: null });
  } else {
    const shareId = nanoid(12);
    const updated = await prisma.note.update({
      where: { id: params.id },
      data: { isPublic: true, shareId },
      include: { aiSummary: true },
    });
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareId}`;
    return NextResponse.json({ note: updated, shareUrl });
  }
}