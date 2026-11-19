package dev.sherlock.clipifyai

import dev.sherlock.clipifyai.media.AndroidMediaProcessor
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AndroidMediaProcessorTest {

    @Test
    fun test16x9LandscapeTo9x16Crop() {
        val inputW = 1920
        val inputH = 1080
        val targetAspect = 9.0 / 16.0
        val expectedWidth = (inputH * targetAspect).toInt() // 607
        val expectedLeft = (inputW - expectedWidth) / 2     // (1920 - 607)/2 = 656

        val processor = AndroidMediaProcessor()
        val crop = processor.calculateVertical916Crop(inputW, inputH)

        assertEquals(1080, crop.height)
        assertEquals(expectedWidth, crop.width)
        assertEquals(expectedLeft, crop.left)
        assertEquals(0, crop.top)
    }

    @Test
    fun test4x3LandscapeTo9x16Crop() {
        val inputW = 1440
        val inputH = 1080
        val targetAspect = 9.0 / 16.0
        val expectedWidth = (inputH * targetAspect).toInt() // 607

        val processor = AndroidMediaProcessor()
        val crop = processor.calculateVertical916Crop(inputW, inputH)

        assertEquals(1080, crop.height)
        assertEquals(expectedWidth, crop.width)
        assertEquals((1440 - expectedWidth) / 2, crop.left)
    }
}
