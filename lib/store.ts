import { create } from "zustand";
import { Note, User } from "@/types";

interface NotesState {
  notes: Note[];
  searchQuery: string;
  selectedTags: string[];
  showArchived: boolean;
  isLoading: boolean;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  setSearchQuery: (q: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  setShowArchived: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  getFilteredNotes: () => Note[];
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  searchQuery: "",
  selectedTags: [],
  showArchived: false,
  isLoading: false,

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, updates) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)) })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleTag: (tag) =>
    set((s) => ({
      selectedTags: s.selectedTags.includes(tag)
        ? s.selectedTags.filter((t) => t !== tag)
        : [...s.selectedTags, tag],
    })),
  clearFilters: () => set({ searchQuery: "", selectedTags: [] }),
  setShowArchived: (v) => set({ showArchived: v }),
  setLoading: (v) => set({ isLoading: v }),

  getFilteredNotes: () => {
    const { notes, searchQuery, selectedTags, showArchived } = get();
    let filtered = notes.filter((n) => n.isArchived === showArchived);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          stripHtmlLocal(n.content).toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((n) => selectedTags.every((t) => n.tags.includes(t)));
    }
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },
}));

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
}));

function stripHtmlLocal(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}