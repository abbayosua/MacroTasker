import { create } from 'zustand';
import { LogEntry } from '@/types';

interface LogState {
  logs: LogEntry[];
  loading: boolean;

  // Actions
  addLog: (log: LogEntry) => Promise<void>;
  getLogsByMacro: (macroId: string) => LogEntry[];
  clearLogs: () => Promise<void>;
  clearMacroLogs: (macroId: string) => Promise<void>;
}

const STORAGE_KEY = '@macrotasker_logs';

async function loadLogsFromStorage(): Promise<LogEntry[]> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const stored = await AsyncStorage.default.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveLogsToStorage(logs: LogEntry[]): Promise<void> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Silent fail
  }
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  loading: false,

  addLog: async (log) => {
    const { logs } = get();
    const newLogs = [log, ...logs].slice(0, 500); // Keep last 500
    set({ logs: newLogs });
    await saveLogsToStorage(newLogs);
  },

  getLogsByMacro: (macroId) => {
    return get().logs.filter((l) => l.macroId === macroId);
  },

  clearLogs: async () => {
    set({ logs: [] });
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.removeItem(STORAGE_KEY);
  },

  clearMacroLogs: async (macroId) => {
    const { logs } = get();
    const newLogs = logs.filter((l) => l.macroId !== macroId);
    set({ logs: newLogs });
    await saveLogsToStorage(newLogs);
  },
}));
