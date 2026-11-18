"""Prepare the backdrop artwork and sample its palette for this theme plugin.

Usage:
    python tools/prepare-art.py <source-image> [output-dir]

Writes `backdrop.webp` into the output directory and prints the dominant colors
of a few regions, which is what the palette in client.js was tuned from. Run
`finalize-asset.py` afterwards to content-revision the file name and print the
reference that client.js expects.

Requires Pillow.
"""
import json
import os
import sys

from PIL import Image, ImageFilter


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    src = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join("lib", "assets")
    os.makedirs(out_dir, exist_ok=True)

    img = Image.open(src).convert("RGB")
    print("source", img.size, src)

    # Full-resolution backdrop, served through the package-asset route.
    img.save(os.path.join(out_dir, "backdrop.webp"), "WEBP", quality=80, method=6)

    # Palette sampling: dominant colors of the regions that carry the mood.
    def hexs(color):
        return "#%02x%02x%02x" % tuple(color[:3])

    def region(name, box, k=6):
        crop = img.crop(box)
        quantized = crop.quantize(colors=k, method=Image.MEDIANCUT).convert("RGB")
        counts = sorted(quantized.getcolors(), reverse=True)
        return {name: [(hexs(color), n) for n, color in counts]}

    width, height = img.size
    samples = {}
    samples.update(region("upper", (0, 0, width, int(height * 0.45))))
    samples.update(region("middle", (0, int(height * 0.40), width, int(height * 0.75))))
    samples.update(region("lower", (0, int(height * 0.70), width, height)))
    samples.update(region("overall", (0, 0, width, height), k=10))
    print(json.dumps(samples, indent=1))

    for size in (1600, 1280, 1024):
        probe = img.copy()
        probe = probe.resize((size, int(size * height / width)), Image.LANCZOS)
        name = os.path.join(out_dir, "probe-%d.webp" % size)
        probe.save(name, "WEBP", quality=80, method=6)
        print("webp", size, os.path.getsize(name))
    print("Next: python tools/finalize-asset.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
