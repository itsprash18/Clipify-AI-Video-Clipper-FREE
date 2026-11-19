# 🎨 Clipify AI — Shared Design System Guide
### Desktop (Windows, Linux, macOS) & Mobile (Android)
**Version:** 1.0.0

---

## 1. Overview
The Clipify AI Design System defines the exact visual hierarchy, component anatomy, color values, typography, and interactive behaviors across all platforms. The visual goal is to provide **ONE unmistakable Clipify AI identity** whether a user is operating on a multi-monitor Windows or Linux setup, a MacBook, or an Android phone.

---

## 2. Core Color Palette
| Token | Value | Semantic Meaning |
| :--- | :--- | :--- |
| `--clipify-bg` | `#09090b` | Canvas background |
| `--clipify-bg-2` | `#121215` | Secondary surface background |
| `--clipify-panel` | `rgba(18, 18, 21, 0.94)` | Studio card & container panel |
| `--clipify-line` | `#27272a` | Subtle border and dividers |
| `--clipify-line-strong`| `#3f3f46` | Active/hover border lines |
| `--clipify-text` | `#fafafa` | Primary heading and high-contrast text |
| `--clipify-muted` | `#a1a1aa` | Secondary body text and labels |
| `--clipify-brand` | `#6366f1` | Primary brand indigo accent |
| `--clipify-brand-glow`| `rgba(99, 102, 241, 0.35)`| Focused glow effect |
| `--clipify-success` | `#10b981` | Engine ready, completed tasks |
| `--clipify-warning` | `#f59e0b` | Cautionary state, buffer warnings |
| `--clipify-error` | `#ef4444` | Live stream errors, validation failures |

---

## 3. Typography Hierarchy
* **Display Font**: `Montserrat`, bold & heavy weights for headings, titles, and live status badges.
* **UI Sans Font**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, optimized for legibility at 12px-16px.
* **Code / Terminal Font**: `JetBrains Mono, Fira Code, monospace`, used in the Studio Activity Console and live scoring logs.

---

## 4. Component Rules

### Buttons
1. **Primary Button**: White pill/rounded rectangle (`#ffffff`), dark inverted text (`#09090b`). Used for main actions: `Generate Clips`, `Clip Highlight`, `Get Started`.
2. **Brand Button**: Glowing indigo gradient (`#6366f1` to `#4f46e5`). Used for AI actions: `Rank Clips AI`, `AI Narration`.
3. **Secondary Button**: Translucent dark (`rgba(255, 255, 255, 0.05)`) with subtle border. Used for `Preview ▶`, `Edit ✂️`, `Save ↓`.
4. **Touch Target Accessibility**: Minimum height of `44px` on mobile/Android devices.

### Cards & Shelves
1. **Desktop Panels**: Flat dark panels with 1px border (`#27272a`) and 12px-16px border-radius.
2. **Horizontal Shelves**: Sideways scrolling carousel (`overflow-x: auto`) with navigation chevrons (`‹` and `›`), snap alignment, and fixed card dimensions (168px wide).

### Mobile Ergonomics (Android)
1. **Bottom Navigation Bar**: 64px fixed bar replacing the 220px desktop sidebar on screens `<= 768px`.
2. **Single-Column Grid**: Two-column desktop layouts stack into clean, vertical scrolls on mobile.
3. **Touch-Friendly Controls**: Touch targets padded to at least 44x44 points.

---

## 5. Visual Regression Checklist
Before releasing or merging any platform code, verify against the Windows baseline:
- [x] Background radial gradient and dot matrix noise present.
- [x] Studio logo (brand mark) and typography match exactly.
- [x] Active video previews render with zero letterboxing distortion.
- [x] Status dots pulse cleanly with CSS keyframes.
- [x] Sideways shelves scroll smoothly without breaking layout.
