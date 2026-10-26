// React 18's UMD build has no jsx-runtime, so the bundle maps
// `react/jsx-runtime` here. `jsxs` passes its static children as separate
// arguments: handed over as one array, React would warn that they need keys.
import { createElement, type ElementType, Fragment, type Key } from 'react';

type Props = Record<string, unknown> & { children?: unknown };

function withKey(props: Props, key: Key | undefined) {
  return key === undefined ? props : { ...props, key };
}

export function jsx(type: ElementType, props: Props, key?: Key) {
  return createElement(type, withKey(props, key));
}

export function jsxs(type: ElementType, props: Props, key?: Key) {
  const { children, ...rest } = props;
  return createElement(
    type,
    withKey(rest, key),
    ...(children as Parameters<typeof createElement>[2][])
  );
}

export { Fragment, jsx as jsxDEV };
