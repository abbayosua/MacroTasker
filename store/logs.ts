import { create } from 'zustand';
import { LogEntry } from '@/types';
import * as storage from '@/services/storage';

interface LogState {
  logs: LogEntry[];
  loading: boolean;

  // Actions
  addLog: (log: LogEntry) => Promise<void>;
  getLogsByMacro: (macroId: string) => LogEntry[];
  clearLogs: () => Promise<void>;
  clearMacroLogs: (macroId: string) => Promise<void>;
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  loading: false,

  addLog: async (log) => {
    const { logs } = get();
    const newLogs = [log, ...logs].slice(0, 500);
    set({ logs: newLogs });
    await storage.addLog(log);
  },

  getLogsByMacro: (macroId) => {
    return get().logs.filter((l) => l.macroId === macroId);
  },

  clearLogs: async () => {
    set({ logs: [] });
    await storage.clearLogs();
  },

  clearMacroLogs: async (macroId) => {
    const { logs } = get();
    const newLogs = logs.filter((l) => l.macroId !== macroId);
    set({ logs: newLogs });
    await storage.clearMacroLogs(macroId);
  },
}));
