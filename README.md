# dsh-self-designed-theme

> 全应用插画壁纸 + 玻璃面板 · DeepSeek Harness UI 插件

A visual plugin for [DeepSeek Harness](https://github.com/deepseek-ai) (DSH) that paints an illustration as the wallpaper of the **entire application** — sidebar, home, and every session — and re-tunes every working surface into translucent glass over it, while text and icons stay crisp and opaque.

English | [中文](#中文)

> ⚠️ **What this repository ships.** The wallpaper is a **generated placeholder gradient** in a water-blue palette (5.7 KB, original, no copyright encumbrance). It is *not* the *PaperCranes1847* illustration that the design was built around — that artwork carries the artist's watermark and is not redistributed here. Drop your own image into `lib/assets/` to get the full effect; see [Customizing the artwork](#customizing-the-artwork).

---

## Preview

No screenshots are bundled yet. See [docs/preview.md](docs/preview.md) for the two captures worth taking after install — they are the fastest way to judge whether the transparency balance suits you.

What you should see:

- the artwork visible behind the **sidebar**, the **blank home**, and **inside every session**
- chat text sitting directly over the picture with no panel behind it
- a lightly frosted composer card you can still type on
- menus and popovers staying near-solid, on purpose

## The design

| Area | Effect |
|---|---|
| Background | Your artwork, **unmodified**, `cover`-cropped and viewport-fixed behind every page |
| Left sidebar | Transparent blue-grey |
| Transcript | Fully see-through |
| Chat bubbles | Very light tint |
| Top toolbar / right column | High transparency |
| Composer card | Light-blue glass |
| Code blocks / Diff | High transparency |
| Text and icons | Opaque, never touched |
| Menus and popovers | Near-solid (0.94) — kept readable on purpose |

In the dark scheme a translucent dark veil layers *over* the image pixels (the artwork itself is never edited) so light text stays legible.

## Requirements

- DeepSeek Harness **0.2.x** — developed and verified on Desktop `0.2.2-rc.3`.
- No API keys, no network calls, no model requests. This plugin contributes browser presentation only.

## Install

### 1. From GitHub

Ask an agent inside your DSH session:

```
把 dsh-self-designed-theme 装上：github:shixiashui/dsh-self-designed-theme
```

The plugin manager probes the repository with `git ls-remote` before installing anything.

For the **Web** profile you can also use the CLI:

```sh
dsh plugin --profile web add github:shixiashui/dsh-self-designed-theme
```

> **Desktop note:** the Desktop profile is managed in-app — the CLI refuses `--profile desktop`. Use the agent route above inside a Desktop session, or method 3.

### 2. From npm (if published)

```sh
dsh plugin --profile web add dsh-self-designed-theme
```

or simply ask an agent: 「安装 dsh-self-designed-theme」.

### 3. From a local clone

```sh
git clone https://github.com/shixiashui/dsh-self-designed-theme.git
```

Then **Settings → Plugins → Add plugin** and point it at the cloned directory. This links the checkout, so a later `git pull` takes effect after a Host restart.

## Use

**Settings → General → Illustration wallpaper**

| Control | Meaning |
|---|---|
| Wallpaper | Master switch: the image plus the glass layer. Off restores the stock opaque UI |
| Water-blue tint | Glass tinted with the palette sampled from the artwork, vs. the stock neutral palette at the same alphas |
| Strength (10–100%) | Higher = more transparent panels = a clearer picture. Default 70 |

Changes apply live and persist in your profile's `cordis.patch.yml`:

```yaml
- insert:
    - id: self-designed-theme
      name: dsh-self-designed-theme
      config:
        backdrop: true
        palette: true
        intensity: 70
```

## How it works

- **Wallpaper**: a plugin-owned stylesheet paints the image on `html` (`background-attachment: fixed`), so it sits behind the body and every column. The bytes are served through DSH's documented package-asset route.
- **Glass**: one `ctx.theme.overrideTokens()` layer turns ~29 documented tokens into `rgba()` fills — `bg-base`, `bg-layer-1/2/3`, `card-fill`, `specific-bubble`, `specific-input-major`, `specific-sidebar-fill`, `markdown-code-*`, `file-diff-*`, `bg-document-preview`, `bg-overlay` — each supplying **both** a light and a dark value, so switching schemes never goes illegible.
- Text, icon, border, and accent tokens are deliberately never made translucent.
- The sidebar token stays a flat translucent **color**, because host styles feed it to `color-mix()` and nest it inside another gradient, where a gradient value would be invalid. The transparent blue-grey *gradient* feel comes from the artwork showing through.
- The terminal is an xterm canvas; it gets its own moderately solid glass so shell text stays readable over the photo.
- The settings row registers through `settings.general.item` only while the Host actually serves this entry's namespace (`configForms.whileServed`), and every resource unwinds on disable.

## Customizing the artwork

The bundled placeholder is a generated gradient. To use your own picture:

1. Convert it to WebP and name it `backdrop.webp` under `lib/assets/` (anything `.svg`, `.png`, `.webp`, `.jpg`, or `.jpeg` is served through the asset route; keep it under ~5 MB).
2. Run the finalize script from the repository root:

   ```sh
   python tools/finalize-asset.py
   ```

   It renames the file to `backdrop-<rev>.webp` — `<rev>` being the first 12 hex digits of the file's SHA-1, the form DSH's asset route expects so one URL always names one content — and prints the exact reference string.
3. Paste that reference into `BACKDROP_REF` in `client.js` (keep the `plugins/dsh-self-designed-theme/assets/` prefix).
4. Restart the Host (or reload the Web page) so the plugin module re-registers.

`tools/prepare-art.py` additionally reports the dominant colors of image regions — useful if you want to re-tune the glass tints in `client.js` to match your own picture. `tools/make-placeholder.py` regenerates the shipped gradient.

## Compatibility notes

- A token renamed by a future DSH release degrades that surface, never the layout.
- Reduced-motion and light/dark switching are respected.
- The settings row registers only when the Host exposes the settings-form service; without it the wallpaper and glass still apply and the preferences stay editable in `cordis.patch.yml`.
- Verified on Desktop `0.2.2-rc.3`. Other releases have not been tested — open an issue if something looks off.

## Artwork and licensing

The shipped `lib/assets/backdrop-*.webp` is **generated placeholder artwork** created for this repository — a water-blue gradient, no third-party content — so you can install and see the effect immediately, and redistribute or fork it freely.

This plugin was originally designed around a third-party illustration (*PaperCranes1847*) that carries the artist's watermark. That image is **not** included here and never should be redistributed without the artist's permission. If you have such permission and want to use it in your own profile, follow [Customizing the artwork](#customizing-the-artwork) with that file.

The MIT license covers the code **and** the generated placeholder.

## Repository layout

```
index.js            Host half: the live Config schema (volatile fields)
client.js           Browser half: wallpaper CSS, glass token layer, settings row
cordis.patch.yml    bundle patch (inserts the Loader row)
icon.svg            plugin icon (paper crane over water)
lib/assets/         generated placeholder backdrop (webp)
locale/{en,zh}.json display metadata for the Plugins page
docs/preview.md     screenshot checklist
tools/              asset scripts: prepare, finalize, make-placeholder
LICENSE             MIT (code and generated placeholder)
```

## 中文

为 DeepSeek Harness 打造的壁纸插件：把一张插画铺在**整个应用**背后（侧栏、首页、每个会话都能看到），所有工作面板变半透明玻璃——侧栏透明蓝灰、聊天区基本全透、气泡极浅、输入框浅蓝玻璃、代码/Diff 高透明；文字与图标始终不透明。深色方案自动在图片上叠一层暗纱保证可读。

> 随包图片是为本仓库**生成的占位渐变**（水蓝色调，可自由再分发），不含任何第三方插画。想换成自己的图见下文"换图"。

- **安装**：在 DSH 会话里让 agent 装（`github:shixiashui/dsh-self-designed-theme`），或 **设置 → 插件 → 添加插件** 指向本地 clone。桌面端不能用 CLI 的 `--profile desktop`，请走会话内 agent 或本地目录。
- **使用**：设置 → 常规 → 自定义插画壁纸。三个控件：壁纸总开关、水蓝染色开关、强度滑杆（越高画面越清晰，默认 70）。
- **原理**：壁纸画在 `html` 上；玻璃是一层 `overrideTokens`，约 29 个文档化 token 变 `rgba()`，浅深双值都给；文字/边框/强调色永不做透明。侧栏必须保持"颜色"而非渐变，因为宿主把它喂给 `color-mix()`。
- **换图**：把自己的图转成 webp 放进 `lib/assets/backdrop.webp`，跑 `python tools/finalize-asset.py`，把打印出的 reference 填进 `client.js` 的 `BACKDROP_REF`，重启 Host。
- **版权**：MIT 覆盖代码与占位图；原设计参考的第三方插画（带水印）**不在本仓库内**，未经授权请勿分发。

## License

MIT — code and the generated placeholder artwork. See [Artwork and licensing](#artwork-and-licensing).
