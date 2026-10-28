// Runs in bundle.js. A canvas sets props through x-import attributes, which
// arrive as strings. `useCanvasProps` turns each string into the type its
// prop declares, by the attributes in nxds:canvas-schema. A string that
// doesn't fit logs one warning and falls back, so an artboard never crashes
// on it. Values that aren't strings, from `{{...}}`, `dc-props` or nxds's own
// parts, pass through untouched.
import * as React from 'react';

import { CANVAS_SCHEMA } from 'nxds:canvas-schema';
import { ICON_COMPONENTS } from 'nxds:icon-names';

import type {
  DateAttribute,
  IconAttribute,
  JsonAttribute,
  SchemaAttribute,
  SchemaList,
  SchemaScalar,
} from '../attribute.ts';

import { kebab } from './canvas-names.ts';
import { unwrapped } from './canvas-wrapper.ts';
import { Icon } from './icon.ts';

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

type Props = Record<string, unknown>;

/** A converted value, or why the attribute doesn't fit its prop. */
type Converted = { value: unknown } | { problem: string };

const NUMBER = /^-?\d+(?:\.\d+)?$/;
const DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;
const MAX_JSON = 256 * 1024;
const MAX_CACHED_LENGTH = 4 * 1024 * 1024;

const DATE_ITEM: DateAttribute = { kind: 'date', selection: null };

function fail(problem: string): Converted {
  return { problem };
}

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  return NUMBER.test(trimmed) ? Number(trimmed) : null;
}

function toBoolean(value: string): boolean | null {
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

// Local midnight, so the day doesn't move with the time zone. A day that
// doesn't exist, such as 30 February, doesn't roll over into March.
function toDate(value: string): Date | null {
  const match = DATE.exec(value.trim());
  if (!match) return null;
  const [, year, month, day = '01'] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const fits =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);
  return fits ? date : null;
}

function literals(values: readonly (string | number)[]) {
  return values.map((value) => `"${value}"`).join(', ');
}

function scalar(
  value: string,
  attribute: SchemaScalar,
  required = false
): Converted {
  const number = toNumber(value);
  const option = attribute.literals.find((literal) =>
    typeof literal === 'string' ? literal === value : literal === number
  );
  if (option !== undefined) return { value: option };
  if (attribute.number && number !== null) return { value: number };
  const bool = attribute.boolean ? toBoolean(value) : null;
  if (bool !== null) return { value: bool };
  if (attribute.string) {
    return required && value === '' ? fail('is empty') : { value };
  }
  const accepted = [
    attribute.literals.length > 0 ? literals(attribute.literals) : '',
    attribute.number ? 'a number' : '',
    attribute.boolean ? 'true or false' : '',
  ].filter(Boolean);
  return fail(`isn't ${accepted.join(', or ')}`);
}

function date(value: string): Converted {
  const parsed = toDate(value);
  return parsed ? { value: parsed } : fail("isn't a date such as 2026-10-28");
}

// `IconPlus` or `Plus` for `plus`.
function iconName(value: string) {
  return value
    .replace(/^Icon(?=[A-Z])/, '')
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

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

// A comma list, or a JSON array for items that hold commas. Each item takes
// the item's type.
function items(value: string, item: SchemaScalar | DateAttribute): Converted {
  const trimmed = value.trim();
  if (trimmed === '') return { value: [] };
  const parts = trimmed.startsWith('[')
    ? parseJson(trimmed)
    : value.split(',').map((part) => part.trim());
  if (!Array.isArray(parts)) return fail("isn't a JSON array");
  const converted: unknown[] = [];
  for (const part of parts) {
    if (typeof part !== 'string' && typeof part !== 'number') {
      return fail("has an item that isn't text or a number");
    }
    const text = String(part).trim();
    if (text === '') return fail('has an empty item');
    const one = item.kind === 'date' ? date(text) : scalar(text, item);
    if ('problem' in one) return fail(`has an item that ${one.problem}`);
    converted.push(one.value);
  }
  return { value: converted };
}

function list(
  value: string,
  { item, single, listWhen }: SchemaList,
  props: Props
): Converted {
  if (!single) return items(value, item);
  if (listWhen) {
    return props[listWhen.prop] === listWhen.value
      ? items(value, item)
      : scalar(value, single);
  }
  // A value `single` takes, such as Slider's `60`, is one value.
  const one = scalar(value, single);
  return 'problem' in one ? items(value, item) : one;
}

// DatePicker's `selected`: one date, a comma list or a range.
function selection(
  value: string,
  { prop, list: listValue, range }: NonNullable<DateAttribute['selection']>,
  props: Props
): Converted {
  if (props[prop] === listValue) return items(value, DATE_ITEM);
  if (props[prop] !== range) return date(value);
  const dates = items(value, DATE_ITEM);
  if ('problem' in dates) return dates;
  const [from, to, ...rest] = dates.value as Date[];
  if (!from || !to || rest.length > 0) {
    return fail("isn't two dates, the first and last");
  }
  return { value: { from, to } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ISO strings become dates where the prop's type holds a Date.
function revive(
  value: unknown,
  dateKeys: readonly string[],
  dateItems: boolean
): unknown {
  const revived = (item: unknown, holdsDate: boolean) => {
    const parsed = holdsDate && typeof item === 'string' ? toDate(item) : null;
    return parsed ?? revive(item, dateKeys, dateItems);
  };
  if (Array.isArray(value)) {
    return value.map((item) => revived(item, dateItems));
  }
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      revived(item, dateKeys.includes(key)),
    ])
  );
}

// Why `value` isn't an object with every `required` key, or null.
function shapeProblem(value: unknown, required: readonly string[]) {
  if (!isRecord(value)) return "isn't an object";
  const missing = required.find((key) => !(key in value));
  return missing === undefined ? null : `has no "${missing}" key`;
}

function json(value: string, attribute: JsonAttribute): Converted {
  const bool = attribute.boolean ? toBoolean(value) : null;
  if (bool !== null) return { value: bool };
  if (value.length > MAX_JSON) return fail('is over 256 KB of JSON');
  const parsed = parseJson(value);
  if (parsed === undefined) return fail("isn't valid JSON");
  if (attribute.shape === 'object') {
    const problem = shapeProblem(parsed, attribute.required);
    if (problem) return fail(problem);
  }
  if (attribute.shape === 'array') {
    if (!Array.isArray(parsed)) return fail("isn't a JSON array");
    for (const item of parsed) {
      const problem = shapeProblem(item, attribute.required);
      if (problem) return fail(`has an item that ${problem}`);
    }
  }
  return { value: revive(parsed, attribute.dateKeys, attribute.dateItems) };
}

function convert(
  value: string,
  attribute: SchemaAttribute,
  props: Props,
  required: boolean
): Converted {
  switch (attribute.kind) {
    case 'scalar':
      return scalar(value, attribute, required);
    case 'icon':
      return icon(value, attribute.as);
    case 'date':
      return attribute.selection
        ? selection(value, attribute.selection, props)
        : date(value);
    case 'list':
      return list(value, attribute, props);
    case 'json':
      return json(value, attribute);
  }
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
