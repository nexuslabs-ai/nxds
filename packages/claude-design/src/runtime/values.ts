// The attribute values bundle.js reads as numbers, booleans and dates. The
// build checks sampler.html with the same readers.

const DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

const NUMBER = /^-?\d+(?:\.\d+)?$/;

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
