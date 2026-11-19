package dev.sherlock.clipifyai.onboarding

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import dev.sherlock.clipifyai.MainActivity
import dev.sherlock.clipifyai.databinding.ActivityOnboardingBinding

class OnboardingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingBinding
    private lateinit var prefs: SharedPreferences

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = getSharedPreferences("clipify_prefs", Context.MODE_PRIVATE)

        binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupInstallerWebView()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupInstallerWebView() {
        binding.installerWebview.setBackgroundColor(android.graphics.Color.parseColor("#090e0c"))
        binding.installerWebview.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        binding.installerWebview.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            useWideViewPort = false
            loadWithOverviewMode = false
            setSupportZoom(false)
            displayZoomControls = false
            cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
        }

        binding.installerWebview.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    binding.installerProgress.visibility = View.VISIBLE
                    binding.installerProgress.progress = newProgress
                } else {
                    binding.installerProgress.visibility = View.GONE
                }
            }
        }

        binding.installerWebview.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    openExternalUrl(url)
                    return true
                }
                return false
            }
        }

        binding.installerWebview.addJavascriptInterface(InstallerBridge(), "AndroidBridge")
        binding.installerWebview.loadUrl("file:///android_asset/www/installer/index.html")
    }

    private fun openExternalUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Could not open browser", Toast.LENGTH_SHORT).show()
        }
    }

    inner class InstallerBridge {
        @JavascriptInterface
        fun finishOnboarding() {
            runOnUiThread {
                prefs.edit().putBoolean("onboarding_complete", true).apply()
                val intent = Intent(this@OnboardingActivity, MainActivity::class.java)
                startActivity(intent)
                finish()
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
                Toast.makeText(this@OnboardingActivity, msg, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
