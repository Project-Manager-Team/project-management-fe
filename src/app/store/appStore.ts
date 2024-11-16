import { create } from 'zustand'

interface HistoryItem {
  id: number | null;
  title: string;
  url: string;
}

interface AppState {
  history: HistoryItem[];
  setHistory: (history: HistoryItem[]) => void;
  shouldReloadBoard: boolean;
  setShouldReloadBoard: (shouldReload: boolean) => void;
  resetToHome: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  history: [{
    id: 0,
    url: `/api/project/personal/`,
    title: "Home",
  }],
  setHistory: (history) => set({ history }),
  shouldReloadBoard: false,
  setShouldReloadBoard: (shouldReload) => set({ shouldReloadBoard: shouldReload }),
  resetToHome: () => set({
    history: [{
      id: 0,
      url: `/api/project/personal/`,
      title: "Home",
    }],
    shouldReloadBoard: true,
  }),
}))
