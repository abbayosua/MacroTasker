import * as SQLite from 'expo-sqlite';
import { Macro, LogEntry } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('macrotasker.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS macros (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      triggers TEXT NOT NULL,
      actions TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      macro_id TEXT NOT NULL,
      macro_name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      trigger_data TEXT NOT NULL,
      actions_executed INTEGER NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      timestamp INTEGER NOT NULL,
      duration INTEGER NOT NULL
    );
  `);
  return db;
}

// Macro helpers
export async function loadMacros(): Promise<Macro[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>('SELECT * FROM macros ORDER BY updated_at DESC');
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    enabled: row.enabled === 1,
    triggers: JSON.parse(row.triggers),
    actions: JSON.parse(row.actions),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveMacro(macro: Macro): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO macros (id, name, enabled, triggers, actions, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      macro.id,
      macro.name,
      macro.enabled ? 1 : 0,
      JSON.stringify(macro.triggers),
      JSON.stringify(macro.actions),
      macro.createdAt,
      macro.updatedAt,
    ]
  );
}

export async function deleteMacro(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM macros WHERE id = ?', [id]);
}

// Log helpers
export async function addLog(log: LogEntry): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO logs (id, macro_id, macro_name, trigger_type, trigger_data,
     actions_executed, status, error, timestamp, duration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.id,
      log.macroId,
      log.macroName,
      log.triggerType,
      log.triggerData,
      log.actionsExecuted,
      log.status,
      log.error || null,
      log.timestamp,
      log.duration,
    ]
  );
}

export async function loadLogs(limit = 500): Promise<LogEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    'SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );
  return rows.map((row: any) => ({
    id: row.id,
    macroId: row.macro_id,
    macroName: row.macro_name,
    triggerType: row.trigger_type,
    triggerData: row.trigger_data,
    actionsExecuted: row.actions_executed,
    status: row.status,
    error: row.error,
    timestamp: row.timestamp,
    duration: row.duration,
  }));
}

export async function clearLogs(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM logs');
}

export async function clearMacroLogs(macroId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM logs WHERE macro_id = ?', [macroId]);
}
