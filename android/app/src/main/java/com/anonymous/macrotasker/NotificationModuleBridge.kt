package com.anonymous.macrotasker

import android.app.Notification
import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.os.Bundle
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationModuleBridge(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NotificationModule"

    @ReactMethod
    fun isPermissionGranted(callback: Callback) {
        val enabled = isNotificationServiceEnabled()
        callback.invoke(enabled)
    }

    @ReactMethod
    fun requestPermission() {
        val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Required for RN event emitter
    }

    private fun isNotificationServiceEnabled(): Boolean {
        val pkgName = reactContext.packageName
        val flat = android.provider.Settings.Secure.getString(
            reactContext.contentResolver,
            "enabled_notification_listeners"
        )
        return flat?.contains(pkgName) == true
    }

    companion object {
        var context: ReactApplicationContext? = null

        fun emitNotification(data: Bundle) {
            val params = android.os.Bundle().apply {
                putString("packageName", data.getString("packageName"))
                putString("title", data.getString("title"))
                putString("text", data.getString("text"))
                putLong("timestamp", data.getLong("timestamp"))
                putBoolean("isRemoved", data.getBoolean("isRemoved"))
            }

            context?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("onNotificationReceived", android.os.Bundle().apply {
                    putString("packageName", params.getString("packageName"))
                    putString("title", params.getString("title"))
                    putString("text", params.getString("text"))
                    putLong("timestamp", params.getLong("timestamp"))
                    putBoolean("isRemoved", params.getBoolean("isRemoved"))
                })
        }
    }

    init {
        context = reactContext
    }
}
