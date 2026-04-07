# MacroTasker - Full Architecture Plan

## Overview
MacroTasker is a MacroDroid/Tasker clone built with React Native (Expo) that allows users to create automation macros. Macros consist of **triggers** (events) and **actions** (responses).

---

## Phase 1: MVP

### Scope
- **Trigger:** Notification received (filter by app package)
- **Action:** HTTP Request (URL, method, headers, body)
- **UI:** Macro list, create/edit macro, macro detail/logs

### Technical Requirements
1. **Native Android:**
   - `NotificationListenerService` — captures incoming notifications
   - React Native bridge — emits notification events to JS
   - Foreground service (required for notification listener)

2. **JavaScript Layer:**
   - Macro engine (match trigger → execute action)
   - HTTP request execution via `fetch`
   - Local storage (AsyncStorage for macro configs)

3. **UI Screens:**
   - Home: List of macros (enable/disable toggle)
   - Create/Edit: Trigger config + HTTP action config
   - Logs: Execution history per macro

### MVP Flow
```
User creates macro → Selects "Notification" trigger → Configures package filter
→ Adds "HTTP Request" action → Configures URL/method/body → Saves macro

Background service runs → Notification arrives → Native passes to JS
→ MacroEngine matches trigger → Executes HTTP request → Logs result
```

---

## Phase 2: Full Architecture

### 1. Data Models

```typescript
interface Macro {
  id: string;
  name: string;
  enabled: boolean;
  triggers: Trigger[];
  actions: Action[];
  constraints: Constraint[];
  createdAt: number;
  updatedAt: number;
}

interface Trigger {
  type: TriggerType;
  config: Record<string, any>;
}

interface Action {
  type: ActionType;
  config: Record<string, any>;
  order: number;
}

interface Constraint {
  type: ConstraintType;
  config: Record<string, any>;
}

type TriggerType =
  | 'notification'
  | 'app_launch'
  | 'app_close'
  | 'time'
  | 'geofence'
  | 'battery'
  | 'connectivity'
  | 'screen'
  | 'shake'
  | 'shortcut';

type ActionType =
  | 'http_request'
  | 'notification_action'
  | 'system_setting'
  | 'shell_command'
  | 'app_launch'
  | 'delay'
  | 'variable_set'
  | 'if_else'
  | 'javascript'
  | 'sound_vibrate'
  | 'file_operation'
  | 'ui_interaction';

type ConstraintType =
  | 'time_range'
  | 'battery_level'
  | 'network_type'
  | 'location'
  | 'app_state';
```

### 2. Layer Architecture

```
┌─────────────────────────────────────────┐
│         UI Layer (React Native)         │
│  - Macro list / editor / logs           │
│  - Trigger picker / Action picker       │
│  - Settings / Backup & restore          │
├─────────────────────────────────────────┤
│     Business Logic Layer (JS)           │
│  - MacroEngine (trigger → action flow)  │
│  - VariableManager (global/local vars)  │
│  - ConditionEvaluator (constraints)     │
│  - ActionExecutor (queue & execute)     │
│  - Logger (execution history)           │
├─────────────────────────────────────────┤
│     Native Bridge Layer                 │
│  - React Native Native Modules          │
│  - EventEmitters (triggers → JS)        │
│  - NativeMethod calls (actions)         │
├─────────────────────────────────────────┤
│    Native Android Layer                 │
│  - NotificationListenerService          │
│  - AccessibilityService (UI automation) │
│  - BroadcastReceiver (boot, etc.)       │
│  - ForegroundService (persistent)       │
│  - Geofencing API                       │
│  - AlarmManager (time triggers)         │
│  - JobScheduler (background tasks)      │
└─────────────────────────────────────────┘
```

### 3. Native Modules (Android)

| Module | Purpose |
|---|---|
| `NotificationModule` | Listen to notifications, emit to JS |
| `AppEventModule` | Detect app launch/close via UsageStats |
| `SystemEventModule` | Boot, connectivity, battery, screen events |
| `GeofenceModule` | Location-based triggers |
| `ActionModule` | Execute native actions (settings, shell, etc.) |
| `AccessibilityModule` | UI automation (click, swipe, input text) |

### 4. Macro Engine (JS)

