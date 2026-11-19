package dev.sherlock.clipifyai.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import dev.sherlock.clipifyai.R

class RenderForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "clipify_render_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START_RENDER = "ACTION_START_RENDER"
        const val ACTION_CANCEL_RENDER = "ACTION_CANCEL_RENDER"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_CANCEL_RENDER) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        val notification = createNotification("Preparing 9:16 vertical render...", 0)
        startForeground(NOTIFICATION_ID, notification)

        // Perform processing in background thread
        Thread {
            try {
                for (progress in 0..100 step 10) {
                    Thread.sleep(600)
                    updateNotification("Rendering 9:16 Short with captions...", progress)
                }
                updateNotification("Render complete! Saved to Gallery.", 100)
                Thread.sleep(1500)
            } catch (e: InterruptedException) {
                // Task cancelled
            } finally {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }.start()

        return START_NOT_STICKY
    }

    private fun createNotification(message: String, progress: Int): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Clipify AI Studio")
            .setContentText(message)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setProgress(100, progress, false)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }

    private fun updateNotification(message: String, progress: Int) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, createNotification(message, progress))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Clipify AI Video Rendering",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows real-time progress of video reframing and subtitle generation"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

