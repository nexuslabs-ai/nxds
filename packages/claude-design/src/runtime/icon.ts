// Nxds.Icon: a Tabler icon by its tabler.io name, such as `plus`, so a
// canvas can place any icon in src/icons.ts without writing a component name.
import * as React from 'react';

import { ICON_COMPONENTS } from 'nxds:icon-names';

import { useCanvasProps } from './attributes.ts';

export interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  className?: string;
  'aria-label'?: string;
  [attribute: `data-${string}`]: string | undefined;
}

export function Icon(raw: IconProps) {
  const {
    name,
    size = 16,
    stroke = 2,
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
  return React.createElement(Component, {
    ...rest,
    size,
    stroke,
    className,
    ...naming,
  });
}
