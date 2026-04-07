import { create } from 'zustand';
import { Macro } from '@/types';

interface MacroState {
  macros: Macro[];
  loading: boolean;
  error: string | null;

  // Actions
  loadMacros: () => Promise<void>;
  addMacro: (macro: Macro) => Promise<void>;
  updateMacro: (id: string, updates: Partial<Macro>) => Promise<void>;
  deleteMacro: (id: string) => Promise<void>;
  toggleMacro: (id: string) => Promise<void>;
  getMacro: (id: string) => Macro | undefined;
  getEnabledMacros: () => Macro[];
}

// Storage key
const STORAGE_KEY = '@macrotasker_macros';

// Helper for AsyncStorage
async function loadMacrosFromStorage(): Promise<Macro[]> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const stored = await AsyncStorage.default.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveMacrosToStorage(macros: Macro[]): Promise<void> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.setItem(STORAGE_KEY, JSON.stringify(macros));
  } catch {
    // Silent fail for now
  }
}

export const useMacroStore = create<MacroState>((set, get) => ({
  macros: [],
  loading: false,
  error: null,

  loadMacros: async () => {
    set({ loading: true, error: null });
    try {
      const macros = await loadMacrosFromStorage();
      set({ macros, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  addMacro: async (macro) => {
    const { macros } = get();
    const newMacros = [...macros, macro];
    set({ macros: newMacros });
    await saveMacrosToStorage(newMacros);
  },

  updateMacro: async (id, updates) => {
    const { macros } = get();
    const newMacros = macros.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m
    );
    set({ macros: newMacros });
    await saveMacrosToStorage(newMacros);
  },

  deleteMacro: async (id) => {
    const { macros } = get();
    const newMacros = macros.filter((m) => m.id !== id);
    set({ macros: newMacros });
    await saveMacrosToStorage(newMacros);
  },

  toggleMacro: async (id) => {
    const { macros } = get();
    const newMacros = macros.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled, updatedAt: Date.now() } : m
    );
    set({ macros: newMacros });
    await saveMacrosToStorage(newMacros);
  },

  getMacro: (id) => {
    return get().macros.find((m) => m.id === id);
  },

  getEnabledMacros: () => {
    return get().macros.filter((m) => m.enabled);
  },
}));
