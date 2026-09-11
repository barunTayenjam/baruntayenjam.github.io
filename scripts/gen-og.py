#!/usr/bin/env python3
"""Regenerate og-image.png from live stats in content.json. ponytail: PIL-only; swap for a design tool if brand evolves."""
import json
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
CONTENT = json.load(open("content.json"))
stats = CONTENT["impactStats"]
person = CONTENT["person"]

img = Image.new("RGB", (W, H), (3, 7, 13))
d = ImageDraw.Draw(img)
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(3 + 8 * t), int(7 + 9 * t), int(13 + 11 * t)))
d.rectangle([60, 90, 1140, 540], outline=(240, 166, 60), width=4)

def font(sz, bold=True):
    for p in [
        "/usr/share/fonts/TTF/DejaVuSans%s.ttf" % ("-Bold" if bold else ""),
        "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else ""),
        "/usr/share/fonts/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else ""),
    ]:
        try:
            return ImageFont.truetype(p, sz)
        except OSError:
            continue
    return ImageFont.load_default()

d.text((100, 150), person["name"], font=font(84), fill=(240, 166, 60))
d.text((100, 250), person["title"] + "  ·  " + person["subtitle"], font=font(32, False), fill=(216, 232, 226))
for i, s in enumerate(stats[:4]):
    x = 100 + i * 260
    d.text((x, 350), s["value"] + " " + s["unit"], font=font(44), fill=(240, 166, 60))
    d.text((x, 410), s["label"], font=font(26, False), fill=(138, 168, 160))
d.text((100, 485), "baruntayenjam.github.io", font=font(30, False), fill=(138, 168, 160))
img.save("og-image.png")
print("wrote og-image.png")
