export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date | string;
}

export interface AiSummary {
  id: string;
  noteId: string;
  summary: string;
  actionItems: string[];
  suggestedTitle: string | null;
  generatedAt: Date | string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  isArchived: boolean;
  isPinned: boolean;
  isPublic: boolean;
  shareId: string | null;
  userId: string;
  aiSummary: AiSummary | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Insights {
  totalNotes: number;
  aiUsageCount: number;
  pinnedCount: number;
  archivedCount: number;
  mostUsedTags: { tag: string; count: number }[];
  recentNotes: Note[];
  weeklyActivity: { date: string; count: number }[];
}