"""Generate a license-free placeholder backdrop for this plugin.

Usage:
    python tools/make-placeholder.py [output-dir]

Writes `backdrop.webp` — a soft vertical gradient in the plugin's own water-blue
palette, with faint horizontal bands, a light vignette, and fine grain. It is
original generated artwork, safe to redistribute, so the plugin looks
intentional out of the box before you add your own picture.

Run `finalize-asset.py` afterwards to content-revision the file name and print
the reference that client.js expects.

Requires Pillow.
"""
import os
import sys

from PIL import Image, ImageDraw

WIDTH = 1600
HEIGHT = 893

# Top to bottom: pale sky, sunlit shallows, deep reflection.
STOPS = [
    (0.00, (223, 231, 239)),
    (0.28, (196, 211, 226)),
    (0.46, (160, 181, 205)),
    (0.62, (127, 147, 171)),
    (0.80, (86, 106, 128)),
    (1.00, (48, 64, 78)),
]


def mix(left, right, t):
    return tuple(int(left[i] + (right[i] - left[i]) * t) for i in range(3))


def ramp(y01):
    for index in range(len(STOPS) - 1):
        start, start_color = STOPS[index]
        end, end_color = STOPS[index + 1]
        if y01 <= end:
            span = end - start
            t = 0.0 if span == 0 else (y01 - start) / span
            # Smoothstep keeps the band edges soft instead of linear.
            eased = t * t * (3 - 2 * t)
            return mix(start_color, end_color, eased)
    return STOPS[-1][1]


def main(argv):
    out_dir = os.path.abspath(argv[1] if len(argv) > 1 else os.path.join("lib", "assets"))
    os.makedirs(out_dir, exist_ok=True)

    pixels = []
    for y in range(HEIGHT):
        base = ramp(y / (HEIGHT - 1))
        row = []
        for x in range(WIDTH):
            # Faint horizontal bands: shallow ripples, low contrast on purpose.
            ripple = 5.5 * ((y % 37) / 37 - 0.5)
            # Light drifts sideways so the image is not a flat bar stack.
            drift = 3.0 * (((x / WIDTH) - 0.5) * (y / HEIGHT))
            row.append(tuple(max(0, min(255, int(c + ripple + drift))) for c in base))
        pixels.extend(row)

    image = Image.new("RGB", (WIDTH, HEIGHT))
    image.putdata(pixels)

    # Vignette: darken the corners a little so the UI reads as the focal plane.
    shade = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(shade)
    draw.ellipse((-WIDTH * 0.25, -HEIGHT * 0.35, WIDTH * 1.25, HEIGHT * 1.35), fill=255)
    dark = image.copy()
    draw_dark = ImageDraw.Draw(dark)
    draw_dark.rectangle((0, 0, WIDTH, HEIGHT), fill=(24, 30, 36))
    image = Image.composite(image, dark, shade)

    # Fine grain: kills gradient banding on large flat panels.
    from PIL import ImageFilter

    grain = Image.effect_noise((WIDTH, HEIGHT), 14).convert("L")
    image = image.filter(ImageFilter.SMOOTH_MORE)
    overlay = Image.blend(image, Image.composite(
        image.point(lambda v: min(255, v + 9)),
        image.point(lambda v: max(0, v - 9)),
        grain.point(lambda v: 255 - v // 3),
    ), 0.55)

    target = os.path.join(out_dir, "backdrop.webp")
    overlay.save(target, "WEBP", quality=78, method=6)
    print("wrote", target, os.path.getsize(target), "bytes")
    print("Next: python tools/finalize-asset.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
