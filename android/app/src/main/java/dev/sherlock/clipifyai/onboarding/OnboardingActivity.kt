package dev.sherlock.clipifyai.onboarding

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.StatFs
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import dev.sherlock.clipifyai.MainActivity
import dev.sherlock.clipifyai.R
import dev.sherlock.clipifyai.databinding.ActivityOnboardingBinding

class OnboardingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingBinding
    private lateinit var prefs: SharedPreferences
    private var currentStep = 1
    private val totalSteps = 7

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions.entries.all { it.value }
        if (granted) {
            Toast.makeText(this, "Permissions granted", Toast.LENGTH_SHORT).show()
        }
        advanceStep()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = getSharedPreferences("clipify_prefs", Context.MODE_PRIVATE)

        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        renderCurrentStep()
        setupListeners()
    }

    private fun setupListeners() {
        binding.btnNext.setOnClickListener {
            handleStepAction()
        }
        binding.btnBack.setOnClickListener {
            if (currentStep > 1) {
                currentStep--
                renderCurrentStep()
            }
        }
    }

    private fun handleStepAction() {
        when (currentStep) {
            1 -> advanceStep() // Screen 1: Welcome -> Next
            2 -> advanceStep() // Screen 2: Compatibility -> Next
            3 -> requestRequiredPermissions() // Screen 3: Permissions
            4 -> {
                // Screen 4: Save AI Option (Default LAN or Selected)
                val selectedOption = when (binding.rgAiOptions.checkedRadioButtonId) {
                    R.id.rb_option_lan -> "LAN"
                    R.id.rb_option_remote -> "REMOTE"
                    else -> "ON_DEVICE"
                }
                prefs.edit().putString("ai_mode", selectedOption).apply()
                advanceStep()
            }
            5 -> advanceStep() // Screen 5: Video Processing -> Next
            6 -> {
                // Screen 6: Storage setup
                prefs.edit().putString("storage_mode", "INTERNAL_SCOPED").apply()
                advanceStep()
            }
            7 -> {
                // Screen 7: Completion
                prefs.edit().putBoolean("onboarding_complete", true).apply()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            }
        }
    }

    private fun advanceStep() {
        if (currentStep < totalSteps) {
            currentStep++
            renderCurrentStep()
        }
    }

    private fun renderCurrentStep() {
        binding.btnBack.visibility = if (currentStep > 1) View.VISIBLE else View.GONE
        binding.stepIndicator.text = "Step $currentStep of $totalSteps"
        binding.progressBar.progress = (currentStep * 100) / totalSteps

        // Hide all step containers
        binding.step1Welcome.visibility = View.GONE
        binding.step2Compat.visibility = View.GONE
        binding.step3Perms.visibility = View.GONE
        binding.step4Ai.visibility = View.GONE
        binding.step5Video.visibility = View.GONE
        binding.step6Storage.visibility = View.GONE
        binding.step7Complete.visibility = View.GONE

        when (currentStep) {
            1 -> {
                binding.step1Welcome.visibility = View.VISIBLE
                binding.btnNext.text = getString(R.string.onboarding_get_started)
            }
            2 -> {
                binding.step2Compat.visibility = View.VISIBLE
                binding.btnNext.text = "Continue"
                displayCompatibilityData()
            }
            3 -> {
                binding.step3Perms.visibility = View.VISIBLE
                binding.btnNext.text = "Grant Permissions"
            }
            4 -> {
                binding.step4Ai.visibility = View.VISIBLE
                binding.btnNext.text = "Confirm AI Setup"
            }
            5 -> {
                binding.step5Video.visibility = View.VISIBLE
                binding.btnNext.text = "Verify Video Codecs"
            }
            6 -> {
                binding.step6Storage.visibility = View.VISIBLE
                binding.btnNext.text = "Confirm Storage"
                displayStorageData()
            }
            7 -> {
                binding.step7Complete.visibility = View.VISIBLE
                binding.btnNext.text = getString(R.string.btn_open_studio)
            }
        }
    }

    private fun displayCompatibilityData() {
        val osVersion = "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})"
        val arch = Build.SUPPORTED_ABIS.joinToString(", ")
        val runtime = Runtime.getRuntime()
        val maxMemoryMb = runtime.maxMemory() / (1024 * 1024)
        
        binding.tvCompatOs.text = "OS: $osVersion"
        binding.tvCompatArch.text = "CPU Architecture: $arch"
        binding.tvCompatRam.text = "Available App Memory: ${maxMemoryMb} MB"
    }

    private fun displayStorageData() {
        val path = Environment.getDataDirectory()
        val stat = StatFs(path.path)
        val availableGb = (stat.availableBlocksLong * stat.blockSizeLong) / (1024 * 1024 * 1024)
        binding.tvStorageFree.text = "Free Device Storage: ${availableGb} GB"
    }

    private fun requestRequiredPermissions() {
        val perms = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            perms.add(Manifest.permission.READ_MEDIA_VIDEO)
            perms.add(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            perms.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        
        val missing = perms.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isEmpty()) {
            advanceStep()
        } else {
            permissionLauncher.launch(missing.toTypedArray())
        }
    }
}

