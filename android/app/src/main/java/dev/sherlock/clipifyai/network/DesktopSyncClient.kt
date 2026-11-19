package dev.sherlock.clipifyai.network

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

class DesktopSyncClient(private var desktopHost: String = "http://192.168.1.100:5000") {

    private val client = OkHttpClient.Builder()
        .connectTimeout(3, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
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

    fun fetchAvailableModels(callback: (List<String>) -> Unit) {
        val request = Request.Builder()
            .url("$desktopHost/api/models")
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                callback(emptyList())
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                val result = mutableListOf<String>()
                if (response.isSuccessful) {
                    try {
                        val body = response.body?.string() ?: "{}"
                        val json = JSONObject(body)
                        val models = json.optJSONArray("models") ?: JSONArray()
                        for (i in 0 until models.length()) {
                            result.add(models.getString(i))
                        }
                    } catch (e: Exception) {
                        // fallback
                    }
                }
                callback(result)
            }
        })
    }

    fun syncProjectToDesktop(projectJsonString: String, callback: (Boolean, String?) -> Unit) {
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = projectJsonString.toRequestBody(mediaType)
        val request = Request.Builder()
            .url("$desktopHost/api/projects/sync")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                callback(false, e.localizedMessage)
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                callback(response.isSuccessful, response.body?.string())
            }
        })
    }

    fun updateHost(newHost: String) {
        this.desktopHost = newHost.trim().removeSuffix("/")
    }
}
