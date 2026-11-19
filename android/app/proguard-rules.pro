# Clipify AI Proguard Rules
-keep class dev.sherlock.clipifyai.media.** { *; }
-keep class dev.sherlock.clipifyai.network.** { *; }
-keep class dev.sherlock.clipifyai.service.** { *; }
-keepattributes *Annotation*
-dontwarn okhttp3.**