```
Trigger fires → Native emits event → 
  MacroEngine finds matching macros → 
    Evaluates constraints (time, battery, etc.) → 
      Queues actions in order → 
        Executes sequentially (or parallel if configured) → 
          Logs result (success/fail, output)
```

**Features:**
- Error handling per action (continue on fail, stop, retry)
- Variables interpolation in action configs
- Delay support between actions
- Conditional branching (if/else)

### 5. Storage

| Data | Storage |
|---|---|
| Macro configs | SQLite / AsyncStorage |
| Variables | SQLite |
| Execution logs | SQLite (large volume) |
| Settings | AsyncStorage |

### 6. File Structure

```
macrotasker/
├── app/
│   ├── _layout.tsx                    # Root layout + providers
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                  # Macro list
│   │   ├── create.tsx                 # Create/edit macro
│   │   ├── logs.tsx                   # Execution history
│   │   └── settings.tsx               # App settings
│   └── macro/
│       └── [id].tsx                   # Macro detail
├── components/
│   ├── MacroCard.tsx
│   ├── TriggerPicker.tsx
│   ├── ActionPicker.tsx
│   ├── ConditionEditor.tsx
│   ├── ActionConfig/
│   │   ├── HttpRequestConfig.tsx
│   │   ├── NotificationConfig.tsx
│   │   └── ...
│   └── TriggerConfig/
│       ├── NotificationConfig.tsx
│       └── ...
├── engine/
│   ├── MacroEngine.ts                 # Core: trigger → action
│   ├── ActionExecutor.ts              # Execute actions
│   ├── VariableManager.ts             # Global/local variables
│   ├── ConditionEvaluator.ts          # Constraint checking
│   └── Logger.ts                      # Execution logging
├── store/
│   ├── macros.ts                      # Zustand store
│   ├── variables.ts
│   └── logs.ts
├── types/
│   └── index.ts                       # All TypeScript interfaces
├── native/
│   └── android/
│       ├── NotificationModule.kt
│       ├── AppEventModule.kt
│       ├── SystemEventModule.kt
│       ├── GeofenceModule.kt
│       ├── ActionModule.kt
│       └── AccessibilityModule.kt
├── services/
│   ├── storage.ts                     # SQLite/AsyncStorage helpers
│   └── http.ts                        # HTTP client wrapper
├── constants/
│   └── triggers.ts                    # Trigger type definitions
│   └── actions.ts                     # Action type definitions
└── hooks/
    ├── useMacros.ts
    └── useMacroEngine.ts
```

### 7. Permissions Required (Android)

- `BIND_NOTIFICATION_LISTENER_SERVICE` — read notifications
- `SYSTEM_ALERT_WINDOW` — overlay (optional)
- `ACCESS_FINE_LOCATION` / `ACCESS_BACKGROUND_LOCATION` — geofencing
- `FOREGROUND_SERVICE` — persistent service
- `RECEIVE_BOOT_COMPLETED` — restart on boot
- `PACKAGE_USAGE_STATS` — app launch detection
- `ACCESSIBILITY_SERVICE` — UI automation
- `INTERNET` — HTTP requests
- `POST_NOTIFICATIONS` — create notifications

### 8. State Management

**Zustand** recommended (lightweight, no boilerplate):
- `useMacroStore` — CRUD for macros
- `useVariableStore` — variable management
- `useLogStore` — execution logs

### 9. Future Features (Post-MVP)

- [ ] Profiles (context-based macro groups)
- [ ] Plugin system
- [ ] JavaScript code execution in actions
- [ ] Remote trigger via web API
- [ ] Macro import/export & sharing
- [ ] Backup/restore
- [ ] Dark/light theme
- [ ] Widget shortcuts
- [ ] Cloud sync

---

## Implementation Order

1. ✅ Setup project architecture (PLAN.md)
2. 🔄 Convert to bare workflow (`npx expo prebuild`)
3. 🔄 Add native notification listener module
4. 🔄 Build UI: Macro list + create/edit screen
5. 🔄 Implement MacroEngine (JS)
6. 🔄 Connect native bridge → JS execution
7. 🔄 Add logs screen
8. 🔄 Test end-to-end (notification → HTTP request)
9. 🔄 EAS build + deploy
