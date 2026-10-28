import { useId } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconTexture } from '@tabler/icons-react';
import * as Recharts from 'recharts';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  AreaChart,
  BarChart,
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  LineChart,
  PieChart,
} from './chart';

const meta: Meta<typeof ChartContainer> = {
  title: 'Components/Chart',
  component: ChartContainer,
  parameters: {
    docs: {
      description: {
        component:
          "Plot rows of data with BarChart, LineChart, AreaChart or PieChart. Each key in `series` is one series, colored in order. For a chart they don't cover, compose Recharts parts inside ChartContainer and set each series' label and color in `config`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

const data = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 173, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 264, mobile: 140 },
];

const config = {
  desktop: {
    label: 'Desktop (solid)',
    color: 'var(--nx-color-chart-categorical-1)',
  },
  mobile: {
    label: 'Mobile (patterned)',
    color: 'var(--nx-color-chart-categorical-2)',
    icon: IconTexture,
  },
} satisfies ChartConfig;

const shortMonth = (value: string) => value.slice(0, 3);

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

function AreaExample() {
  return (
    <ChartContainer config={config}>
      <Recharts.AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <Recharts.CartesianGrid vertical={false} />
        <Recharts.XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={shortMonth}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Recharts.Area
          dataKey="desktop"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
        <Recharts.Area
          dataKey="mobile"
          type="natural"
          fill="var(--color-mobile)"
          fillOpacity={0.4}
          stroke="var(--color-mobile)"
          strokeDasharray="6 4"
        />
      </Recharts.AreaChart>
    </ChartContainer>
  );
}

function BarExample() {
  const mobilePattern = useId();
  return (
    <ChartContainer config={config}>
      <Recharts.BarChart accessibilityLayer data={data}>
        <defs>
          <pattern
            id={mobilePattern}
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
          >
            <rect width={6} height={6} fill="var(--color-mobile)" />
            <path
              d="M0 0L6 6M-3 3L3 9M3 -3L9 3"
              stroke="var(--nx-color-container)"
              strokeWidth={1.5}
            />
          </pattern>
        </defs>
        <Recharts.CartesianGrid vertical={false} />
        <Recharts.XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={shortMonth}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Recharts.Bar
          dataKey="desktop"
          fill="var(--color-desktop)"
          radius={4}
        />
        <Recharts.Bar
          dataKey="mobile"
          fill={`url(#${mobilePattern})`}
          radius={4}
        />
      </Recharts.BarChart>
    </ChartContainer>
  );
}

function LineExample() {
  return (
    <ChartContainer config={config}>
      <Recharts.LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <Recharts.CartesianGrid vertical={false} />
        <Recharts.XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={shortMonth}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Recharts.Line
          dataKey="desktop"
          type="natural"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
        <Recharts.Line
          dataKey="mobile"
          type="natural"
          stroke="var(--color-mobile)"
          strokeDasharray="6 4"
          strokeWidth={2}
          dot={false}
        />
      </Recharts.LineChart>
    </ChartContainer>
  );
}

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

export const Bars: Story = {
  tags: ['docs'],
  name: 'Bar chart',
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart data={visitors} xKey="month" series={['desktop', 'mobile']} />
    </div>
  ),
};

export const StackedBars: Story = {
  tags: ['docs'],
  name: 'Stacked bar chart',
  parameters: {
    docs: {
      description: {
        story: 'Stack the series in one bar per category with `stacked`.',
      },
    },
  },
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
};

export const HorizontalBars: Story = {
  tags: ['docs'],
  name: 'Horizontal bar chart',
  parameters: {
    docs: {
      description: {
        story:
          'Run the bars left to right with `orientation="horizontal"`. The categories move to the y-axis.',
      },
    },
  },
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart
        data={browsers}
        xKey="browser"
        series={['visitors']}
        orientation="horizontal"
        legend={false}
      />
    </div>
  ),
};

export const Lines: Story = {
  tags: ['docs'],
  name: 'Line chart',
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <LineChart data={visitors} xKey="month" series={['desktop', 'mobile']} />
    </div>
  ),
};

