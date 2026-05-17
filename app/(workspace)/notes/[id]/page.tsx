import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NoteEditor from "@/components/notes/NoteEditor";

export default async function NotePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: user.id },
    include: { aiSummary: true },
  });
  if (!note) notFound();

  return <NoteEditor initialNote={note as any} />;
}