/**
 * Browser half of the self-designed theme.
 *
 * Design (per the user's reference sheet): the illustration is the wallpaper of
 * the WHOLE application — painted unmodified on `html`, behind every column,
 * while every surface the user works on becomes a translucent glass layer
 * through one alias-token override. This repository ships a generated
 * placeholder gradient; the PaperCranes1847 artwork the design was built
 * around is not redistributed here (see README and LICENSE):
 *
 *  - left sidebar: transparent blue-grey gradient
 *  - transcript: fully see-through (the base background token turns clear)
 *  - chat bubbles: very light tint
 *  - top toolbar / right column / terminal / diff: high transparency
 *  - composer card: light-blue glass
 *  - text and icons: opaque, never touched
 *
 * Menus and popovers keep a nearly solid fill so they stay legible.
 *
 * The Strength slider drives the glass: higher strength = more transparent
 * surfaces = a clearer picture. The Derived-palette switch swaps the tint of
 * the glass (water-blue sampled from the artwork vs. the stock neutral
 * palette). Turning Home backdrop off withdraws the wallpaper and the glass
 * layer together, restoring the stock opaque UI.
 *
 * Preferences persist as the Host entry's volatile config fields.
 */
window.__ModuleLoader__.load({
  id: 'dsh-self-designed-theme',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const ENTRY_ID = 'self-designed-theme';
    const LOCALE_NS = 'self-designed-theme';
    const TOKEN_SOURCE = 'dsh-self-designed-theme';
    const STYLE_TAG = 'dsh-self-designed-theme';

    /** Revisioned package asset reference served by the client-modules route. */
    const BACKDROP_REF = 'plugins/dsh-self-designed-theme/assets/backdrop-da303dccd7d7.webp';
    const BACKDROP = typeof require.asset === 'function'
      ? require.asset(BACKDROP_REF)
      : BACKDROP_REF;

    const IMAGE_KEY = 'dsh-self-designed-theme.wallpaper';
    const IMAGE_EVENT = 'dsh-self-designed-theme:wallpaper-changed';
    const MAX_BYTES = 2 * 1024 * 1024;
    const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
    const imagePattern = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

    // ----------------------------------------------------------------- styles
    /**
     * The wallpaper itself: the original image, unmodified, viewport-fixed,
     * cover-cropped, painted on `html` so it sits behind the body and every
     * column. In the dark scheme a fixed translucent dark veil rides on top of
     * the image — the pixels stay untouched, only a ground layer — so light
     * text on see-through panels stays readable. Inserted only while the
     * Wallpaper switch is on.
     */
    const WALLPAPER_CSS = `
html.pcx-wallpaper {
  background-image: var(--pcx-wallpaper-image, url("${BACKDROP}"));
  background-position: center;
  background-size: var(--pcx-wallpaper-size, cover);
  background-repeat: no-repeat;
  background-attachment: fixed;
}
html.pcx-wallpaper:has(body[data-ds-dark-theme]) {
  background-size: cover, var(--pcx-wallpaper-size, cover);
  background-image:
    linear-gradient(rgba(11, 15, 18, 0.5), rgba(11, 15, 18, 0.5)),
    var(--pcx-wallpaper-image, url("${BACKDROP}"));
}

/* The terminal is an xterm canvas. The host reads its screen element's
   computed background and composites the cursor against it, which means a
   translucent value is honored rather than flattened — so the terminal can be
   glass too. It gets its own moderately solid tint (more than the transcript)
   so shell text stays readable over the photo. These rules out-specify the
   host's own background declarations and are removed with the wallpaper when
   the switch is off. */
html.pcx-wallpaper :is(div:has(> .xterm), .xterm, .xterm-viewport) {
  background-color: rgba(238, 243, 247, 0.62);
}
html.pcx-wallpaper:has(body[data-ds-dark-theme]) :is(div:has(> .xterm), .xterm, .xterm-viewport) {
  background-color: rgba(20, 26, 31, 0.62);
}
`;

    /** Settings-row geometry; copied from the host's own General rows. */
    const CSS = `
.pcx-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  padding: 16px 0;
  border-bottom: 0.5px solid var(--dsw-alias-border-l2);
}
.pcx-rowText {
  flex: 1 1 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 48px;
}
/* Narrow browser settings (not Desktop windows): follow the host's gate. */
@media (max-width: 767px) {
  html:not([data-windows-titlebar]):not([data-platform='darwin']) .pcx-rowText {
    padding-right: 16px;
  }
}
.pcx-title {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
}
.pcx-desc {
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}
.pcx-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  max-width: 100%;
}
.pcx-controls input[type=file] { display: block; max-width: 100%; }
.pcx-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pcx-fieldLabel {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.pcx-sliderGroup {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pcx-switch {
  position: relative;
  width: 38px;
  height: 22px;
  flex: none;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: var(--dsw-alias-bg-module-platform);
  cursor: pointer;
  transition: background 150ms ease;
}
.pcx-switch[aria-checked='true'] { background: var(--dsw-alias-brand-primary); }
.pcx-switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--dsw-alias-switch-thumb);
  transition: transform 150ms ease;
}
.pcx-switch[aria-checked='true']::after { transform: translateX(16px); }
.pcx-switch:focus-visible,
.pcx-range:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary));
  outline-offset: 2px;
}
.pcx-range {
  width: 110px;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: pointer;
}
.pcx-value {
  min-width: 34px;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) {
  .pcx-switch, .pcx-switch::after { transition: none; }
}
`;

    /** Insert the plugin's stylesheet; the returned disposer removes it. */
    function insertStyles(css) {
      const element = document.createElement('style');
      element.dataset.plugin = STYLE_TAG;
      element.textContent = css;
      document.head.appendChild(element);
      return () => { element.remove(); };
    }

    // ------------------------------------------------------------------ glass
    /**
     * The alias-token layer: every working surface becomes glass over the
     * wallpaper. Alphas derive from the Strength preference — a higher
     * strength means a more transparent surface and a clearer picture.
     * Text, icons, borders, and accent colors stay opaque, so the artwork
     * never costs legibility. Menus keep a near-solid fill.
     */
    function buildTokens(settings) {
      const i = settings.intensity / 100;
      const alpha = (x) => Math.max(0, Math.min(1, Number(x.toFixed(2))));
      const aBase = alpha(0.52 - 0.42 * i); // transcript, frame ground, terminal
      const aPanel = alpha(aBase + 0.14); // raised panels, cards, files
      const aBubble = alpha(aBase + 0.20);
      const aCode = alpha(aBase + 0.12);
      const aDiff = alpha(aBase + 0.08);
      const aInput = alpha(0.90 - 0.22 * i);
      const aSide = alpha(0.46 - 0.24 * i);
      const aSide2 = alpha(0.34 - 0.18 * i);

      // Glass tints: water-blue when the derived palette is on, stock neutral
      // blues when it is off. Same alphas, so Strength reads identically.
      const tint = settings.palette;
      const c = {
        baseL: tint ? '241,245,248' : '252,253,254',
        baseD: tint ? '27,36,41' : '20,24,28',
        panelL: tint ? '236,242,248' : '250,251,252',
        panelD: tint ? '33,44,51' : '26,31,35',
        cardL: tint ? '231,240,247' : '247,248,250',
        cardD: tint ? '40,52,60' : '32,37,41',
        bubbleL: tint ? '238,246,251' : '250,252,253',
        bubbleD: tint ? '30,42,52' : '27,32,36',
        codeL: tint ? '236,242,248' : '245,246,248',
        codeD: tint ? '22,29,34' : '23,26,29',
        inputL: tint ? '232,243,250' : '250,251,253',
        inputD: tint ? '24,38,48' : '25,29,33',
        sideTopL: tint ? '150,182,210' : '240,243,247',
        sideLowL: tint ? '118,152,190' : '228,234,241',
        sideTopD: tint ? '40,58,70' : '28,33,38',
        sideLowD: tint ? '22,34,44' : '20,24,28',
        addedL: '230,244,231',
        addedD: '31,49,36',
        deletedL: '252,230,226',
        deletedD: '60,31,27',
      };
      const rgba = (color, a) => `rgba(${color}, ${a})`;
      const opaque = tint
        ? {
          '--dsw-alias-brand-primary': { light: '#3f6f9b', dark: '#8fb4d4' },
          '--dsw-alias-label-primary': { light: '#26363f', dark: '#e0e9ef' },
          '--dsw-alias-label-secondary': { light: '#57707f', dark: '#a7b9c5' },
          '--dsw-alias-border-l1': { light: '#d4dee6', dark: '#35434c' },
          '--dsw-alias-border-l2': { light: '#bac9d6', dark: '#465863' },
          '--dsw-alias-state-success-primary': { light: '#4a7a52', dark: '#84b389' },
          '--dsw-alias-state-warn-primary': { light: '#9a7629', dark: '#d8ba6c' },
          '--dsw-alias-state-idle-primary': { light: '#8fa1ad', dark: '#677985' },
        }
        : {};

      return {
        ...opaque,
        // Ground: transcript, frame, right column, terminal — near clear.
        '--dsw-alias-bg-base': { light: rgba(c.baseL, aBase), dark: rgba(c.baseD, aBase) },
        // Raised panels: files page, tool output, turn rail.
        '--dsw-alias-bg-layer-1': { light: rgba(c.panelL, aPanel), dark: rgba(c.panelD, aPanel) },
        '--dsw-alias-bg-layer-2': { light: rgba(c.panelL, alpha(aPanel + 0.06)), dark: rgba(c.panelD, alpha(aPanel + 0.06)) },
        '--dsw-alias-bg-layer-3': { light: rgba(c.panelL, alpha(aPanel + 0.10)), dark: rgba(c.panelD, alpha(aPanel + 0.10)) },
        // Cards: deliverables and changed-files.
        '--dsw-alias-card-fill': { light: rgba(c.cardL, aPanel), dark: rgba(c.cardD, aPanel) },
        '--dsw-alias-card-fill-hover': { light: rgba(c.cardL, alpha(aPanel + 0.10)), dark: rgba(c.cardD, alpha(aPanel + 0.10)) },
        // Chat bubbles: very light tint.
        '--dsw-specific-bubble': { light: rgba(c.bubbleL, aBubble), dark: rgba(c.bubbleD, aBubble) },
        '--dsw-specific-bubble-highlight': { light: rgba(c.bubbleL, alpha(aBubble + 0.12)), dark: rgba(c.bubbleD, alpha(aBubble + 0.12)) },
        // Composer card: light-blue glass, kept solid enough to type on.
        '--dsw-specific-input-major': { light: rgba(c.inputL, aInput), dark: rgba(c.inputD, aInput) },
        // Sidebar: one translucent blue-grey fill. It must stay a *color*, not
        // a gradient: AppFrame feeds it to `color-mix()` and SidebarRoot nests
        // it inside another `linear-gradient()`, where a gradient value is
        // invalid and would drop the whole declaration. The artwork behind it
        // already runs bright at the top to dark at the reflection, so a flat
        // alpha reads as the requested transparent blue-grey gradient.
        '--dsw-specific-sidebar-fill': {
          light: rgba(c.sideTopL, aSide),
          dark: rgba(c.sideTopD, aSide),
        },
        // Code: editor blocks, inline code, command cards.
        '--dsw-alias-markdown-code-block': { light: rgba(c.codeL, aCode), dark: rgba(c.codeD, aCode) },
        '--dsw-alias-markdown-code-block-banner': { light: rgba(c.codeL, alpha(aCode + 0.08)), dark: rgba(c.codeD, alpha(aCode + 0.08)) },
        '--dsw-alias-markdown-inline-code': { light: rgba(c.codeL, alpha(aCode + 0.06)), dark: rgba(c.codeD, alpha(aCode + 0.06)) },
        '--dsw-alias-markdown-code-segment-selected': { light: rgba(c.codeL, alpha(aCode + 0.20)), dark: rgba(c.codeD, alpha(aCode + 0.20)) },
        '--dsw-alias-markdown-code-segment-unselected': { light: rgba(c.codeL, aCode), dark: rgba(c.codeD, aCode) },
        // Diff: added/deleted rows and gutters.
        '--dsw-alias-file-diff-added-bg': { light: rgba(c.addedL, aDiff), dark: rgba(c.addedD, aDiff) },
        '--dsw-alias-file-diff-added-gutter': { light: rgba(c.addedL, alpha(aDiff + 0.06)), dark: rgba(c.addedD, alpha(aDiff + 0.06)) },
        '--dsw-alias-file-diff-deleted-bg': { light: rgba(c.deletedL, aDiff), dark: rgba(c.deletedD, aDiff) },
        '--dsw-alias-file-diff-deleted-gutter': { light: rgba(c.deletedL, alpha(aDiff + 0.06)), dark: rgba(c.deletedD, alpha(aDiff + 0.06)) },
        // Document preview backdrop.
        '--dsw-alias-bg-document-preview': { light: rgba(c.panelL, alpha(aPanel + 0.08)), dark: rgba(c.panelD, alpha(aPanel + 0.08)) },
        // Popovers and menus: keep a near-solid fill for legibility.
        '--dsw-alias-bg-overlay': { light: 'rgba(250, 252, 253, 0.94)', dark: 'rgba(30, 38, 44, 0.94)' },
      };
    }

    // ------------------------------------------------------------------ store
    const DEFAULTS = { backdrop: true, palette: true, intensity: 70 };

    /** Live preferences mirrored from the Host entry's volatile config fields. */
    function createStore(initial) {
      let value = initial;
      const listeners = new Set();
      return {
        get: () => value,
        replace(next) {
          // Compare by value: a Host echo of our own write must not re-render
          // consumers or restamp the theme layer.
          if (next === value) return;
          if (next.backdrop === value.backdrop
            && next.palette === value.palette
            && next.intensity === value.intensity) return;
          value = next;
          for (const fn of [...listeners]) fn();
        },
        subscribe(fn) {
          listeners.add(fn);
          return () => { listeners.delete(fn); };
        },
      };
    }

    /** Never throws when the Host serves no settings form for this entry. */
    function degradedForm() {
      return {
        getSnapshot: () => ({ status: 'unavailable', value: undefined, writable: false }),
        subscribe: () => () => {},
        set: async () => false,
      };
    }

    function readConfig(snapshot) {
      const raw = snapshot === null || snapshot === undefined ? undefined : snapshot.value;
      if (raw === null || typeof raw !== 'object' || raw === undefined) return null;
      const entry = raw;
      const intensity = Number.isFinite(entry.intensity)
        ? Math.min(100, Math.max(10, Math.round(entry.intensity)))
        : DEFAULTS.intensity;
      return {
        backdrop: entry.backdrop !== false,
        palette: entry.palette !== false,
        intensity,
      };
    }

    const store = createStore(DEFAULTS);
    let form = degradedForm();

    // -------------------------------------------------------------- components
    /** One accessible switch. */
    function Toggle({ checked, onChange, label }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        className: 'pcx-switch',
        'aria-checked': checked ? 'true' : 'false',
        'aria-label': label,
        onClick: () => { onChange(!checked); },
      });
    }

    /**
     * One Host write. `ConfigForm.set` resolves false when the write is refused
     * and rejects on a transport failure, so both paths restore what the
     * optimistic flip claimed: the durable snapshot when the Host serves one,
     * otherwise just the field the user touched.
     */
    function settle(field, value, previous) {
      const restore = () => {
        const durable = readConfig(form.getSnapshot());
        store.replace(durable === null ? { ...store.get(), [field]: previous } : durable);
      };
      form.set(field, value).then(
        (accepted) => { if (accepted !== true) restore(); },
        restore,
      );
    }

    /** Coalesce a dragged value into one Host write, keeping the last value. */
    function createWriter() {
      const timers = new Map();
      const writer = (field, value) => {
        const previous = store.get()[field];
        if (previous === value) return;
        store.replace({ ...store.get(), [field]: value });
        const pending = timers.get(field);
        if (pending !== undefined) clearTimeout(pending);
        timers.set(field, setTimeout(() => {
          timers.delete(field);
          settle(field, value, previous);
        }, 250));
      };
      writer.dispose = () => {
        for (const timer of timers.values()) clearTimeout(timer);
        timers.clear();
      };
      return writer;
    }

    let write = createWriter();

    /** One labeled control inside the row. */
    function Field({ label, children }) {
      return h(
        'div',
        { className: 'pcx-field' },
        h('span', { className: 'pcx-fieldLabel' }, label),
        children,
      );
    }

    function ImageControls({ t }) {
      const [message, setMessage] = React.useState('');
      const revision = React.useRef(0);
      React.useEffect(() => () => { revision.current++; }, []);

      async function choose(event) {
        const file = event.target.files[0];
        event.target.value = '';
        if (!file) return;
        const request = ++revision.current;
        if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_BYTES) {
          setMessage('row.invalid');
          return;
        }
        try {
          const reader = new FileReader();
          const data = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          const preview = new Image();
          preview.src = data;
          await preview.decode();
          if (revision.current !== request) return;
          localStorage.setItem(IMAGE_KEY, data);
          window.dispatchEvent(new Event(IMAGE_EVENT));
          setMessage('row.saved');
        } catch {
          if (revision.current === request) setMessage('row.failed');
        }
      }

      function reset() {
        revision.current++;
        try {
          localStorage.removeItem(IMAGE_KEY);
          window.dispatchEvent(new Event(IMAGE_EVENT));
          setMessage('row.restored');
        } catch {
          setMessage('row.storageError');
        }
      }

      return h('div', { className: 'pcx-controls' },
        h('label', { className: 'pcx-fieldLabel' }, t('row.image'),
          h('input', { type: 'file', accept: IMAGE_TYPES.join(','), onChange: choose })),
        h('button', { type: 'button', onClick: reset }, t('row.reset')),
        h('span', { role: 'status', className: 'pcx-desc' }, message && t(message)),
      );
    }

    /** The General settings row: wallpaper, derived palette, and strength. */
    function SettingsRow({ t }) {
      const settings = React.useSyncExternalStore(store.subscribe, store.get);
      return h(
        'div',
        { className: 'pcx-row' },
        h(
          'div',
          { className: 'pcx-rowText' },
          h('div', { className: 'pcx-title' }, t('row.title')),
          h('div', { className: 'pcx-desc' }, t('row.description')),
        ),
        h(
          'div',
          { className: 'pcx-controls' },
          h(ImageControls, { t }),
          h(
            Field,
            { label: t('row.backdrop') },
            h(Toggle, {
              checked: settings.backdrop,
              onChange: (value) => { write('backdrop', value); },
              label: t('row.backdrop'),
            }),
          ),
          h(
            Field,
            { label: t('row.palette') },
            h(Toggle, {
              checked: settings.palette,
              onChange: (value) => { write('palette', value); },
              label: t('row.palette'),
            }),
          ),
          h(
            Field,
            { label: t('row.intensity') },
            h('span', { className: 'pcx-sliderGroup' },
              h('input', {
                className: 'pcx-range',
                type: 'range',
                min: '10',
                max: '100',
                step: '1',
                value: String(settings.intensity),
                'aria-label': t('row.intensity'),
                onChange: (event) => { write('intensity', Number(event.target.value)); },
              }),
              h('span', { className: 'pcx-value' }, `${settings.intensity}%`),
            ),
          ),
        ),
      );
    }

    // ----------------------------------------------------------------- locale
    const DICTIONARIES = {
      en: {
        'row.image': 'Local image (PNG, JPEG or WebP, up to 2 MiB)',
        'row.reset': 'Restore default',
        'row.invalid': 'Choose a PNG, JPEG or WebP up to 2 MiB.',
        'row.saved': 'Wallpaper saved.',
        'row.failed': 'Could not read or save the image. Try a smaller, valid image.',
        'row.restored': 'Default restored.',
        'row.storageError': 'Could not access local storage.',
        'row.title': 'Illustration wallpaper',
        'row.description':
          'The illustration behind every page, with translucent glass panels. Strength: higher means a clearer picture.',
        'row.backdrop': 'Wallpaper',
        'row.palette': 'Water-blue tint',
        'row.intensity': 'Strength',
      },
      zh: {
        'row.image': '本地图片（PNG、JPEG 或 WebP，最大 2 MiB）',
        'row.reset': '恢复默认壁纸',
        'row.invalid': '请选择 2 MiB 以内的 PNG、JPEG 或 WebP 图片。',
        'row.saved': '壁纸已保存。',
        'row.failed': '读取或保存失败，请尝试较小的有效图片。',
        'row.restored': '已恢复默认壁纸。',
        'row.storageError': '无法访问本地存储。',
        'row.title': '自定义插画壁纸',
        'row.description':
          '插画铺在所有页面背后，各面板变为半透明玻璃。强度越高，画面越清晰。',
        'row.backdrop': '壁纸',
        'row.palette': '水蓝染色',
        'row.intensity': '强度',
      },
    };

    return {
      // `theme` is a hard dependency: the glass layer is the feature, and an
      // undeclared service would throw inside apply instead of parking the
      // fiber on a composition that has no ui-theme.
      inject: ['slots', 'locale', 'theme'],
      apply(ctx) {
        // Preferences: the Host entry's volatile fields, mirrored into a store.
        const configForms = ctx.get('configForms');
        const forms = typeof configForms?.get === 'function' && typeof configForms.whileServed === 'function'
          ? configForms
          : undefined;
        form = forms === undefined ? degradedForm() : forms.get(ENTRY_ID);
        const initial = readConfig(form.getSnapshot());
        if (initial !== null) store.replace(initial);
        // Capture this instance so a re-run cannot orphan the previous timers.
        const writer = createWriter();
        write = writer;
        ctx.effect(() => () => writer.dispose(), 'self-designed-theme: pending writes');
        ctx.effect(() => form.subscribe(() => {
          const next = readConfig(form.getSnapshot());
          if (next !== null) store.replace(next);
        }), 'self-designed-theme: config mirror');

        ctx.effect(() => ctx.locale.register(LOCALE_NS, DICTIONARIES), 'self-designed-theme: locale');
        ctx.effect(() => insertStyles(CSS), 'self-designed-theme: styles');

        ctx.effect(() => {
          const style = document.documentElement.style;
          function clearImage() {
            style.removeProperty('--pcx-wallpaper-image');
            style.removeProperty('--pcx-wallpaper-size');
          }
          function loadImage() {
            let data;
            try { data = localStorage.getItem(IMAGE_KEY); } catch { /* Storage may be disabled. */ }
            if (data && imagePattern.test(data)) {
              style.setProperty('--pcx-wallpaper-image', `url("${data}")`);
              style.setProperty('--pcx-wallpaper-size', 'contain');
            } else {
              clearImage();
            }
          }
          function onStorage(event) {
            if (event.key === IMAGE_KEY || event.key === null) loadImage();
          }
          loadImage();
          window.addEventListener(IMAGE_EVENT, loadImage);
          window.addEventListener('storage', onStorage);
          return () => {
            window.removeEventListener(IMAGE_EVENT, loadImage);
            window.removeEventListener('storage', onStorage);
            clearImage();
          };
        }, 'self-designed-theme: local image');

        // Wallpaper class on <html> and the glass token layer, both following
        // the live preferences. The layer is restamped only when a value that
        // changes its contents actually changed (strength or tint), never on
        // an unchanged mirror echo.
        ctx.effect(() => {
          let wallpaper = null;
          let layer = null;
          let layerKey = '';
          const sync = () => {
            const settings = store.get();
            if (settings.backdrop && wallpaper === null) {
              document.documentElement.classList.add('pcx-wallpaper');
              wallpaper = insertStyles(WALLPAPER_CSS);
            } else if (!settings.backdrop && wallpaper !== null) {
              wallpaper();
              wallpaper = null;
              document.documentElement.classList.remove('pcx-wallpaper');
            }
            const key = settings.backdrop ? `${settings.intensity}|${settings.palette}` : '';
            if (settings.backdrop && key !== layerKey) {
              if (layer !== null) layer();
              layer = ctx.theme.overrideTokens(TOKEN_SOURCE, buildTokens(settings));
              layerKey = key;
            } else if (!settings.backdrop && layer !== null) {
              layer();
              layer = null;
              layerKey = '';
            }
          };
          sync();
          const release = store.subscribe(sync);
          return () => {
            release();
            if (wallpaper !== null) wallpaper();
            if (layer !== null) layer();
            document.documentElement.classList.remove('pcx-wallpaper');
          };
        }, 'self-designed-theme: wallpaper and glass');

        const row = () => {
          const dispose = ctx.slots.register({
            name: 'settings.general.item',
            id: ENTRY_ID,
            order: 30,
            locale: LOCALE_NS,
          }, SettingsRow);
          return typeof dispose === 'function' ? dispose : () => {};
        };
        if (forms === undefined) {
          // No settings service at all: the row could read or write nothing, so
          // it stays unregistered instead of showing dead controls.
        } else {
          // Register only while the Host actually serves this entry's namespace,
          // and through `slots.inject` so the row follows the General section's
          // declaration the same way the host's own rows do.
          ctx.effect(() => forms.whileServed([ENTRY_ID], () => {
            const offInject = ctx.slots.inject('settings.general.item', row);
            return () => {
              if (typeof offInject === 'function') offInject();
            };
          }), 'self-designed-theme: settings row');
        }
      },
    };
  },
});
