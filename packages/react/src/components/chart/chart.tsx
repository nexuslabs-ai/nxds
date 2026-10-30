'use client';

import * as React from 'react';

import * as RechartsPrimitive from 'recharts';

import { CHART_CATEGORICAL_SERIES } from '../../lib/chart';
import { cn } from '../../lib/utils';

/**
 * Label, icon and color for each series, keyed by the series `dataKey`.
 * Each `color` becomes a `--color-{key}` variable, so a series can use `fill="var(--color-{key})"`.
 * Keys with a `color` may use only letters, numbers, `_` and `-`.
 *
 * Set `color` to a chart token, such as `var(--nx-color-chart-categorical-1)`, so it follows light and dark mode.
 * Treat `color` as trusted CSS, not user data.
 */
export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    /** @thirdPartyShape Recharts' legend and tooltip render it as a component. */
    icon?: React.ComponentType;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);
const chartColorKeyPattern = /^[A-Za-z0-9_-]+$/;

type ChartRootStyle = React.CSSProperties & {
  [key: `--color-${string}`]: string | undefined;
};

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  style,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
}) {
  const uniqueId = React.useId();
  // Strip the colons React emits in some runtimes (`:r0:`) so the data attribute
  // remains convenient to query in tests and consumer CSS.
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
  const chartStyle = getChartStyle(config, style);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "nx:flex nx:aspect-video nx:justify-center nx:typography-body-small nx:[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground nx:[&_.recharts-cartesian-axis-tick-value]:tabular-nums nx:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border-default nx:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border-default nx:[&_.recharts-dot[stroke='#fff']]:stroke-transparent nx:[&_.recharts-layer]:outline-hidden nx:[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border-default nx:[&_.recharts-radial-bar-background-sector]:fill-muted nx:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted nx:[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border-default nx:[&_.recharts-sector]:outline-hidden nx:[&_.recharts-sector[stroke='#fff']]:stroke-transparent nx:[&_.recharts-surface]:outline-hidden",
          className
        )}
        style={chartStyle}
        {...props}
      >
        {/* Recharts warns on its -1 × -1 default before the first measure. */}
        <RechartsPrimitive.ResponsiveContainer
          initialDimension={{ width: 1, height: 1 }}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function getChartStyle(
  config: ChartConfig,
  style: React.CSSProperties | undefined
) {
  const colorStyle = Object.entries(config).reduce<ChartRootStyle>(
    (acc, [key, conf]) => {
      if (!conf.color || !chartColorKeyPattern.test(key)) {
        return acc;
      }

      acc[`--color-${key}`] = conf.color;

      return acc;
    },
    {}
  );

  if (!Object.keys(colorStyle).length) {
    return style;
  }

  return { ...colorStyle, ...style };
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartIndicator = 'line' | 'dot' | 'dashed';

export type ChartTooltipFormatter = (
  value: RechartsPrimitive.TooltipPayloadEntry['value'],
  name: RechartsPrimitive.TooltipPayloadEntry['name'],
  item: RechartsPrimitive.TooltipPayloadEntry,
  index: number,
  payload: RechartsPrimitive.TooltipPayloadEntry['payload']
) => React.ReactNode;

interface ChartTooltipContentProps extends Pick<
  RechartsPrimitive.DefaultTooltipContentProps,
  'payload' | 'label' | 'labelFormatter' | 'labelClassName'
> {
  active?: boolean;
  className?: string;
  indicator?: ChartIndicator;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  formatter?: ChartTooltipFormatter;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

/** Shared class for one tooltip row (formatter row and default row alike). */
const tooltipRowClassName = (indicator: ChartIndicator) =>
  cn(
    'nx:[&>svg]:text-muted-foreground nx:flex nx:w-full nx:flex-wrap nx:items-stretch nx:gap-2 nx:[&>svg]:size-icon-[length:var(--nx-spacing-2_5)] nx:icon-stroke',
    indicator === 'dot' && 'nx:items-center'
  );

interface ChartTooltipLabelProps {
  payload: ReadonlyArray<RechartsPrimitive.TooltipPayloadEntry>;
  label?: React.ReactNode;
  labelKey?: string;
  labelFormatter?: ChartTooltipContentProps['labelFormatter'];
  labelClassName?: string;
}

/** The tooltip's leading label, resolved from config / `labelKey` / `labelFormatter`. */
function ChartTooltipLabel({
  payload,
  label,
  labelKey,
  labelFormatter,
  labelClassName,
}: ChartTooltipLabelProps) {
  const { config } = useChart();
  const [item] = payload;
  const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);
  const value =
    !labelKey && typeof label === 'string'
      ? config[label]?.label || label
      : itemConfig?.label;

  if (labelFormatter) {
    return (
      <div className={cn('nx:typography-label-default', labelClassName)}>
        {labelFormatter(value, payload)}
      </div>
    );
  }
  if (!value) return null;
  return (
    <div className={cn('nx:typography-label-default', labelClassName)}>
      {value}
    </div>
  );
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const nestLabel = payload.length === 1 && indicator !== 'dot';
  const tooltipLabel = hideLabel ? null : (
    <ChartTooltipLabel
      payload={payload}
      label={label}
      labelKey={labelKey}
      labelFormatter={labelFormatter}
      labelClassName={labelClassName}
    />
  );

  return (
    <div
      className={cn(
        'nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:grid nx:min-w-32 nx:items-start nx:gap-1.5 nx:rounded-md nx:border-default nx:px-3 nx:py-1.5 nx:typography-body-small nx:shadow-lg',
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="nx:grid nx:gap-1.5">
        {payload.map((item, index) =>
          formatter && item.value !== undefined && item.name ? (
            <div
              key={`${item.dataKey}`}
              className={tooltipRowClassName(indicator)}
            >
              {formatter(item.value, item.name, item, index, item.payload)}
            </div>
          ) : (
            <ChartTooltipItem
              key={`${item.dataKey}`}
              item={item}
              indicator={indicator}
              hideIndicator={hideIndicator}
              color={color}
              nameKey={nameKey}
              nestLabel={nestLabel}
            >
              {nestLabel ? tooltipLabel : null}
            </ChartTooltipItem>
          )
        )}
      </div>
    </div>
  );
}

interface ChartTooltipIndicatorProps {
  itemConfig: ChartConfig[string] | undefined;
  hideIndicator: boolean;
  indicator: ChartIndicator;
  nestLabel: boolean;
  color: string | undefined;
}

/** The leading swatch for a tooltip row: a config icon, or the dot/line/dashed mark. */
function ChartTooltipIndicator({
  itemConfig,
  hideIndicator,
  indicator,
  nestLabel,
  color,
}: ChartTooltipIndicatorProps) {
  if (itemConfig?.icon) {
    const Icon = itemConfig.icon;
    return <Icon />;
  }
  if (hideIndicator) return null;

  return (
    <div
      className={cn(
        'nx:shrink-0 nx:rounded-[2px] nx:border-(--color-border) nx:bg-(--color-bg)',
        {
          'nx:h-2.5 nx:w-2.5': indicator === 'dot',
          'nx:w-1': indicator === 'line',
          'nx:w-0 nx:border-[1.5px] nx:border-dashed nx:bg-transparent':
            indicator === 'dashed',
          'nx:my-0.5': nestLabel && indicator === 'dashed',
        }
      )}
      style={
        {
          '--color-bg': color,
          '--color-border': color,
        } as React.CSSProperties
      }
    />
  );
}

interface ChartTooltipItemProps {
  item: RechartsPrimitive.TooltipPayloadEntry;
  indicator: ChartIndicator;
  hideIndicator: boolean;
  color?: string;
  nameKey?: string;
  nestLabel: boolean;
  /** The nested tooltip label, shown before the series name on a single line/dashed row. */
  children?: React.ReactNode;
}

/** One default tooltip row: indicator + series name + value. */
function ChartTooltipItem({
  item,
  indicator,
  hideIndicator,
  color,
  nameKey,
  nestLabel,
  children,
}: ChartTooltipItemProps) {
  const { config } = useChart();
  const key = `${nameKey || item.name || item.dataKey || 'value'}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);

  return (
    <div className={tooltipRowClassName(indicator)}>
      <ChartTooltipIndicator
        itemConfig={itemConfig}
        hideIndicator={hideIndicator}
        indicator={indicator}
        nestLabel={nestLabel}
        color={color || item.payload?.fill || item.color}
      />
      <div
        className={cn(
          'nx:flex nx:flex-1 nx:justify-between',
          nestLabel ? 'nx:items-end' : 'nx:items-center'
        )}
      >
        <div className="nx:grid nx:gap-1.5">
          {children}
          <span className="nx:text-muted-foreground">
            {itemConfig?.label || item.name}
          </span>
        </div>
        {item.value !== undefined && (
          <span className="nx:text-foreground nx:font-mono nx:font-medium nx:tabular-nums">
            {item.value.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps extends Pick<
  RechartsPrimitive.DefaultLegendContentProps,
  'payload'
> {
  className?: string;
  hideIcon?: boolean;
  verticalAlign?: 'top' | 'bottom';
  nameKey?: string;
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'nx:flex nx:items-center nx:justify-center nx:gap-2.5',
        verticalAlign === 'top' ? 'nx:pb-3' : 'nx:pt-3',
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={`${item.value}`}
            className="nx:[&>svg]:text-muted-foreground nx:flex nx:items-center nx:gap-1.5 nx:[&>svg]:size-icon-[length:var(--nx-spacing-3)] nx:icon-stroke"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="nx:size-2 nx:shrink-0 nx:rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

/** A recharts tooltip or legend payload item; the raw data row sits under `.payload`. */
type ChartPayloadItem =
  | RechartsPrimitive.TooltipPayloadEntry
  | RechartsPrimitive.LegendPayload;

/** Read `key` off an unknown object as a string, else `undefined`. */
function readKey(source: unknown, key: string): string | undefined {
  if (typeof source !== 'object' || source === null) return undefined;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Resolve a series' {@link ChartConfig} entry from a recharts payload item.
 * recharts nests the row data under `.payload`, so we probe the outer item then
 * the inner row for a string key before falling back to `key`.
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  item: ChartPayloadItem | undefined,
  key: string
) {
  if (!item) return undefined;
  const configKey = readKey(item, key) ?? readKey(item.payload, key) ?? key;
  return config[configKey] ?? config[key];
}

/** One row of chart data: a category and a value for each series. */
type ChartDatum = Record<string, string | number | null | undefined>;

type ChartCurve = 'linear' | 'natural' | 'monotone' | 'step';

function categoricalColor(index: number) {
  const series =
    CHART_CATEGORICAL_SERIES[index % CHART_CATEGORICAL_SERIES.length];
  return `var(--nx-color-chart-categorical-${series})`;
}

function sentenceCase(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

// Each series gets the next categorical color and its key as a label, under
// whatever `config` sets.
function seriesConfig(series: readonly string[], config: ChartConfig = {}) {
  const generated = Object.fromEntries(
    series.map((key, index) => [
      key,
      {
        label: sentenceCase(key),
        color: categoricalColor(index),
        ...config[key],
      },
    ])
  );
  return { ...config, ...generated };
}

interface CartesianChartProps {
  /** The rows to plot, one per category. */
  data: ChartDatum[];
  /** The key in each row that holds its category, such as `month`. */
  xKey: string;
  /** The keys in each row to plot. Each key is one series, colored in order. The palette has five colors, so a sixth series repeats the first series' color. */
  series: string[];
  /** Label, icon and color for each series, keyed by its key. Without one, a series is labelled by its key. */
  config?: ChartConfig;
  /** Shows a legend under the chart. */
  legend?: boolean;
  /** Shows a tooltip on hover. */
  tooltip?: boolean;
  /** The tooltip's mark beside each value. */
  indicator?: ChartIndicator;
  /** Draws grid lines across the values. */
  grid?: boolean;
  /** Shows the axis with each row's category. */
  categoryAxis?: boolean;
  /** Shows the axis with the value scale. */
  valueAxis?: boolean;
  className?: string;
}

type ChartFrameProps = Pick<
  CartesianChartProps,
  | 'xKey'
  | 'legend'
  | 'tooltip'
  | 'indicator'
  | 'grid'
  | 'categoryAxis'
  | 'valueAxis'
> & {
  /** Bars run left to right, so the category axis is the y-axis. */
  horizontal?: boolean;
};

// Grid, axes, tooltip and legend shared by the cartesian charts.
function ChartFrame({
  xKey,
  legend,
  tooltip,
  indicator,
  grid,
  categoryAxis,
  valueAxis,
  horizontal = false,
}: ChartFrameProps) {
  const category = { dataKey: xKey, type: 'category' as const };
  const value = { type: 'number' as const };
  return (
    <>
      {grid && (
        <RechartsPrimitive.CartesianGrid
          vertical={horizontal}
          horizontal={!horizontal}
        />
      )}
      <RechartsPrimitive.XAxis
        {...(horizontal ? value : category)}
        hide={horizontal ? !valueAxis : !categoryAxis}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
      />
      <RechartsPrimitive.YAxis
        {...(horizontal ? category : value)}
        hide={horizontal ? !categoryAxis : !valueAxis}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
      />
      {tooltip && (
        <ChartTooltip content={<ChartTooltipContent indicator={indicator} />} />
      )}
      {legend && <ChartLegend content={<ChartLegendContent />} />}
    </>
  );
}

interface BarChartProps extends CartesianChartProps {
  /** The direction the bars run. `horizontal` bars grow left to right. */
  orientation?: 'vertical' | 'horizontal';
  /** Stacks the series in one bar per category. */
  stacked?: boolean;
  /** Corner radius of each bar, in px. A stack rounds only its outer end. */
  radius?: number;
}

type BarRadius = number | [number, number, number, number];

function barRadius(
  radius: number,
  {
    stacked,
    last,
    horizontal,
  }: { stacked: boolean; last: boolean; horizontal: boolean }
): BarRadius {
  if (!stacked) return radius;
  if (!last) return 0;
  return horizontal ? [0, radius, radius, 0] : [radius, radius, 0, 0];
}

/** A bar chart of one or more series. */
function BarChart({
  data,
  xKey,
  series,
  config,
  orientation = 'vertical',
  stacked = false,
  radius = 4,
  legend = true,
  tooltip = true,
  indicator = 'dashed',
  grid = true,
  categoryAxis = true,
  valueAxis = false,
  className,
}: BarChartProps) {
  const horizontal = orientation === 'horizontal';
  const colors = seriesConfig(series, config);
  return (
    <ChartContainer config={colors} className={className}>
      <RechartsPrimitive.BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
      >
        <ChartFrame
          xKey={xKey}
          legend={legend}
          tooltip={tooltip}
          indicator={indicator}
          grid={grid}
          categoryAxis={categoryAxis}
          valueAxis={valueAxis}
          horizontal={horizontal}
        />
        {series.map((key, index) => (
          <RechartsPrimitive.Bar
            key={key}
            dataKey={key}
            fill={colors[key]?.color}
            stackId={stacked ? 'stack' : undefined}
            radius={barRadius(radius, {
              stacked,
              last: index === series.length - 1,
              horizontal,
            })}
          />
        ))}
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  );
}

interface LineChartProps extends CartesianChartProps {
  /** How each line joins its points. */
  curve?: ChartCurve;
  /** Marks each data point with a dot. */
  dots?: boolean;
}

/** A line chart of one or more series. */
function LineChart({
  data,
  xKey,
  series,
  config,
  curve = 'natural',
  dots = false,
  legend = true,
  tooltip = true,
  indicator = 'line',
  grid = true,
  categoryAxis = true,
  valueAxis = false,
  className,
}: LineChartProps) {
  const colors = seriesConfig(series, config);
  return (
    <ChartContainer config={colors} className={className}>
      <RechartsPrimitive.LineChart data={data} margin={{ left: 12, right: 12 }}>
        <ChartFrame
          xKey={xKey}
          legend={legend}
          tooltip={tooltip}
          indicator={indicator}
          grid={grid}
          categoryAxis={categoryAxis}
          valueAxis={valueAxis}
        />
        {series.map((key) => (
          <RechartsPrimitive.Line
            key={key}
            dataKey={key}
            type={curve}
            stroke={colors[key]?.color}
            strokeWidth={2}
            dot={dots}
          />
        ))}
      </RechartsPrimitive.LineChart>
    </ChartContainer>
  );
}

interface AreaChartProps extends CartesianChartProps {
  /** How each area's edge joins its points. */
  curve?: ChartCurve;
  /** Stacks the series on top of each other. */
  stacked?: boolean;
  /** `gradient` fades each area toward the axis. */
  fill?: 'solid' | 'gradient';
}

/** An area chart of one or more series. */
function AreaChart({
  data,
  xKey,
  series,
  config,
  curve = 'natural',
  stacked = false,
  fill = 'solid',
  legend = true,
  tooltip = true,
  indicator = 'dot',
  grid = true,
  categoryAxis = true,
  valueAxis = false,
  className,
}: AreaChartProps) {
  const gradientId = React.useId().replace(/:/g, '');
  const colors = seriesConfig(series, config);
  const areaFill = (key: string, index: number) =>
    fill === 'gradient' ? `url(#${gradientId}-${index})` : colors[key]?.color;
  return (
    <ChartContainer config={colors} className={className}>
      <RechartsPrimitive.AreaChart data={data} margin={{ left: 12, right: 12 }}>
        {fill === 'gradient' && (
          <defs>
            {series.map((key, index) => (
              <linearGradient
                key={key}
                id={`${gradientId}-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={colors[key]?.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colors[key]?.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
        )}
        <ChartFrame
          xKey={xKey}
          legend={legend}
          tooltip={tooltip}
          indicator={indicator}
          grid={grid}
          categoryAxis={categoryAxis}
          valueAxis={valueAxis}
        />
        {series.map((key, index) => (
          <RechartsPrimitive.Area
            key={key}
            dataKey={key}
            type={curve}
            stackId={stacked ? 'stack' : undefined}
            fill={areaFill(key, index)}
            fillOpacity={fill === 'gradient' ? 1 : 0.4}
            stroke={colors[key]?.color}
          />
        ))}
      </RechartsPrimitive.AreaChart>
    </ChartContainer>
  );
}

interface PieChartProps {
  /** The slices to plot, one row each. The palette has five colors, so a sixth slice repeats the first slice's color. */
  data: ChartDatum[];
  /** The key in each row that holds the slice's name, such as `browser`. */
  nameKey: string;
  /** The key in each row that holds the slice's value. */
  valueKey: string;
  /** Label, icon and color for each slice, keyed by its name. Without one, a slice is labelled by its name. */
  config?: ChartConfig;
  /** Cuts out the middle, so the pie becomes a ring. */
  donut?: boolean;
  /** Writes each slice's value beside it. */
  labels?: boolean;
  /** Shows a legend under the chart. */
  legend?: boolean;
  /** Shows a tooltip on hover. */
  tooltip?: boolean;
  className?: string;
}

function sliceTotal(data: readonly ChartDatum[], valueKey: string) {
  return data.reduce((sum, row) => {
    const value = row[valueKey];
    return typeof value === 'number' && value > 0 ? sum + value : sum;
  }, 0);
}

/** A pie or donut chart of one series, a slice per row. */
function PieChart({
  data,
  nameKey,
  valueKey,
  config,
  donut = false,
  labels = false,
  legend = true,
  tooltip = true,
  className,
}: PieChartProps) {
  const names = data.map((row) => String(row[nameKey]));
  const colors = Object.fromEntries(
    names.map((name, index) => [
      name,
      { label: name, color: categoricalColor(index), ...config?.[name] },
    ])
  );
  const slices = data.map((row, index) => ({
    ...row,
    fill: colors[names[index] ?? '']?.color,
  }));
  const innerRadius = donut ? '60%' : 0;

  // An empty or all-zero pie draws an empty ring, not a blank chart.
  if (sliceTotal(data, valueKey) === 0) {
    return (
      <ChartContainer config={colors} className={className}>
        <RechartsPrimitive.PieChart>
          <RechartsPrimitive.Pie
            data={[{ value: 1, fill: 'var(--nx-color-muted)' }]}
            dataKey="value"
            innerRadius={innerRadius}
            isAnimationActive={false}
          />
        </RechartsPrimitive.PieChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={colors} className={className}>
      <RechartsPrimitive.PieChart>
        {tooltip && (
          <ChartTooltip
            content={<ChartTooltipContent nameKey={nameKey} hideLabel />}
          />
        )}
        <RechartsPrimitive.Pie
          data={slices}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={innerRadius}
          label={labels}
        />
        {legend && (
          <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />
        )}
      </RechartsPrimitive.PieChart>
    </ChartContainer>
  );
}

export {
  AreaChart,
  type AreaChartProps,
  BarChart,
  type BarChartProps,
  ChartContainer,
  type ChartDatum,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  LineChart,
  type LineChartProps,
  PieChart,
  type PieChartProps,
  useChart,
};
