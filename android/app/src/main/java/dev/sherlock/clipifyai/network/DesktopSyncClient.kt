package dev.sherlock.clipifyai.network

import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

class DesktopSyncClient(private var desktopHost: String = "http://192.168.1.100:5000") {

    private val client = OkHttpClient.Builder()
        .connectTimeout(2, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    fun testConnection(callback: (Boolean, String?) -> Unit) {
        val request = Request.Builder()
            .url("$desktopHost/api/health")
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                callback(false, e.localizedMessage)
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                val successful = response.isSuccessful
                val body = response.body?.string()
                callback(successful, body)
            }
        })
    }

    fun updateHost(newHost: String) {
        this.desktopHost = newHost.trim().removeSuffix("/")
    }
}
