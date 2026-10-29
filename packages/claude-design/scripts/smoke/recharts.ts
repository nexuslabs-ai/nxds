import {
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  x,
} from './harness.ts';

const MONTHS = `[{"month":"Jan","desktop":186,"mobile":80},{"month":"Feb","desktop":305,"mobile":200},{"month":"Mar","desktop":237,"mobile":120}]`;
const CHART_CONFIG = `{"desktop":{"label":"Desktop","color":"var(--nx-color-chart-categorical-1)"},"mobile":{"label":"Mobile","color":"var(--nx-color-chart-categorical-2)"}}`;

/** Custom charts composed from Nxds.Recharts parts, and what each must draw. */
export const RECHARTS_CASES: {
  name: string;
  markup: string;
  drawn: Record<string, number>;
  attributes?: [string, string, string][];
}[] = [
  {
    name: 'a composed bar chart draws its bars through the wrappers',
    markup: x(
      'ChartContainer',
      `config='${CHART_CONFIG}' class-name="nx:h-64 nx:w-[480px]"`,
      x(
        'Recharts.BarChart',
        `data='${MONTHS}' accessibility-layer`,
        x('Recharts.CartesianGrid', 'vertical="false"'),
        x(
          'Recharts.XAxis',
          'data-key="month" tick-line="false" axis-line="false"'
        ),
        x(
          'Recharts.Bar',
          'data-key="desktop" fill="var(--color-desktop)" radius="4"'
        ),
        x(
          'Recharts.Bar',
          'data-key="mobile" fill="var(--color-mobile)" radius="4,4,0,0"'
        )
      )
    ),
    drawn: {
      '.recharts-bar-rectangle path': 6,
      '.recharts-cartesian-axis-tick-value': 3,
    },
    attributes: [
      ['.recharts-bar-rectangle path', 'fill', 'var(--color-desktop)'],
    ],
  },
  {
    name: 'a composed line chart draws its lines',
    markup: x(
      'ChartContainer',
      `config='${CHART_CONFIG}' class-name="nx:h-64 nx:w-[480px]"`,
      x(
        'Recharts.LineChart',
        `data='${MONTHS}'`,
        x('Recharts.XAxis', 'data-key="month"'),
        x(
          'Recharts.Line',
          'data-key="desktop" type="monotone" stroke="var(--color-desktop)" dot="false" is-animation-active="false"'
        ),
        x(
          'Recharts.Line',
          'data-key="mobile" type="monotone" stroke="var(--color-mobile)" stroke-dasharray="6 4" dot="false" is-animation-active="false"'
        )
      )
    ),
    drawn: { '.recharts-line-curve': 2, '.recharts-line-dot': 0 },
    attributes: [
      [
        '.recharts-line-curve[stroke="var(--color-mobile)"]',
        'stroke-dasharray',
        '6 4',
      ],
    ],
  },
  {
    name: 'Cells colour each Pie slice through the wrappers',
    markup: x(
      'ChartContainer',
      `config='${CHART_CONFIG}' class-name="nx:h-64 nx:w-64"`,
      x(
        'Recharts.PieChart',
        '',
        x(
          'Recharts.Pie',
          `data='[{"browser":"Chrome","visitors":275},{"browser":"Safari","visitors":200}]' data-key="visitors" name-key="browser" inner-radius="40"`,
          x('Recharts.Cell', 'fill="var(--nx-color-chart-categorical-3)"'),
          x('Recharts.Cell', 'fill="var(--nx-color-chart-categorical-4)"')
        )
      )
    ),
    drawn: { '.recharts-pie-sector': 2 },
    attributes: [
      [
        '.recharts-pie-sector path',
        'fill',
        'var(--nx-color-chart-categorical-3)',
      ],
    ],
  },
  {
    name: 'a part without a dataKey keeps data-key as written',
    markup: x('Button', 'data-key="save"', 'Save'),
    drawn: { 'button[data-key="save"]': 1 },
  },
];

export async function checkRecharts() {
  const { page, problems } = await openPage('Button', LIGHT);
  for (const { name, markup, drawn, attributes = [] } of RECHARTS_CASES) {
    const found = await page.evaluate(
      async ({ markup, selectors, attributes }) => {
        const { ReactDOM, __nxdsMarkup } = window as unknown as PageGlobals;
        const host = document.createElement('div');
        document.body.append(host);
        const root = ReactDOM.createRoot(host);
        ReactDOM.flushSync(() => root.render(__nxdsMarkup(markup, true)));
        // Recharts draws each shape once its entry animation starts.
        await new Promise((resolve) => setTimeout(resolve, 1800));
        const counts = selectors.map(
          (selector) => host.querySelectorAll(selector).length
        );
        const values = attributes.map(
          ([selector, attribute]) =>
            host.querySelector(selector)?.getAttribute(attribute) ?? null
        );
        root.unmount();
        host.remove();
        return { counts, values };
      },
      { markup, selectors: Object.keys(drawn), attributes }
    );
    failOnProblems(name, problems, true);
    Object.entries(drawn).forEach(([selector, count], index) => {
      if (found.counts[index] !== count) {
        fail(
          `${name}: draws ${found.counts[index]} ${selector}, not ${count}.`
        );
      }
    });
    attributes.forEach(([selector, attribute, value], index) => {
      if (found.values[index] !== value) {
        fail(
          `${name}: ${selector} has ${attribute}="${found.values[index]}", not "${value}".`
        );
      }
    });
  }
  await page.close();
}
