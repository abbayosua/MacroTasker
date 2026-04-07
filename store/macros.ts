import { create } from 'zustand';
import { Macro } from '@/types';
import * as storage from '@/services/storage';

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

export const useMacroStore = create<MacroState>((set, get) => ({
  macros: [],
  loading: false,
  error: null,

  loadMacros: async () => {
    set({ loading: true, error: null });
    try {
      const macros = await storage.loadMacros();
      set({ macros, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  addMacro: async (macro) => {
    const { macros } = get();
    const newMacros = [...macros, macro];
    set({ macros: newMacros });
    await storage.saveMacro(macro);
  },

  updateMacro: async (id, updates) => {
    const { macros } = get();
    const newMacros = macros.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m
    );
    const updated = newMacros.find((m) => m.id === id)!;
    set({ macros: newMacros });
    await storage.saveMacro(updated);
  },

  deleteMacro: async (id) => {
    const { macros } = get();
    const newMacros = macros.filter((m) => m.id !== id);
    set({ macros: newMacros });
    await storage.deleteMacro(id);
  },

  toggleMacro: async (id) => {
    const { macros } = get();
    const newMacros = macros.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled, updatedAt: Date.now() } : m
    );
    const updated = newMacros.find((m) => m.id === id)!;
    set({ macros: newMacros });
    await storage.saveMacro(updated);
  },

  getMacro: (id) => {
    return get().macros.find((m) => m.id === id);
  },

  getEnabledMacros: () => {
    return get().macros.filter((m) => m.enabled);
  },
}));
