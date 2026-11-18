# Preview checklist

No screenshots are bundled yet. After installing, capture these two and drop
them beside this file — they are the pair that actually shows whether the
transparency balance works.

## 1. `preview-home.png` — the blank home

1. Open DSH and start a **new session** (the blank home, not a transcript).
2. Make sure the wallpaper is on: **Settings → General → Illustration wallpaper →
   Wallpaper**, with Strength at the default 70.
3. Capture the whole window, including the sidebar.

What should be visible: the artwork behind the sidebar *and* the hero, the
headline and workspace picker reading clearly over the picture, and the
composer card as light-blue glass.

## 2. `preview-chat.png` — a live session

1. Open any session with a few turns, ideally including one code block and one
   file/diff card.
2. Capture the transcript with the composer visible at the bottom.

What should be visible: chat text sitting directly over the artwork with no
panel behind it, bubbles as a very light tint, the code block translucent but
still comfortable to read, and — if you open a menu — the menu staying
near-solid.

## Also worth one capture

- **Dark scheme**: switch Appearance to Dark and repeat capture 1. The plugin
  layers a translucent dark veil over the image so light text stays legible;
  this is the case most likely to need tuning for your own artwork.

## Capturing on Desktop

Desktop renders the UI in its own window, so an OS screenshot is the reliable
route:

- Windows: <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> → Rectangular clip
- macOS: <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>4</kbd>, then select the window

Prefer a window-sized capture over a full-desktop one, and keep each file under
about 500 KB so the README stays light.

## Adding them

```sh
git add docs/preview-home.png docs/preview-chat.png README.md
git commit -m "docs: add preview screenshots"
```

Then restore the image lines in `README.md` under **Preview**:

```markdown
![Wallpaper on the blank home](docs/preview-home.png)
![Glass transcript over the artwork](docs/preview-chat.png)
```
