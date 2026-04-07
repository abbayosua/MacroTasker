package com.anonymous.macrotasker

import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("NotificationModule")

        Events("onNotificationReceived")

        AsyncFunction("requestPermission") {
            val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            appContext.reactContext?.startActivity(intent)
        }
    }
}
