// Nxds.Icon: a Phosphor icon by its phosphoricons.com name, such as `plus`, so
// a canvas can place any icon in src/icons.ts without writing a component name.
import * as React from 'react';

import { ICON_COMPONENTS } from 'nxds:icon-names';

import { useCanvasProps, warnOnce } from './attributes.ts';

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  'aria-label'?: string;
  [attribute: `data-${string}`]: string | undefined;
}

export function Icon(raw: IconProps) {
  const {
    name,
    size = 16,
    className,
    'aria-label': label,
    weight,
    ...rest
  }: IconProps & { weight?: unknown } = useCanvasProps('Icon', raw);
  const Component = ICON_COMPONENTS[name];
  if (!Component) return null;
  if (weight !== undefined) {
    warnOnce(
      'Icon',
      'weight',
      String(weight),
      "isn't in the bundle. Use a `-fill` name for a filled icon",
      'regular'
    );
  }
  // An empty label names nothing, so the icon stays hidden from screen readers.
  const naming = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };
  return React.createElement(Component, {
    ...rest,
    size,
    className,
    ...naming,
  });
}