export const Areas: Story = {
  tags: ['docs'],
  name: 'Area chart',
  parameters: {
    docs: {
      description: {
        story: 'Fade each area toward the axis with `fill="gradient"`.',
      },
    },
  },
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <AreaChart
        data={visitors}
        xKey="month"
        series={['desktop', 'mobile']}
        fill="gradient"
        stacked
      />
    </div>
  ),
};

export const Donut: Story = {
  tags: ['docs'],
  name: 'Pie chart',
  parameters: {
    docs: {
      description: {
        story:
          'Plot one value per row with PieChart. `donut` cuts out the middle.',
      },
    },
  },
  render: () => (
    <div className="nx:w-[400px] nx:max-w-full">
      <PieChart data={browsers} nameKey="browser" valueKey="visitors" donut />
    </div>
  ),
};

export const SeriesLabels: Story = {
  tags: ['docs'],
  name: 'Series labels and colors',
  parameters: {
    docs: {
      description: {
        story:
          'Each series is labelled by its key and colored in order. Set a label or color for a key in `config`.',
      },
    },
  },
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <LineChart
        data={visitors}
        xKey="month"
        series={['desktop', 'mobile']}
        config={{
          desktop: { label: 'Desktop visitors' },
          mobile: {
            label: 'Mobile visitors',
            color: 'var(--nx-color-chart-categorical-4)',
          },
        }}
        dots
      />
    </div>
  ),
};

export const BarChartStory: Story = {
  tags: ['docs'],
  name: 'Custom bar chart',
  parameters: {
    docs: {
      description: {
        story:
          "Compose Recharts parts inside ChartContainer for a chart the data charts don't cover, such as a patterned series.",
      },
    },
  },
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarExample />
    </div>
  ),
};

export const AreaChartStory: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Plot two series as areas, with a tooltip and a legend.',
      },
    },
  },
  name: 'Custom area chart',
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <AreaExample />
    </div>
  ),
};

export const LineChartStory: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Plot two series as lines, with a tooltip and a legend.',
      },
    },
  },
  name: 'Custom line chart',
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <LineExample />
    </div>
  ),
};

export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <ChartContainer config={config}>
        <Recharts.BarChart accessibilityLayer data={data}>
          <Recharts.Bar
            dataKey="desktop"
            fill="var(--color-desktop)"
            radius={4}
          />
        </Recharts.BarChart>
      </ChartContainer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const chart = canvasElement.querySelector('[data-slot="chart"]');
    await expect(chart).toBeInTheDocument();
    await expect(chart).toHaveAttribute('data-chart');
    // #497: chart base text migrated from the raw named text-size utility.
    await expect(chart).toHaveClass('nx:typography-body-small');
  },
};

/** The `n`th categorical chart color, as the charts write it. */
const categorical = (n: number) => `var(--nx-color-chart-categorical-${n})`;

function shapes(canvasElement: HTMLElement, selector: string) {
  return Array.from(canvasElement.querySelectorAll(selector));
}

// Recharts draws each bar's path once its entry animation starts.
const BAR = '.recharts-bar-rectangle path';

export const SeriesBars: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart data={visitors} xKey="month" series={['desktop', 'mobile']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(shapes(canvasElement, BAR)).toHaveLength(12));
    await expect(canvas.getByText('Desktop')).toBeInTheDocument();
    await expect(canvas.getByText('Mobile')).toBeInTheDocument();
    await expect(canvas.getByText('Jan')).toBeInTheDocument();
  },
};

export const KeyboardTooltip: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart data={visitors} xKey="month" series={['desktop']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const surface = canvasElement.querySelector('[tabindex="0"]');
    await expect(surface).toHaveFocus();
    // Focus selects January; the arrow moves to February.
    await userEvent.keyboard('{ArrowRight}');
    const tooltip = canvasElement.querySelector('.recharts-tooltip-wrapper');
    await waitFor(() => expect(tooltip).toHaveTextContent('FebDesktop305'));
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

export const MissingSeries: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarChart data={visitors} xKey="month" series={['desktop', 'tablet']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shapes(canvasElement, BAR)).toHaveLength(6));
    await expect(within(canvasElement).getByText('Tablet')).toBeInTheDocument();
  },
};

