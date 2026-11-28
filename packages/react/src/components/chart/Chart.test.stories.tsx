import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { BarChart, type ChartContainer, LineChart, PieChart } from './chart';
import chartMeta, {
  BarChartStory,
  EmptyData,
  Grayscale,
  KeyboardTooltip,
  MissingSeries,
  SeriesBars,
  WithDataAttributes,
} from './Chart.stories';

const meta: Meta<typeof ChartContainer> = {
  ...chartMeta,
  title: 'Tests/Chart',
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

const visitors = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 173, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 264, mobile: 140 },
];

const browsers = [
  { browser: 'Chrome', visitors: 275 },
  { browser: 'Safari', visitors: 200 },
  { browser: 'Firefox', visitors: 187 },
  { browser: 'Edge', visitors: 173 },
  { browser: 'Other', visitors: 90 },
];

/** The elements inside `chart` that its `nx:[&_{selector}]:{utility}` classes style. */
function styledBy(chart: Element | null, utility: string) {
  if (!chart) return [];
  const prefix = 'nx:[&_';
  const suffix = `]:${utility}`;
  return Array.from(chart.classList)
    .filter(
      (className) => className.startsWith(prefix) && className.endsWith(suffix)
    )
    .flatMap((className) => {
      const selector = className
        .slice(prefix.length, -suffix.length)
        .replace(/_/g, ' ');
      return Array.from(chart.querySelectorAll(selector));
    });
}

/** The `n`th categorical chart color, as the charts write it. */
const categorical = (n: number) => `var(--nx-color-chart-categorical-${n})`;

function shapes(canvasElement: HTMLElement, selector: string) {
  return Array.from(canvasElement.querySelectorAll(selector));
}

// Recharts draws each bar's path once its entry animation starts.
const BAR = '.recharts-bar-rectangle path';

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const chart = canvasElement.querySelector('[data-slot="chart"]');
    // #497: chart base text migrated from the raw named text-size utility.
    await expect(chart).toHaveClass('nx:typography-body-small');
  },
};

export const SeriesBarsMarks: Story = {
  ...SeriesBars,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shapes(canvasElement, BAR)).toHaveLength(12));
  },
};

export const KeyboardTooltipContent: Story = {
  ...KeyboardTooltip,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    // Focus selects January; the arrow moves to February.
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-tooltip-wrapper')
      ).toHaveTextContent('FebDesktop305')
    );
  },
};

export const SeriesOrder: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart data={visitors} xKey="month" series={['mobile', 'desktop']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-legend-wrapper')
      ).toHaveTextContent('MobileDesktop')
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-tooltip-wrapper')
      ).toHaveTextContent('FebMobile200Desktop305')
    );
  },
};

export const HorizontalCategories: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart
        data={browsers}
        xKey="browser"
        series={['visitors']}
        orientation="horizontal"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tick = (await within(canvasElement).findByText('Chrome')).closest(
      '.recharts-yAxis-tick-labels'
    );
    await expect(tick).toBeInTheDocument();
  },
};

export const StackedRadius: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart
        data={visitors}
        xKey="month"
        series={['desktop', 'mobile']}
        stacked
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shapes(canvasElement, BAR)).toHaveLength(12));
    const layers = shapes(canvasElement, '.recharts-bar-rectangles');
    const bottom = layers[0]?.querySelector('path')?.getAttribute('d') ?? '';
    const top = layers[1]?.querySelector('path')?.getAttribute('d') ?? '';
    // A rounded corner draws an arc; only the stack's outer end has one.
    await expect(bottom).not.toContain('A');
    await expect(top).toContain('A');
  },
};

export const ManySeries: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart
        data={[{ team: 'Q1', a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }]}
        xKey="team"
        series={['a', 'b', 'c', 'd', 'e', 'f']}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shapes(canvasElement, BAR)).toHaveLength(6));
    const fills = shapes(canvasElement, BAR).map((path) =>
      path.getAttribute('fill')
    );
    // Colors cycle after the fifth series.
    await expect(fills[0]).toBe(categorical(1));
    await expect(fills[5]).toBe(categorical(1));
  },
};

export const MissingSeriesMarks: Story = {
  ...MissingSeries,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shapes(canvasElement, BAR)).toHaveLength(6));
  },
};

export const EmptyDataMarks: Story = {
  ...EmptyData,
  play: async ({ canvasElement }) => {
    await expect(shapes(canvasElement, '.recharts-line-curve')).toHaveLength(0);
  },
};

export const SinglePoint: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <LineChart
        data={[{ month: 'Jan', desktop: 186 }]}
        xKey="month"
        series={['desktop']}
        dots
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(shapes(canvasElement, '.recharts-line-dot')).toHaveLength(1)
    );
  },
};

export const PieSlices: Story = {
  render: () => (
    <div className="nx:w-[400px] nx:max-w-full">
      <PieChart data={browsers} nameKey="browser" valueKey="visitors" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(shapes(canvasElement, '.recharts-pie-sector')).toHaveLength(5)
    );
    await expect(
      canvasElement.querySelector('.recharts-legend-wrapper')
    ).toHaveTextContent('ChromeSafariFirefoxEdgeOther');
  },
};

export const EmptyPie: Story = {
  render: () => (
    <div className="nx:w-[400px] nx:max-w-full">
      <PieChart
        data={[
          { browser: 'Chrome', visitors: 0 },
          { browser: 'Safari', visitors: 0 },
        ]}
        nameKey="browser"
        valueKey="visitors"
        donut
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(shapes(canvasElement, '.recharts-pie-sector')).toHaveLength(1)
    );
    const sector = canvasElement.querySelector('.recharts-pie-sector path');
    await expect(sector).toHaveAttribute('fill', 'var(--nx-color-muted)');
  },
};

export const AxisTickText: Story = {
  render: BarChartStory.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tick = (await canvas.findByText('Jan')).closest('text');
    const chart = canvasElement.querySelector('[data-slot="chart"]');

    await expect(styledBy(chart, 'fill-muted-foreground')).toContain(tick);
    await expect(styledBy(chart, 'tabular-nums')).toContain(tick);
  },
};

export const GrayscaleStyle: Story = {
  ...Grayscale,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        getComputedStyle(canvas.getByTestId('grayscale-preview')).filter
      ).toContain('grayscale(1)')
    );
  },
};
