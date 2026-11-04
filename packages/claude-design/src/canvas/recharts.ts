// The Recharts parts a canvas composes a custom chart from, each with the
// props its panel lists. A canvas sets the rest of Recharts' many props only
// through `dc-props`. `Nxds.Recharts` still exports every Recharts part.
// `label:boolean` gives a prop that takes several types, or a generic one,
// the one type a canvas sets: Pie's `label` shows the values,
// ReferenceLine's names the line, and every `dataKey` is a key's name.

const SERIES = ['dataKey:string', 'name:string', 'hide', 'isAnimationActive'];
const STROKE = ['stroke', 'strokeWidth', 'strokeDasharray:string', 'opacity'];
const FILL = ['fill', 'fillOpacity', ...STROKE];
const CARTESIAN_CHART = [
  'data',
  'layout',
  'stackOffset',
  'barCategoryGap',
  'barGap',
  'accessibilityLayer',
];
const POLAR_CHART = [
  'data',
  'innerRadius',
  'outerRadius',
  'startAngle',
  'endAngle',
  'accessibilityLayer',
];
const AXIS = [
  'dataKey:string',
  'type',
  'hide',
  'tickLine',
  'axisLine',
  'tickMargin',
  'orientation',
  'unit',
  'allowDecimals',
  'reversed',
  'mirror',
];

export const RECHARTS_PARTS: Readonly<Record<string, readonly string[]>> = {
  BarChart: CARTESIAN_CHART,
  LineChart: CARTESIAN_CHART,
  AreaChart: CARTESIAN_CHART,
  ComposedChart: CARTESIAN_CHART,
  PieChart: ['accessibilityLayer'],
  RadarChart: POLAR_CHART,
  RadialBarChart: [...POLAR_CHART, 'barSize'],
  Bar: [
    ...SERIES,
    ...FILL,
    'stackId:string',
    'radius',
    'barSize',
    'maxBarSize',
  ],
  Line: [...SERIES, 'type', ...STROKE, 'dot:boolean', 'connectNulls'],
  Area: [
    ...SERIES,
    'type',
    ...FILL,
    'stackId:string',
    'dot:boolean',
    'connectNulls',
  ],
  Pie: [
    'data',
    'dataKey:string',
    'nameKey:string',
    'innerRadius',
    'outerRadius',
    'paddingAngle',
    'cornerRadius',
    'startAngle',
    'endAngle',
    'label:boolean',
    'labelLine:boolean',
    ...FILL,
    'isAnimationActive',
  ],
  Radar: [...SERIES, ...FILL, 'dot:boolean'],
  RadialBar: [...SERIES, 'background:boolean', 'cornerRadius', ...FILL],
  Cell: FILL,
  XAxis: AXIS,
  YAxis: [...AXIS, 'width'],
  CartesianGrid: ['vertical', 'horizontal', ...STROKE],
  PolarGrid: ['gridType', 'radialLines', ...STROKE],
  PolarAngleAxis: ['dataKey:string', 'tickLine', 'axisLine'],
  PolarRadiusAxis: ['angle', 'hide', 'tickLine', 'axisLine'],
  ReferenceLine: ['x:string', 'y:string', ...STROKE, 'label:string'],
  ReferenceArea: ['x1:string', 'x2:string', 'y1:string', 'y2:string', ...FILL],
  LabelList: ['dataKey:string', 'position', 'offset', 'fill'],
  Label: ['value', 'position', 'offset'],
};
