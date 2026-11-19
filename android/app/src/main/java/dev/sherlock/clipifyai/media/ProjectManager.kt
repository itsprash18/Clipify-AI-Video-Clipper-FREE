package dev.sherlock.clipifyai.media

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class ClipifyProjectSummary(
    val id: String,
    val title: String,
    val mediaPath: String,
    val durationSeconds: Double,
    val clipsCount: Int,
    val updatedAt: String
)

class ProjectManager(private val context: Context) {

    private val projectsDir: File by lazy {
        val dir = File(context.filesDir, "projects")
        if (!dir.exists()) dir.mkdirs()
        dir
    }

    fun listProjects(): List<ClipifyProjectSummary> {
        val result = mutableListOf<ClipifyProjectSummary>()
        val files = projectsDir.listFiles { f -> f.extension == "json" } ?: return result

        for (f in files) {
            try {
                val json = JSONObject(f.readText(Charsets.UTF_8))
                val id = json.optString("project_id", f.nameWithoutExtension)
                val title = json.optString("title", "Untitled Project")
                val media = json.optJSONObject("source_media")?.optString("path") ?: ""
                val duration = json.optJSONObject("source_media")?.optDouble("duration", 0.0) ?: 0.0
                val highlights = json.optJSONArray("highlights")?.length() ?: 0
                val updated = json.optString("updated_at", "")

                result.add(ClipifyProjectSummary(id, title, media, duration, highlights, updated))
            } catch (e: Exception) {
                // Ignore malformed files
            }
        }
        return result.sortedByDescending { it.updatedAt }
    }

    fun createProject(title: String, mediaPath: String): String {
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
        val id = "proj_" + System.currentTimeMillis()
        val file = File(projectsDir, "$id.json")

        val json = JSONObject().apply {
            put("clipify_version", "2.0.0")
            put("project_id", id)
            put("title", title)
            put("created_at", now)
            put("updated_at", now)
            put("source_media", JSONObject().apply {
                put("path", mediaPath)
                put("filename", File(mediaPath).name)
            })
            put("transcription", JSONObject().apply {
                put("language", "en")
                put("segments", JSONArray())
            })
            put("highlights", JSONArray())
            put("export_settings", JSONObject().apply {
                put("format", "mp4")
                put("aspect_ratio", "9:16")
                put("resolution", JSONArray(listOf(1080, 1920)))
                put("caption_style", "hormozi_yellow")
            })
        }

        file.writeText(json.toString(2), Charsets.UTF_8)
        return id
    }

    fun deleteProject(projectId: String): Boolean {
        val file = File(projectsDir, "$projectId.json")
        return file.delete()
    }
}
