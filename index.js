/**
 * Host half of the self-designed theme bundle.
 *
 * The browser half owns every visual decision; this half only declares the
 * configuration schema so the profile entry exposes live (volatile) fields that
 * the Settings row can read and write through `ctx.configForms`.
 */
import z from '@deepseek-ai/schemastery';

/**
 * Mark a field live so the Host serves it in the plugin's settings form and
 * hands `apply` a stable box instead of a frozen copy.
 */
function volatile(schema) {
  const mark = schema.volatile;
  return typeof mark === 'function' ? mark.call(schema) : schema;
}

/** Live preferences of the self-designed theme. */
export const Config = z.object({
  /** Paint the illustration as the wallpaper of every page. */
  backdrop: volatile(z.boolean().default(true)),
  /** Tint the glass panels with the palette sampled from the illustration. */
  palette: volatile(z.boolean().default(true)),
  /** Picture clarity in percent: higher means more transparent panels. */
  intensity: volatile(z.number().step(1).min(10).max(100).default(70)),
});

/** The row's configuration is read live by the browser half. */
export function apply() {}
