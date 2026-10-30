// Nxds.Icon: a Phosphor icon by its phosphoricons.com name, such as `plus`, so
// a canvas can place any icon in src/icons.ts without writing a component name.
import * as React from 'react';

import { ICON_COMPONENTS } from 'nxds:icon-names';

import { useCanvasProps } from './attributes.ts';

export interface IconProps {
  name: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
  'aria-label'?: string;
  [attribute: `data-${string}`]: string | undefined;
}

export function Icon(raw: IconProps) {
  const {
    name,
    size = 16,
    weight,
    className,
    'aria-label': label,
    ...rest
  } = useCanvasProps('Icon', raw);
  const Component = ICON_COMPONENTS[name];
  if (!Component) return null;
  // An empty label names nothing, so the icon stays hidden from screen readers.
  const naming = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };
  // A `-fill` name sets its own weight, so pass one only when it is set.
  return React.createElement(Component, {
    ...rest,
    size,
    ...(weight ? { weight } : {}),
    className,
    ...naming,
  });
}
