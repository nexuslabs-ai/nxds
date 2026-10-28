// Runs in bundle.js. A canvas sets props through x-import attributes, which
// arrive as strings. `coerce` turns each string into the type its prop
// declares, by the rules in nxds:canvas-schema. A string that doesn't fit
// logs one warning and falls back, so an artboard never crashes on it.
// Values that aren't strings, from `{{...}}`, `dc-props` or nxds's own
// parts, pass through untouched.
import * as React from 'react';

import { CANVAS_SCHEMA } from 'nxds:canvas-schema';
import { ICON_COMPONENTS } from 'nxds:icon-names';

import { Icon } from './canvas/icon.ts';
import { kebab, unwrapped } from './canvas-wrapper.ts';

/**
 * How one prop's attribute converts, in a compact form:
 * - `b` boolean, `n` number, `d` date, `D` DatePicker's `selected`,
 *   `s` a string that can't be empty, `i` an icon name, `I` an icon prop,
 *   which renders the named icon;
 * - `['e', literals, flags]` a literal union, where flags holds `s`
 *   (any string), `n` (any number) and `b` (boolean);
 * - `['l', item, single]` a comma list, with the one value it also takes;
 * - `['j', shape, required, dateKeys, dateItems, boolean]` JSON.
 */
export type Rule =
  | 'b'
  | 'n'
  | 'd'
  | 'D'
  | 's'
  | 'i'
  | 'I'
  | ['e', (string | number)[], string]
  | ['l', Rule, Rule | null]
  | ['j', 'o' | 'a' | '*', string[], string[], 0 | 1, 0 | 1];

export interface CanvasSchema {
  /** Each part's rules, by prop. */
  rules: Record<string, Record<string, Rule>>;
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

/** Props whose value picks how another prop reads, converted first. */
const DISCRIMINANTS = ['type', 'mode'];

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
  [, options, flags]: ['e', (string | number)[], string]
): Converted {
  const number = toNumber(value);
  for (const option of options) {
    if (typeof option === 'string' ? option === value : option === number) {
      return { value: option };
    }
  }
  if (flags.includes('n') && number !== null) return { value: number };
  if (flags.includes('s')) return { value };
  const bool = flags.includes('b') ? toBoolean(value) : null;
  if (bool !== null) return { value: bool };
  const accepted = [
    options.length > 0 ? literals(options) : '',
    flags.includes('n') ? 'a number' : '',
    flags.includes('b') ? 'true or false' : '',
  ].filter(Boolean);
  return fail(`isn't ${accepted.join(', or ')}`);
}

// `IconPlus` or `Plus` for `plus`.
function iconName(value: string) {
  return value
    .replace(/^Icon(?=[A-Z])/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase();
}

function icon(value: string, rule: 'i' | 'I'): Converted {
  if (!ICON_COMPONENTS[value]) {
    const suggestion = iconName(value);
    return fail(
      ICON_COMPONENTS[suggestion]
        ? `isn't an icon name; write "${suggestion}"`
        : "isn't an icon name in components/Icon/README.md"
    );
  }
  return {
    value: rule === 'i' ? value : React.createElement(Icon, { name: value }),
  };
}

function convertOne(value: string, rule: Rule, props: Props): Converted {
  if (rule === 'i' || rule === 'I') return icon(value, rule);
  if (rule === 'b') {
    const bool = toBoolean(value);
    return bool === null ? fail("isn't true or false") : { value: bool };
  }
  if (rule === 'n') {
    const number = toNumber(value);
    return number === null ? fail("isn't a number") : { value: number };
  }
  if (rule === 's') return value === '' ? fail('is empty') : { value };
  if (rule === 'd') {
    const date = toDate(value);
    return date ? { value: date } : fail("isn't a date such as 2026-10-28");
  }
  if (rule === 'D') return selection(value, props);
  if (rule[0] === 'e') return scalar(value, rule);
  if (rule[0] === 'l') return list(value, rule, props);
  return json(value, rule);
}

function items(value: string, item: Rule, props: Props): Converted {
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    const parsed = parseJson(trimmed);
    return Array.isArray(parsed)
      ? { value: parsed }
      : fail("isn't a JSON array");
  }
  if (trimmed === '') return { value: [] };
  const converted: unknown[] = [];
  for (const part of value.split(',')) {
    if (part.trim() === '') return fail('has an empty item');
    const one = convertOne(part.trim(), item, props);
    if ('problem' in one) return fail(`has an item that ${one.problem}`);
    converted.push(one.value);
  }
  return { value: converted };
}

