import { NativeEventEmitter, NativeModules } from 'react-native';
import {
  Macro,
  NotificationEvent,
  LogEntry,
  Trigger,
  Action,
  HttpRequestActionConfig,
  DelayActionConfig,
} from '@/types';
import { useMacroStore } from '@/store/macros';
import { useLogStore } from '@/store/logs';

const { NotificationModule: NativeNotificationModule } = NativeModules;

class MacroEngine {
  private eventEmitter: NativeEventEmitter | null = null;
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;

    // Set up native event listener
    this.eventEmitter = new NativeEventEmitter(NativeNotificationModule);
    this.eventEmitter.addListener(
      'onNotificationReceived',
      this.handleNotificationEvent
    );

    this.isInitialized = true;
    console.log('[MacroEngine] Initialized');
  }

  cleanup() {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners('onNotificationReceived');
    }
    this.isInitialized = false;
  }

  private handleNotificationEvent = (event: any) => {
    const notification: NotificationEvent = {
      packageName: event.packageName,
      title: event.title,
      text: event.text,
      timestamp: event.timestamp,
      isRemoved: event.isRemoved,
    };

    console.log('[MacroEngine] Notification received:', notification);

    const enabledMacros = useMacroStore.getState().getEnabledMacros();

    for (const macro of enabledMacros) {
      this.evaluateMacro(macro, notification);
    }
  };

  private async evaluateMacro(macro: Macro, notification: NotificationEvent) {
    const matchingTriggers = macro.triggers.filter((t) =>
      this.matchTrigger(t, notification)
    );

    if (matchingTriggers.length === 0) return;

    console.log(`[MacroEngine] Macro "${macro.name}" triggered`);

    // Sort actions by order
    const sortedActions = [...macro.actions].sort((a, b) => a.order - b.order);

    const startTime = Date.now();
    let actionsExecuted = 0;
    let hasError = false;
    let errorMessage: string | undefined;

    for (const action of sortedActions) {
      try {
        await this.executeAction(action, notification);
        actionsExecuted++;
      } catch (e: any) {
        hasError = true;
        errorMessage = e.message;
        console.error(`[MacroEngine] Action failed:`, e);
        break; // Stop on first error for MVP
      }
    }

    // Log execution
    const log: LogEntry = {
      id: `${macro.id}_${Date.now()}`,
      macroId: macro.id,
      macroName: macro.name,
      triggerType: 'notification',
      triggerData: JSON.stringify(notification),
      actionsExecuted,
      status: hasError ? 'failed' : 'success',
      error: errorMessage,
      timestamp: startTime,
      duration: Date.now() - startTime,
    };

    await useLogStore.getState().addLog(log);
  }

  private matchTrigger(
    trigger: Trigger,
    notification: NotificationEvent
  ): boolean {
    if (trigger.type !== 'notification') return false;

    const config = trigger.config as any;

    // Check package filter
    if (config.packageFilter && notification.packageName !== config.packageFilter) {
      return false;
    }

    // Check title contains
    if (config.titleContains && !notification.title.includes(config.titleContains)) {
      return false;
    }

    // Check text contains
    if (config.textContains && !notification.text.includes(config.textContains)) {
      return false;
    }

    return true;
  }

  private async executeAction(
    action: Action,
    notification: NotificationEvent
  ): Promise<void> {
    switch (action.type) {
      case 'http_request':
        await this.executeHttpRequest(action.config as HttpRequestActionConfig, notification);
        break;
      case 'delay':
        await this.executeDelay(action.config as DelayActionConfig);
        break;
      default:
        console.warn(`[MacroEngine] Unknown action type: ${action.type}`);
    }
  }

  private async executeHttpRequest(
    config: HttpRequestActionConfig,
    notification: NotificationEvent
  ): Promise<void> {
    // Replace variables in URL and body
    const url = this.replaceVariables(config.url, notification);
    const body = config.body ? this.replaceVariables(config.body, notification) : undefined;

    const headers: Record<string, string> = {
      'Content-Type': config.contentType || 'application/json',
      ...config.headers,
    };

    console.log(`[MacroEngine] HTTP ${config.method} ${url}`);

    const response = await fetch(url, {
      method: config.method,
      headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async executeDelay(config: DelayActionConfig): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, config.milliseconds));
  }

  private replaceVariables(
    template: string,
    notification: NotificationEvent
  ): string {
    return template
      .replace(/\{\{packageName\}\}/g, notification.packageName)
      .replace(/\{\{title\}\}/g, notification.title)
      .replace(/\{\{text\}\}/g, notification.text)
      .replace(/\{\{timestamp\}\}/g, notification.timestamp.toString());
  }

  // Check if notification permission is granted
  async checkNotificationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      NativeNotificationModule.isPermissionGranted((granted: boolean) => {
        resolve(granted);
      });
    });
  }

  // Request notification permission
  requestNotificationPermission() {
    NativeNotificationModule.requestPermission();
  }
}

export const macroEngine = new MacroEngine();
