import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicShareClient from "./PublicShareClient";

export default async function SharedNotePage({ params }: { params: { shareId: string } }) {
  const note = await prisma.note.findFirst({
    where: { shareId: params.shareId, isPublic: true },
    include: { aiSummary: true, user: { select: { name: true } } },
  });
  if (!note) notFound();
  return <PublicShareClient note={note as any} />;
}