function list(
  value: string,
  [, item, single]: ['l', Rule, Rule | null],
  props: Props
): Converted {
  if (!single) return items(value, item, props);
  // Accordion's `value` is one value unless `type="multiple"`.
  if (Array.isArray(single) && single[0] === 'e' && single[2].includes('s')) {
    return props['type'] === 'multiple'
      ? items(value, item, props)
      : convertOne(value, single, props);
  }
  const one = convertOne(value, single, props);
  return 'problem' in one ? items(value, item, props) : one;
}

// DatePicker's `selected`: one date, a comma list or a range, by `mode`.
function selection(value: string, props: Props): Converted {
  if (props['mode'] === 'multiple') return items(value, 'd', props);
  if (props['mode'] !== 'range') return convertOne(value, 'd', props);
  const range = items(value, 'd', props);
  if ('problem' in range) return range;
  const dates = range.value as Date[];
  if (dates.length !== 2) return fail("isn't two dates, the first and last");
  return { value: { from: dates[0], to: dates[1] } };
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
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
  if (Array.isArray(value)) {
    return value.map((item) =>
      dateItems && typeof item === 'string' && toDate(item)
        ? toDate(item)
        : revive(item, dateKeys, dateItems)
    );
  }
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      dateKeys.includes(key) && typeof item === 'string' && toDate(item)
        ? toDate(item)
        : revive(item, dateKeys, dateItems),
    ])
  );
}

function missingKey(value: unknown, required: readonly string[]) {
  if (!isRecord(value)) return 'an object';
  return required.find((key) => !(key in value)) ?? null;
}

function json(
  value: string,
  [, shape, required, dateKeys, dateItems, boolean]: [
    'j',
    'o' | 'a' | '*',
    string[],
    string[],
    0 | 1,
    0 | 1,
  ]
): Converted {
  const bool = boolean ? toBoolean(value) : null;
  if (bool !== null) return { value: bool };
  if (value.length > MAX_JSON) return fail('is over 256 KB of JSON');
  const parsed = parseJson(value);
  if (parsed === undefined) return fail("isn't valid JSON");
  if (shape === 'o') {
    const missing = missingKey(parsed, required);
    if (missing)
      return fail(
        `needs ${missing === 'an object' ? 'an object' : `a "${missing}" key`}`
      );
  }
  if (shape === 'a') {
    if (!Array.isArray(parsed)) return fail("isn't a JSON array");
    for (const item of parsed) {
      const missing = missingKey(item, required);
      if (missing)
        return fail(
          `has an item without ${missing === 'an object' ? 'an object' : `a "${missing}" key`}`
        );
    }
  }
  return { value: revive(parsed, dateKeys, dateItems === 1) };
}

// What a required prop gets when its attribute doesn't fit.
function fallback(rule: Rule, prop: string): unknown {
  if (rule === 'b') return false;
  if (rule === 'n') return 0;
  if (rule === 's') return `${prop}-${(fallbackCount += 1)}`;
  if (typeof rule === 'string') return undefined;
  if (rule[0] === 'e') return rule[1][0];
  if (rule[0] === 'l') return [];
  if (rule[0] === 'j')
    return rule[1] === 'a' ? [] : rule[1] === 'o' ? {} : undefined;
  return undefined;
}

let fallbackCount = 0;
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

function ordered(props: Props) {
  const keys = Object.keys(props);
  return [
    ...DISCRIMINANTS.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !DISCRIMINANTS.includes(key)),
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
export function coerce<P extends object>(part: string, props: P): P {
  let result: Props | null = renamed(part, props as Props);
  const children = (result ?? (props as Props))['children'];
  if (isIndentation(children)) {
    result ??= { ...(props as Props) };
    delete result['children'];
  } else if (children !== undefined && CANVAS_SCHEMA.unwrap.includes(part)) {
    result ??= { ...(props as Props) };
    result['children'] = unwrapped(children as React.ReactNode);
  }
  const rules = CANVAS_SCHEMA.rules[part];
  if (!rules) return (result ?? props) as P;
  for (const key of ordered(props as Props)) {
    const value = (result ?? (props as Props))[key];
    const rule = rules[key];
    if (typeof value !== 'string' || !rule) continue;
    const converted = convertOne(value, rule, result ?? (props as Props));
    result ??= { ...(props as Props) };
    if ('value' in converted) {
      result[key] = converted.value;
      continue;
    }
    if (!CANVAS_SCHEMA.required[part]?.includes(key)) {
      warnOnce(part, key, value, converted.problem, 'the default');
      delete result[key];
      continue;
    }
    const placeholder = fallback(rule, key);
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
      const converted = coerce(part, props);
      return React.createElement(
        Component,
        ref ? { ...converted, ref } : converted
      );
    }
  );
  Wrapped.displayName = Component.displayName ?? part;
  return Wrapped;
}
