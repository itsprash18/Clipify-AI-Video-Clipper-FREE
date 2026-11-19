package dev.sherlock.clipifyai

import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import dev.sherlock.clipifyai.databinding.ActivityMainBinding
import dev.sherlock.clipifyai.onboarding.OnboardingActivity
import dev.sherlock.clipifyai.service.RenderForegroundService

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: SharedPreferences

    private val selectVideoLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { handleSelectedVideo(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        prefs = getSharedPreferences("clipify_prefs", MODE_PRIVATE)
        val onboardingComplete = prefs.getBoolean("onboarding_complete", false)
        if (!onboardingComplete) {
            startActivity(Intent(this, OnboardingActivity::class.java))
            finish()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupNavigation()
        setupListeners()
    }

    private fun setupNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_create -> {
                    // Switch to Create / Shorts Studio view
                    true
                }
                R.id.nav_live -> {
                    // Switch to Live Studio view
                    true
                }
                R.id.nav_narrate -> {
                    // Switch to Narrate Studio view
                    true
                }
                R.id.nav_projects -> {
                    // Switch to Projects Library view
                    true
                }
                else -> false
            }
        }
    }

    private fun setupListeners() {
        binding.btnImportVideo?.setOnClickListener {
            selectVideoLauncher.launch("video/*")
        }
    }

    private fun handleSelectedVideo(videoUri: Uri) {
        Toast.makeText(this, "Imported video for 9:16 processing", Toast.LENGTH_SHORT).show()
        
        // Start Background Render Service
        val serviceIntent = Intent(this, RenderForegroundService::class.java).apply {
            action = RenderForegroundService.ACTION_START_RENDER
            putExtra("video_uri", videoUri.toString())
        }
        startForegroundService(serviceIntent)
    }
}
