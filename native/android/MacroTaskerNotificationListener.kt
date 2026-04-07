package com.anonymous.macrotasker

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.os.Bundle

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

        NotificationModuleBridge.emitNotification(data)
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

        NotificationModuleBridge.emitNotification(data)
    }
}
