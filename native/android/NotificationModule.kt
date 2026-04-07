package com.anonymous.macrotasker

import android.app.Notification
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.events.OnNewIntentListener

class NotificationModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("NotificationModule")

        Events("onNotificationReceived")

        Function("isPermissionGranted") {
            val service = appContext.reactContext?.getSystemService(NotificationListenerService::class.java)
            // We need to check via Intent if the service is bound
            false // Will be checked from JS side
        }

        AsyncFunction("requestPermission") {
            val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            appContext.reactContext?.startActivity(intent)
        }
    }

    companion object {
        var notificationCallback: ((Bundle) -> Unit)? = null
    }
}

class MacroTaskerNotificationListener : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        super.onNotificationPosted(sbn)

        val notification = sbn.notification
        val extras = notification.extras

        val data = Bundle().apply {
            putString("packageName", sbn.packageName)
            putString("title", extras?.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: "")
            putString("text", extras?.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: "")
            putLong("timestamp", sbn.postTime)
            putBoolean("isRemoved", false)
        }

        NotificationModule.notificationCallback?.invoke(data)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        super.onNotificationRemoved(sbn)

        val data = Bundle().apply {
            putString("packageName", sbn.packageName)
            putString("title", "")
            putString("text", "")
            putLong("timestamp", System.currentTimeMillis())
            putBoolean("isRemoved", true)
        }

        NotificationModule.notificationCallback?.invoke(data)
    }
}
