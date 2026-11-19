package dev.sherlock.clipifyai

import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import dev.sherlock.clipifyai.databinding.ActivityMainBinding
import dev.sherlock.clipifyai.media.ProjectManager
import dev.sherlock.clipifyai.network.DesktopSyncClient
import dev.sherlock.clipifyai.onboarding.OnboardingActivity
import dev.sherlock.clipifyai.service.RenderForegroundService

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: SharedPreferences
    private lateinit var projectManager: ProjectManager
    private lateinit var syncClient: DesktopSyncClient

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

        projectManager = ProjectManager(this)
        val desktopHost = prefs.getString("desktop_ip", "http://192.168.1.100:5000") ?: "http://192.168.1.100:5000"
        syncClient = DesktopSyncClient(desktopHost)

        setupNavigation()
        setupListeners()
        checkEngineStatus()
    }

    private fun setupNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_create -> {
                    Toast.makeText(this, "Shorts Studio: Ready to import", Toast.LENGTH_SHORT).show()
                    true
                }
                R.id.nav_live -> {
                    Toast.makeText(this, "Live Studio: Monitor active live streams", Toast.LENGTH_SHORT).show()
                    true
                }
                R.id.nav_narrate -> {
                    Toast.makeText(this, "Narrate AI: Text-to-Speech voice generator", Toast.LENGTH_SHORT).show()
                    true
                }
                R.id.nav_projects -> {
                    val count = projectManager.listProjects().size
                    Toast.makeText(this, "Projects Library: $count projects saved", Toast.LENGTH_SHORT).show()
                    true
                }
                else -> false
            }
        }
    }

    private fun setupListeners() {
        binding.btnImportVideo.setOnClickListener {
            selectVideoLauncher.launch("video/*")
        }
    }

    private fun checkEngineStatus() {
        syncClient.testConnection { connected, msg ->
            runOnUiThread {
                if (connected) {
                    binding.tvEngineStatus.text = "● Connected to Desktop GPU Engine (WhisperX + Ollama)"
                    binding.tvEngineStatus.setTextColor(getColor(R.color.clipify_success))
                } else {
                    binding.tvEngineStatus.text = "● Ready (On-Device Mobile Engine)"
                    binding.tvEngineStatus.setTextColor(getColor(R.color.clipify_cyan))
                }
            }
        }
    }

    private fun handleSelectedVideo(videoUri: Uri) {
        val projId = projectManager.createProject("Mobile Clip " + System.currentTimeMillis(), videoUri.toString())
        Toast.makeText(this, "Imported! Created project $projId", Toast.LENGTH_SHORT).show()
        
        // Start Background Render Service
        val serviceIntent = Intent(this, RenderForegroundService::class.java).apply {
            action = RenderForegroundService.ACTION_START_RENDER
            putExtra("video_uri", videoUri.toString())
            putExtra("project_id", projId)
        }
        startForegroundService(serviceIntent)
    }
}
