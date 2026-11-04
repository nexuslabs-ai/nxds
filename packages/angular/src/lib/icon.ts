import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
} from '@angular/core';

const SVG_MARKUP = /^\s*<svg([^>]*)>([\s\S]*)<\/svg>\s*$/;
const ATTRIBUTE = /([\w:-]+)="([^"]*)"/g;

/**
 * Draws icon markup, such as an export of `lib/icons`, as the host `<svg>`
 * itself: its attributes land on the host and its shapes inside it. The icon
 * stays one bare `<svg>`, so `[&>svg]` and `[&_svg]` classes style it. Call it
 * from the constructor of a directive on an `<svg>`.
 */
export function drawIcon(markup: () => string): void {
  const element = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement;
  const renderer = inject(Renderer2);
  const parts = computed(() => {
    const [, attributes = '', children = ''] = SVG_MARKUP.exec(markup()) ?? [];
    return {
      attributes: [...attributes.matchAll(ATTRIBUTE)]
        .map(([, name = '', value = '']) => [name, value] as const)
        .filter(([name]) => name !== 'xmlns'),
      children,
    };
  });

  effect((onCleanup) => {
    const { attributes, children } = parts();
    for (const [name, value] of attributes) {
      renderer.setAttribute(element, name, value);
    }
    renderer.setProperty(element, 'innerHTML', children);
    onCleanup(() => {
      for (const [name] of attributes) renderer.removeAttribute(element, name);
    });
  });
}

type IconSvgElement = readonly (readonly [
  string,
  Readonly<Record<string, string | number>>,
])[];

const kebab = (name: string) =>
  name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** HugeIcons ships elements as data; this writes them as the SVG markup the other sets ship. */
export function hugeicon(icon: IconSvgElement, { fill = 'none' } = {}) {
  const children = icon
    .map(([tag, attributes]) => {
      const pairs = Object.entries(attributes)
        .filter(([name]) => name !== 'key')
        .map(([name, value]) => `${kebab(name)}="${value}"`);
      return `<${tag} ${pairs.join(' ')}></${tag}>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}">${children}</svg>`;
}

/** Draws an internal icon: `<svg [nxIcon]="IconX"></svg>`. */
@Directive({ selector: 'svg[nxIcon]' })
export class NxIcon {
  /** The icon's SVG markup. */
  readonly nxIcon = input.required<string>();

  constructor() {
    drawIcon(this.nxIcon);
  }
}
