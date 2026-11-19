package dev.sherlock.clipifyai.media

import android.content.Context
import android.graphics.Rect
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Environment
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class CropCoordinates(
    val left: Int,
    val top: Int,
    val width: Int,
    val height: Int
)

class AndroidMediaProcessor(private val context: Context? = null) {

    fun calculateVertical916Crop(inputWidth: Int, inputHeight: Int): CropCoordinates {
        // Target aspect ratio is 9:16 (0.5625)
        val targetAspect = 9.0 / 16.0
        val currentAspect = inputWidth.toDouble() / inputHeight.toDouble()

        return if (currentAspect > targetAspect) {
            // Source is wider than 9:16 (standard landscape 16:9)
            // Height is preserved, width is cropped to height * 9/16
            val cropWidth = (inputHeight * targetAspect).toInt()
            val cropLeft = (inputWidth - cropWidth) / 2
            CropCoordinates(left = cropLeft, top = 0, width = cropWidth, height = inputHeight)
        } else {
            // Source is taller than 9:16
            val cropHeight = (inputWidth / targetAspect).toInt()
            val cropTop = (inputHeight - cropHeight) / 2
            CropCoordinates(left = 0, top = cropTop, width = inputWidth, height = cropHeight)
        }
    }

    fun getVideoDimensions(videoUri: Uri): Pair<Int, Int> {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(context, videoUri)
            val width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toInt() ?: 1920
            val height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toInt() ?: 1080
            val rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toInt() ?: 0
            if (rotation == 90 || rotation == 270) {
                Pair(height, width)
            } else {
                Pair(width, height)
            }
        } catch (e: Exception) {
            Pair(1920, 1080)
        } finally {
            retriever.release()
        }
    }

    fun getExportFile(): File {
        val moviesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES)
        val clipifyDir = File(moviesDir, "ClipifyAI")
        if (!clipifyDir.exists()) clipifyDir.mkdirs()

        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        return File(clipifyDir, "Clipify_Short_$timestamp.mp4")
    }
}
