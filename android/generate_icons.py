import os
from PIL import Image, ImageDraw

res_dir = r"L:\ClipifyAI\android\app\src\main\res"
icon_src = r"L:\ClipifyAI\static\icon.png"

im = Image.open(icon_src).convert("RGBA")

# Densities for standard launcher icons (square and round)
densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Densities for adaptive icon foreground (108dp base grid, with 72dp content area)
adaptive_densities = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

def make_round(img):
    size = img.size
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)
    output = Image.new('RGBA', size, (0, 0, 0, 0))
    output.paste(img, (0, 0), mask=mask)
    return output

for folder, size in densities.items():
    d = os.path.join(res_dir, folder)
    os.makedirs(d, exist_ok=True)
    # Standard square icon
    sq = im.resize((size, size), Image.Resampling.LANCZOS)
    sq.save(os.path.join(d, "ic_launcher.png"), "PNG")
    # Round icon
    rd = make_round(sq)
    rd.save(os.path.join(d, "ic_launcher_round.png"), "PNG")
    print(f"Generated {folder} ic_launcher ({size}x{size})")

for folder, size in adaptive_densities.items():
    d = os.path.join(res_dir, folder)
    os.makedirs(d, exist_ok=True)
    # Adaptive foreground: place logo scaled down inside the 108dp canvas (centered, 66% width)
    content_size = int(size * 0.72)
    scaled_logo = im.resize((content_size, content_size), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    offset = (size - content_size) // 2
    canvas.paste(scaled_logo, (offset, offset), mask=scaled_logo)
    canvas.save(os.path.join(d, "ic_launcher_foreground.png"), "PNG")
    print(f"Generated {folder} ic_launcher_foreground ({size}x{size})")

# Create anydpi-v26 adaptive icon XML definitions
anydpi_dir = os.path.join(res_dir, "mipmap-anydpi-v26")
os.makedirs(anydpi_dir, exist_ok=True)

ic_launcher_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/clipify_bg" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
"""
with open(os.path.join(anydpi_dir, "ic_launcher.xml"), "w", encoding="utf-8") as f:
    f.write(ic_launcher_xml)

ic_launcher_round_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/clipify_bg" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
"""
with open(os.path.join(anydpi_dir, "ic_launcher_round.xml"), "w", encoding="utf-8") as f:
    f.write(ic_launcher_round_xml)

print("Created anydpi-v26 adaptive icon XMLs.")

# Copy author avatar for tour
avatar_src = r"L:\ClipifyAI\static\author-avatar.png"
if os.path.exists(avatar_src):
    av_im = Image.open(avatar_src).convert("RGBA")
    drawable_dir = os.path.join(res_dir, "drawable")
    av_im.save(os.path.join(drawable_dir, "author_avatar.png"), "PNG")
    print("Copied author_avatar.png to drawable/")

# Copy high-res icon to drawable for splash
im.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(drawable_dir, "ic_clipify_branding.png"), "PNG")
print("Generated ic_clipify_branding.png in drawable/")

