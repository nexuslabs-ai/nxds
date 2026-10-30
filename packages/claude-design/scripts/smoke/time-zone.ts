import {
  canvasContext,
  compareSignatures,
  date,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  part,
  signatureOf,
  x,
} from './harness.ts';

// Chile starts daylight saving at midnight, so 6 September 2026 has no
// 00:00. A date still selects its own day there.
const DATE_ZONE = 'America/Santiago';

export async function checkTimeZone() {
  const zoned = await canvasContext({ timezoneId: DATE_ZONE });
  const { page, problems } = await openPage('Button', LIGHT, zoned);
  const name = `a date in ${DATE_ZONE}`;
  const want = await signatureOf(page, {
    tree: part('DatePicker', {
      mode: 'single',
      selected: date(2026, 9, 6),
      defaultMonth: date(2026, 9, 1),
    }),
  });
  const got = await signatureOf(page, {
    markup: x(
      'DatePicker',
      'mode="single" selected="2026-09-06" default-month="2026-09"'
    ),
  });
  failOnProblems(name, problems, true);
  compareSignatures(name, want, got);
  const selected = (got.signature ?? []).some((line) =>
    line.includes('aria-label=Sunday, September 6th, 2026, selected')
  );
  if (!selected) fail(`${name}: 2026-09-06 isn't the selected day.`);
  await zoned.close();
}
