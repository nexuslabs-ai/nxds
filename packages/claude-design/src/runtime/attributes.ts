// Runs in bundle.js. A canvas sets props through x-import attributes, which
// arrive as strings. `useCanvasProps` turns each string into the type its
// prop declares, by the attributes in nxds:canvas-schema. A string that
// doesn't fit logs one warning and falls back, so an artboard never crashes
// on it. Values that aren't strings, from `{{...}}`, `dc-props` or nxds's own
// parts, pass through untouched.
import * as React from 'react';

import { CANVAS_SCHEMA } from 'nxds:canvas-schema';
import { ICON_COMPONENTS } from 'nxds:icon-names';

import type { IconAttribute, SchemaAttribute } from '../attribute.ts';

import { kebab } from './canvas-names.ts';
import { unwrapped } from './canvas-wrapper.ts';
import { Icon } from './icon.ts';
import { type Converted, convertValue, fail, type Props } from './values.ts';

export interface CanvasSchema {
  /** Each part's props whose attribute string converts, by prop. */
  attributes: Record<string, Record<string, SchemaAttribute>>;
  /** Each part's props that have no default, so a bad value can't just be dropped. */
  required: Record<string, string[]>;
  /** Parts that read their children's types, which get them without canvas wrappers. */
  unwrap: string[];
  /** A `data-*` attribute a canvas keeps as written, by the prop it sets: `data-key` for Recharts' `dataKey`. */
  renames: Record<string, Record<string, string>>;
}

const MAX_CACHED_LENGTH = 4 * 1024 * 1024;

