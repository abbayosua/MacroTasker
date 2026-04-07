<div align="center">

<img src="./assets/images/icon.png" alt="MacroTasker Logo" width="120" height="120" />

# MacroTasker

**Powerful automation for your Android device.**

Create macros that trigger actions based on events — from notification monitoring to system control. Your device, your rules.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://www.android.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020.svg)](https://expo.dev/)

</div>

---

## ✨ Features

### 🔔 Triggers
- **Notification Listener** — react to incoming notifications from any app
- **App Events** — detect when apps are launched or closed
- **System Events** — boot completed, connectivity changes, battery levels, screen on/off
- **Time-Based** — schedule macros at specific times or intervals
- **Geofencing** — trigger actions when entering/leaving locations
- **Sensors** — shake device, proximity, light level changes
- **Shortcuts** — home screen widgets and quick settings tiles

### ⚡ Actions
- **HTTP Requests** — send webhooks, API calls, automate workflows
- **System Settings** — toggle WiFi, Bluetooth, brightness, volume, and more
- **App Control** — launch, close, install, or uninstall applications
- **UI Automation** — simulate clicks, swipes, and text input (via Accessibility)
- **Notifications** — create, dismiss, or read notifications
- **Shell Commands** — execute terminal commands (root required)
- **File Operations** — copy, move, delete, read/write files
- **Delays & Logic** — conditional branching, loops, variables
- **JavaScript Execution** — write custom scripts for complex logic

### 🎯 Smart Constraints
- Time ranges (only run between 9AM–5PM)
- Battery level thresholds
- Network type (WiFi vs. Mobile Data)
- Location-based conditions
- App state dependencies

---

## 📸 Screenshots

*(Coming soon)*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** or **pnpm** or **yarn**
- **Android Studio** (for native builds)
- **Java JDK** 17+

### Installation

```bash
# Clone the repository
git clone https://github.com/abbayosua/MacroTasker.git
cd MacroTasker

# Install dependencies
npm install

# Generate native project (bare workflow)
npx expo prebuild

# Start development
npx expo run:android
```

### Building Release APK
```bash
# Using EAS Build (cloud)
eas build --platform android --profile production

# Or local build
cd android && ./gradlew assembleRelease
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         UI Layer (React Native)         │
│  Macro List • Editor • Logs • Settings  │
├─────────────────────────────────────────┤
│     Business Logic (JavaScript)         │
│  MacroEngine • Variables • Executor     │
├─────────────────────────────────────────┤
│         Native Bridge Layer             │
│  React Native Native Modules            │
├─────────────────────────────────────────┤
│       Native Android Layer              │
│  NotificationService • Accessibility    │
│  ForegroundService • BroadcastReceivers │
└─────────────────────────────────────────┘
```

### Project Structure
```
macrotasker/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── engine/                 # Macro engine & action executor
├── store/                  # Zustand state management
├── native/android/         # Custom native modules
├── types/                  # TypeScript interfaces
├── services/               # Storage & HTTP helpers
├── constants/              # Trigger & action definitions
└── hooks/                  # React hooks
```

See [PLAN.md](./PLAN.md) for the complete architecture document.

---

## 📖 How It Works

1. **Create a Macro** — Choose a trigger (e.g., notification from WhatsApp)
2. **Add Actions** — Define what happens (e.g., send HTTP request to your server)
3. **Set Constraints** — Optional conditions (e.g., only when battery > 20%)
4. **Enable & Run** — Macro runs in the background automatically

```
Trigger → Evaluate Constraints → Execute Actions → Log Result
```

---

## 🔐 Permissions

| Permission | Purpose |
|---|---|
| Notification Access | Read incoming notifications |
| Accessibility Service | UI automation (clicks, swipes) |
| Foreground Service | Keep macro engine running |
| Location | Geofence triggers |
| Package Usage Stats | Detect app launch/close |
| Boot Completed | Restore macros after restart |
| Internet | HTTP request actions |
| Post Notifications | Create custom notifications |

All permissions are requested with clear explanations at runtime. Your data stays on your device — nothing is sent externally without your explicit macro configuration.

---

## 🛠️ Tech Stack

- **React Native 0.81** — Cross-platform framework
- **Expo SDK 54** — Development tooling
- **TypeScript** — Type-safe code
- **Zustand** — State management
- **Expo Router** — File-based navigation
- **SQLite** — Local storage for macros & logs

---

## 📋 Roadmap

- [x] Architecture planning
- [ ] MVP: Notification → HTTP Request
- [ ] Multiple trigger types
- [ ] Multiple action types
- [ ] Variable system
- [ ] Conditional logic (if/else)
- [ ] UI automation via Accessibility Service
- [ ] Macro profiles & contexts
- [ ] Import/export & sharing
- [ ] Cloud sync
- [ ] Plugin system

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [abbayosua](https://github.com/abbayosua)**

*Automate everything.*

</div>