export const EmptyData: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <LineChart data={[]} xKey="month" series={['desktop']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="chart"]')
    ).toBeInTheDocument();
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
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(shapes(canvasElement, '.recharts-pie-sector')).toHaveLength(5)
    );
    await expect(canvas.getByText('Chrome')).toBeInTheDocument();
    await expect(canvas.getByText('Other')).toBeInTheDocument();
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

export const LongLabels: Story = {
  render: () => (
    <div className="nx:w-[360px] nx:max-w-full">
      <BarChart
        data={[
          { region: 'North America and the Caribbean', revenue: 420 },
          { region: 'Europe, the Middle East and Africa', revenue: 380 },
          { region: 'Asia Pacific', revenue: 290 },
        ]}
        xKey="region"
        series={['revenue']}
        orientation="horizontal"
        legend={false}
      />
    </div>
  ),
};

export const Dark: Story = {
  globals: { mode: 'dark' },
  render: () => (
    <div className="nx:flex nx:w-[600px] nx:max-w-full nx:flex-col nx:gap-10">
      <AreaChart data={visitors} xKey="month" series={['desktop', 'mobile']} />
      <PieChart data={browsers} nameKey="browser" valueKey="visitors" donut />
    </div>
  ),
};

export const AxisTickText: Story = {
  render: () => (
    <div className="nx:w-[600px] nx:max-w-full">
      <BarExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tick = (await canvas.findByText('Jan')).closest('text');
    const chart = canvasElement.querySelector('[data-slot="chart"]');

    await expect(styledBy(chart, 'fill-muted-foreground')).toContain(tick);
    await expect(styledBy(chart, 'tabular-nums')).toContain(tick);
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-[600px] nx:max-w-full nx:flex-col nx:gap-10">
      <BarChart data={visitors} xKey="month" series={['desktop', 'mobile']} />
      <BarChart
        data={visitors}
        xKey="month"
        series={['desktop', 'mobile']}
        stacked
      />
      <BarChart
        data={browsers}
        xKey="browser"
        series={['visitors']}
        orientation="horizontal"
      />
      <LineChart data={visitors} xKey="month" series={['desktop', 'mobile']} />
      <AreaChart data={visitors} xKey="month" series={['desktop', 'mobile']} />
      <PieChart data={browsers} nameKey="browser" valueKey="visitors" />
      <AreaExample />
      <BarExample />
      <LineExample />
    </div>
  ),
};

export const Grayscale: Story = {
  render: () => (
    <div
      data-testid="grayscale-preview"
      className="nx:w-[600px] nx:max-w-full nx:space-y-6 nx:grayscale"
    >
      <p className="nx:typography-body-default">
        Desktop uses solid marks. Mobile uses dashed lines and striped bars.
      </p>
      <LineExample />
      <BarExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Desktop (solid)').length).toBeGreaterThan(
      0
    );
    await expect(
      canvas.getAllByText('Mobile (patterned)').length
    ).toBeGreaterThan(0);
    await waitFor(() => {
      const dashes = Array.from(
        canvasElement.querySelectorAll('[stroke-dasharray]')
      ).map((path) =>
        path
          .getAttribute('stroke-dasharray')
          ?.split(/[,\s]+/)
          .map(parseFloat)
      );
      expect(dashes.some((dash) => dash?.[0] === 6 && dash[1] === 4)).toBe(
        true
      );
      expect(
        getComputedStyle(canvas.getByTestId('grayscale-preview')).filter
      ).toContain('grayscale(1)');
    });
    const pattern = canvasElement.querySelector('pattern');
    await expect(pattern).toBeInTheDocument();
    await expect(
      canvasElement.querySelector(`[fill="url(#${pattern?.id})"]`)
    ).toBeInTheDocument();
  },
};
