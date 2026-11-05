import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  RendererStyleFlags2,
  type Signal,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

const SVG_MARKUP = /^\s*<svg([^>]*)>([\s\S]*)<\/svg>\s*$/;
const ATTRIBUTE = /([\w:-]+)="([^"]*)"/g;

/** A `style` attribute's `property: value` declarations. */
function declarations(style: string) {
  return style.split(';').flatMap((declaration) => {
    const colon = declaration.indexOf(':');
    if (colon < 0) return [];
    return [
      [
        declaration.slice(0, colon).trim(),
        declaration.slice(colon + 1).trim(),
      ] as const,
    ];
  });
}

declare const trusted: unique symbol;

/** SVG markup the app ships, marked by `iconMarkup`. `nxIcon` draws only this. */
export type IconMarkup = string & { readonly [trusted]: true };

/**
 * Marks `svg` as icon markup the app ships, such as an `@ng-icons` export.
 * Never pass user input: `nxIcon` writes the markup unsanitized.
 */
export function iconMarkup(svg: string): IconMarkup {
  return svg as IconMarkup;
}

/**
 * Draws icon markup, such as an export of `lib/icons`, as the host `<svg>`
 * itself: its attributes land on the host and its shapes inside it. The icon
 * stays one bare `<svg>`, so `[&>svg]` and `[&_svg]` classes style it.
 *
 * Call it in an injection context, such as a field initializer of a directive
 * on an `<svg>`, and bind what it returns to the host's `[innerHTML]`.
 */
export function drawIcon(markup: () => IconMarkup): Signal<SafeHtml> {
  const element = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement;
  const renderer = inject(Renderer2);
  const sanitizer = inject(DomSanitizer);
  const parts = computed(() => {
    const [, attributes = '', children = ''] = SVG_MARKUP.exec(markup()) ?? [];
    const pairs = [...attributes.matchAll(ATTRIBUTE)]
      .map(([, name = '', value = '']) => [name, value] as const)
      .filter(([name]) => name !== 'xmlns');
    return {
      attributes: pairs.filter(([name]) => name !== 'style'),
      styles: pairs
        .filter(([name]) => name === 'style')
        .flatMap(([, value]) => declarations(value)),
      children,
    };
  });

  // The markup's styles merge into the host's, so the host keeps its own.
  effect((onCleanup) => {
    const { attributes, styles } = parts();
    for (const [name, value] of attributes) {
      renderer.setAttribute(element, name, value);
    }
    for (const [property, value] of styles) {
      renderer.setStyle(element, property, value, RendererStyleFlags2.DashCase);
    }
    onCleanup(() => {
      for (const [name] of attributes) renderer.removeAttribute(element, name);
      for (const [property] of styles) {
        renderer.removeStyle(element, property, RendererStyleFlags2.DashCase);
      }
    });
  });

  return computed(() => sanitizer.bypassSecurityTrustHtml(parts().children));
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
  return iconMarkup(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}">${children}</svg>`
  );
}

/** Draws an icon: `<svg [nxIcon]="IconX"></svg>`. */
@Directive({
  selector: 'svg[nxIcon]',
  host: { '[innerHTML]': 'shapes()' },
})
export class NxIcon {
  /** The icon's SVG markup, marked by `iconMarkup`. */
  readonly nxIcon = input.required<IconMarkup>();

  protected readonly shapes = drawIcon(this.nxIcon);
}
