// Core data models for MacroTasker

export interface Macro {
  id: string;
  name: string;
  enabled: boolean;
  triggers: Trigger[];
  actions: Action[];
  createdAt: number;
  updatedAt: number;
}

export interface Trigger {
  type: TriggerType;
  config: TriggerConfig;
}

export interface Action {
  type: ActionType;
  config: ActionConfig;
  order: number;
}

// MVP Trigger Types
export type TriggerType = 'notification' | 'time' | 'app_event';

export interface NotificationTriggerConfig {
  packageFilter?: string; // Empty = all apps
  titleContains?: string;
  textContains?: string;
}

export interface TimeTriggerConfig {
  hour: number;
  minute: number;
  repeat: 'once' | 'daily' | 'weekdays' | 'weekends';
}

export interface AppEventTriggerConfig {
  package: string;
  event: 'launch' | 'close';
}

export type TriggerConfig =
  | NotificationTriggerConfig
  | TimeTriggerConfig
  | AppEventTriggerConfig;

// MVP Action Types
export type ActionType = 'http_request' | 'delay' | 'notification_action';

export interface HttpRequestActionConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  contentType?: string;
}

export interface DelayActionConfig {
  milliseconds: number;
}

export interface NotificationActionConfig {
  type: 'send' | 'dismiss';
  title: string;
  text: string;
  channelId?: string;
}

export type ActionConfig =
  | HttpRequestActionConfig
  | DelayActionConfig
  | NotificationActionConfig;

// Notification Event (from native)
export interface NotificationEvent {
  packageName: string;
  title: string;
  text: string;
  timestamp: number;
  isRemoved: boolean;
}

// Execution Log Entry
export interface LogEntry {
  id: string;
  macroId: string;
  macroName: string;
  triggerType: TriggerType;
  triggerData: string;
  actionsExecuted: number;
  status: 'success' | 'partial' | 'failed';
  error?: string;
  timestamp: number;
  duration: number; // ms
}

// Trigger/Action metadata for UI
export interface TriggerTypeInfo {
  type: TriggerType;
  label: string;
  icon: string;
  description: string;
}

export interface ActionTypeInfo {
  type: ActionType;
  label: string;
  icon: string;
  description: string;
}
