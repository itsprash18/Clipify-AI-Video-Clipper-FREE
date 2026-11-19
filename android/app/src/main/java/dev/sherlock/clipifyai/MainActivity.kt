package dev.sherlock.clipifyai

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import dev.sherlock.clipifyai.databinding.ActivityMainBinding
import dev.sherlock.clipifyai.media.AndroidMediaProcessor
import dev.sherlock.clipifyai.media.ProjectManager
import dev.sherlock.clipifyai.network.DesktopSyncClient
import dev.sherlock.clipifyai.onboarding.OnboardingActivity
import dev.sherlock.clipifyai.service.RenderForegroundService
import java.io.File

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: SharedPreferences
    private lateinit var projectManager: ProjectManager
    private lateinit var mediaProcessor: AndroidMediaProcessor
    private lateinit var syncClient: DesktopSyncClient

    private val selectVideoLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { handleSelectedVideo(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        prefs = getSharedPreferences("clipify_prefs", Context.MODE_PRIVATE)
        val skipOnboarding = intent.getBooleanExtra("skip_onboarding", false)
        val onboardingComplete = prefs.getBoolean("onboarding_complete", false) || skipOnboarding
        if (!onboardingComplete) {
            startActivity(Intent(this, OnboardingActivity::class.java))
            finish()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        projectManager = ProjectManager(this)
        mediaProcessor = AndroidMediaProcessor(this)
        val desktopHost = prefs.getString("desktop_ip", "http://192.168.1.100:5000") ?: "http://192.168.1.100:5000"
        syncClient = DesktopSyncClient(desktopHost)

        setupWebView()
        setupNavigation()
        setupHeaderListeners()
        loadInitialPage()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            useWideViewPort = true
            loadWithOverviewMode = true
        }

        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    binding.webProgress.visibility = android.view.View.VISIBLE
                    binding.webProgress.progress = newProgress
                } else {
                    binding.webProgress.visibility = android.view.View.GONE
                }
            }
        }

        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    if (url.contains("github.com")) {
                        openExternalUrl(url)
                        return true
                    }
                }
                return false
            }
        }

        // Expose Native Android Bridge to JavaScript
        binding.webView.addJavascriptInterface(ClipifyAndroidBridge(), "AndroidBridge")
    }

    private fun loadInitialPage() {
        val target = intent.getStringExtra("target_url")
        if (!target.isNullOrEmpty()) {
            binding.webView.loadUrl(target)
        } else {
            binding.webView.loadUrl("file:///android_asset/www/index.html")
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        val target = intent?.getStringExtra("target_url")
        if (!target.isNullOrEmpty()) {
            binding.webView.loadUrl(target)
        }
    }

    private fun setupHeaderListeners() {
        binding.btnHeaderGithub.setOnClickListener {
            openExternalUrl("https://github.com/sherlock-dev-ai/Clipify-AI-Video-Clipper-FREE")
        }
        binding.btnHeaderTour.setOnClickListener {
            triggerInteractiveTour()
        }
    }

    private fun setupNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_create -> {
                    binding.webView.loadUrl("file:///android_asset/www/index.html")
                    true
                }
                R.id.nav_narrate -> {
                    binding.webView.loadUrl("file:///android_asset/www/narrate.html")
                    true
                }
                R.id.nav_live -> {
                    binding.webView.loadUrl("file:///android_asset/www/live.html")
                    true
                }
                R.id.nav_projects -> {
                    binding.webView.loadUrl("file:///android_asset/www/index.html#projects")
                    true
                }
                else -> false
            }
        }
    }

    private fun handleSelectedVideo(videoUri: Uri) {
        val fileName = getFileNameFromUri(videoUri)
        val (w, h) = mediaProcessor.getVideoDimensions(videoUri)
        val cropCoords = mediaProcessor.calculateVertical916Crop(w, h)

        val projId = projectManager.createProject("Mobile Clip " + System.currentTimeMillis(), videoUri.toString())
        Toast.makeText(this, "Imported: $fileName (${w}x${h})", Toast.LENGTH_SHORT).show()

        // Update web view UI
        val jsCall = "if (window.onAndroidVideoSelected) window.onAndroidVideoSelected('$videoUri', '$fileName', 0);"
        binding.webView.evaluateJavascript(jsCall, null)

        // Launch background render service
        val serviceIntent = Intent(this, RenderForegroundService::class.java).apply {
            action = RenderForegroundService.ACTION_START_RENDER
            putExtra("video_uri", videoUri.toString())
            putExtra("project_id", projId)
            putExtra("crop_w", cropCoords.width)
            putExtra("crop_h", cropCoords.height)
        }
        startForegroundService(serviceIntent)
    }

    private fun getFileNameFromUri(uri: Uri): String {
        return uri.lastPathSegment?.substringAfterLast('/') ?: "imported_video.mp4"
    }

    private fun openExternalUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Could not open browser", Toast.LENGTH_SHORT).show()
        }
    }

    private fun triggerInteractiveTour() {
        binding.webView.evaluateJavascript(
            "if (window.startClipifyTour) { window.startClipifyTour(); } else { console.log('Tour not loaded'); }",
            null
        )
    }

    inner class ClipifyAndroidBridge {
        @JavascriptInterface
        fun pickVideo() {
            runOnUiThread {
                selectVideoLauncher.launch("video/*")
            }
        }

        @JavascriptInterface
        fun openBrowser(url: String) {
            runOnUiThread {
                openExternalUrl(url)
            }
        }

        @JavascriptInterface
        fun showToast(msg: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, msg, Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun triggerInteractiveTour() {
            runOnUiThread {
                this@MainActivity.triggerInteractiveTour()
            }
        }
    }
}