// `PlusIcon`, `IconPlus` or `Plus` for `plus`.
function iconName(value: string) {
  return value
    .replace(/^Icon(?=[A-Z])/, '')
    .replace(/(?<=[a-z0-9])Icon$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase();
}

function icon(value: string, as: IconAttribute['as']): Converted {
  if (!ICON_COMPONENTS[value]) {
    const suggestion = iconName(value);
    return fail(
      ICON_COMPONENTS[suggestion]
        ? `isn't an icon name; write "${suggestion}"`
        : "isn't an icon name in components/Icon/README.md"
    );
  }
  return {
    value: as === 'name' ? value : React.createElement(Icon, { name: value }),
  };
}

function convert(
  value: string,
  attribute: SchemaAttribute,
  props: Props,
  required: boolean
): Converted {
  return attribute.kind === 'icon'
    ? icon(value, attribute.as)
    : convertValue(value, attribute, props, required);
}

/** The prop whose value picks how `attribute` reads, such as Accordion's `type`. */
function pickerOf(attribute: SchemaAttribute) {
  if (attribute.kind === 'list') return attribute.listWhen?.prop ?? null;
  if (attribute.kind === 'date') return attribute.selection?.prop ?? null;
  return null;
}

function holdsObject(converted: Converted) {
  return (
    'value' in converted &&
    typeof converted.value === 'object' &&
    converted.value !== null
  );
}

const conversions = new Map<string, Converted>();
let cachedLength = 0;

// The same attribute string gives the same list, date or object on every
// render, so a chart doesn't replay its entry animation and effects don't
// fire again. Once the keys pass MAX_CACHED_LENGTH characters, the least
// recently used go first. A key longer than that on its own isn't cached.
function cachedConvert(
  part: string,
  prop: string,
  value: string,
  attribute: SchemaAttribute,
  props: Props,
  required: boolean
): Converted {
  const picker = pickerOf(attribute);
  const key = [part, prop, picker ? String(props[picker]) : '', value].join(
    '\u0000'
  );
  if (key.length > MAX_CACHED_LENGTH) {
    return convert(value, attribute, props, required);
  }
  const cached = conversions.get(key);
  if (cached) {
    conversions.delete(key);
    conversions.set(key, cached);
    return cached;
  }
  const converted = convert(value, attribute, props, required);
  if (!holdsObject(converted)) return converted;
  conversions.set(key, converted);
  cachedLength += key.length;
  for (const oldest of conversions.keys()) {
    if (cachedLength <= MAX_CACHED_LENGTH) break;
    conversions.delete(oldest);
    cachedLength -= oldest.length;
  }
  return converted;
}

// What a required prop gets when its attribute doesn't fit. `id` keeps a
// string placeholder unique to its part and the same on every render.
function fallback(attribute: SchemaAttribute, prop: string, id: string) {
  if (attribute.kind === 'list') return [];
  if (attribute.kind === 'json' && attribute.shape === 'array') return [];
  if (attribute.kind === 'json' && attribute.shape === 'object') return {};
  if (attribute.kind !== 'scalar') return undefined;
  if (attribute.literals.length > 0) return attribute.literals[0];
  if (attribute.string) return `${prop}-${id}`;
  if (attribute.number) return 0;
  return false;
}

const warned = new Set<string>();

function warnOnce(
  part: string,
  prop: string,
  value: string,
  problem: string,
  using: string
) {
  const key = `${part}\u0000${prop}\u0000${value}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(
    `[nxds] ${part}: ${kebab(prop)}="${value}" ${problem}. Using ${using}.`
  );
}

function describe(value: unknown) {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return JSON.stringify(value);
  }
  if (value === undefined) return 'nothing';
  return Array.isArray(value) ? 'an empty list' : 'an empty value';
}

// The props that pick how another prop reads come first, so a bad one has
// already fallen back to its default.
function ordered(props: Props, attributes: Record<string, SchemaAttribute>) {
  const pickers = new Set(Object.values(attributes).map(pickerOf));
  const keys = Object.keys(props);
  return [
    ...keys.filter((key) => pickers.has(key)),
    ...keys.filter((key) => !pickers.has(key)),
  ];
}

// A canvas passes x-import content as an array and keeps indentation, so
// `<x-import>` with only a line break inside has a `["\n"]` child. That would
// replace a FieldError's `errors`, and an `<input>` throws on any child.
function isIndentation(children: unknown) {
  return (
    Array.isArray(children) &&
    children.every((child) => typeof child === 'string' && child.trim() === '')
  );
}

// `props` with each `data-*` attribute a part declares as a prop renamed to it.
function renamed(part: string, props: Props): Props | null {
  const renames = CANVAS_SCHEMA.renames[part];
  if (!renames) return null;
  let result: Props | null = null;
  for (const [attribute, prop] of Object.entries(renames)) {
    if (!(attribute in props) || prop in props) continue;
    result ??= { ...props };
    result[prop] = result[attribute];
    delete result[attribute];
  }
  return result;
}

/** `props` with each attribute string converted to its prop's type. */
export function useCanvasProps<P extends object>(part: string, props: P): P {
  const id = React.useId().replace(/:/g, '');
  let result: Props | null = renamed(part, props as Props);
  const children = (result ?? (props as Props))['children'];
  if (isIndentation(children)) {
    result ??= { ...(props as Props) };
    delete result['children'];
  } else if (children !== undefined && CANVAS_SCHEMA.unwrap.includes(part)) {
    result ??= { ...(props as Props) };
    result['children'] = unwrapped(children as React.ReactNode);
  }
  const attributes = CANVAS_SCHEMA.attributes[part];
  if (!attributes) return (result ?? props) as P;
  const required = CANVAS_SCHEMA.required[part] ?? [];
  for (const key of ordered(result ?? (props as Props), attributes)) {
    const current = result ?? (props as Props);
    const value = current[key];
    const attribute = attributes[key];
    if (typeof value !== 'string' || !attribute) continue;
    const isRequired = required.includes(key);
    const converted = cachedConvert(
      part,
      key,
      value,
      attribute,
      current,
      isRequired
    );
    result ??= { ...current };
    if ('value' in converted) {
      result[key] = converted.value;
      continue;
    }
    if (!isRequired) {
      warnOnce(part, key, value, converted.problem, 'the default');
      delete result[key];
      continue;
    }
    const placeholder = fallback(attribute, key, id);
    warnOnce(part, key, value, converted.problem, describe(placeholder));
    result[key] = placeholder;
  }
  return (result ?? props) as P;
}

/**
 * A part that is another library's component, such as `Dialog`, with its
 * attributes converted. Recharts finds its children by `displayName`, so the
 * wrapper keeps it.
 */
export function withCanvasProps(
  part: string,
  Component: React.ComponentType<Props>
) {
  const Wrapped = React.forwardRef<unknown, Props>(
    function Wrapped(props, ref) {
      const converted = useCanvasProps(part, props);
      return React.createElement(
        Component,
        ref ? { ...converted, ref } : converted
      );
    }
  );
  Wrapped.displayName = Component.displayName ?? part;
  return Wrapped;
}
