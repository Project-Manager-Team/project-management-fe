import { create } from 'zustand'

interface HistoryItem {
  id: number | null;
  title: string;
  url: string;
}

interface AppState {
  history: HistoryItem[];
  setHistory: (history: HistoryItem[]) => void;
  shouldReloadTable: boolean;
  setShouldReloadTable: (shouldReload: boolean) => void;
  resetToHome: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  history: [{
    id: 0,
    url: `/api/project/personal/`,
    title: "Home",
  }],
  setHistory: (history) => set({ history }),
  shouldReloadTable: false,
  setShouldReloadTable: (shouldReload) => set({ shouldReloadTable: shouldReload }),
  resetToHome: () => set({
    history: [{
      id: 0,
      url: `/api/project/personal/`,
      title: "Home",
    }],
    shouldReloadTable: true,
  }),
}))
