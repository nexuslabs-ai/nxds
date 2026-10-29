// The attribute values bundle.js reads, and the props they convert to. The
// build checks sampler.html with the same converters.
import type {
  DateAttribute,
  JsonAttribute,
  SchemaList,
  SchemaScalar,
} from '../attribute.ts';

/** An attribute converted from its string alone. Icons need the bundle's icon set, so they aren't. */
export type ValueAttribute =
  | SchemaScalar
  | SchemaList
  | DateAttribute
  | JsonAttribute;

export type Props = Record<string, unknown>;

/** A converted value, or why the attribute doesn't fit its prop. */
export type Converted = { value: unknown } | { problem: string };

const DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

const NUMBER = /^-?\d+(?:\.\d+)?$/;

const MAX_JSON = 256 * 1024;

const DATE_ITEM: DateAttribute = { kind: 'date', selection: null };

export function toNumber(value: string): number | null {
  const trimmed = value.trim();
  return NUMBER.test(trimmed) ? Number(trimmed) : null;
}

export function toBoolean(value: string): boolean | null {
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

// Local midnight, so the day doesn't move with the time zone. A day that
// doesn't exist, such as 30 February, doesn't roll over into March.
export function toDate(value: string): Date | null {
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

export function fail(problem: string): Converted {
  return { problem };
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

/** `value` as its prop's type. `props` holds the props that pick how it reads, such as Accordion's `type`. */
export function convertValue(
  value: string,
  attribute: ValueAttribute,
  props: Props,
  required = false
): Converted {
  switch (attribute.kind) {
    case 'scalar':
      return scalar(value, attribute, required);
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
