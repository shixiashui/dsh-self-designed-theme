"""Finalize the backdrop asset: content revision, emitted file name, reference.

Usage:
    python tools/finalize-asset.py [assets-dir]

Renames `backdrop.webp` to `backdrop-<rev>.webp`, where <rev> is the first 12
hex digits of the file's SHA-1 — the form DSH's client-modules asset route
expects, so one URL always names one content. Prints the reference string to
paste into `BACKDROP_REF` in client.js. Probe files from prepare-art.py are
removed.
"""
import hashlib
import os
import sys
import urllib.parse

PKG = "dsh-self-designed-theme"


def main(argv):
    assets = os.path.abspath(argv[1] if len(argv) > 1 else os.path.join("lib", "assets"))
    for name in list(os.listdir(assets)):
        if name.startswith("probe-") or name in ("icon-art.png", "backdrop-soft.webp"):
            os.remove(os.path.join(assets, name))

    plain = os.path.join(assets, "backdrop.webp")
    if not os.path.exists(plain):
        print("no backdrop.webp in", assets, "- run prepare-art.py first")
        return 1
    with open(plain, "rb") as handle:
        raw = handle.read()

    rev = hashlib.sha1(raw).hexdigest()[:12]
    emitted = "backdrop-%s.webp" % rev
    os.rename(plain, os.path.join(assets, emitted))

    # packageAssetReference: each segment percent-encoded, then !'()* escaped.
    seg = urllib.parse.quote(emitted, safe="")
    for ch, code in (("!", "%21"), ("'", "%27"), ("(", "%28"), (")", "%29"), ("*", "%2A")):
        seg = seg.replace(ch, code)

    print("revision :", rev)
    print("emitted  :", emitted)
    print("bytes    :", len(raw))
    print("reference: plugins/%s/assets/%s" % (PKG, seg))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
