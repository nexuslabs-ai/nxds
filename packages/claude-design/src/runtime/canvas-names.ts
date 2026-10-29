/**
 * The class on the `display: contents` div a Design canvas mounts each
 * x-import in. Every element in an artboard has `data-dc-tpl`; only this
 * wrapper has the class.
 */
export const CANVAS_WRAPPER_CLASS = 'sc-host-x';

/** The attribute a canvas writes for a prop: kebab-case, `aria-*` and `data-*` as written. */
export function kebab(name: string) {
  if (/^(?:aria|data)-/.test(name)) return name;
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}
