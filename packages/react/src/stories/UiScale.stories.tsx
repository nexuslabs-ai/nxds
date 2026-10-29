import { DENSITY_OPTIONS, UI_SCALE_OPTIONS } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { IconSearch } from '@tabler/icons-react';
import { expect, within } from 'storybook/test';

import { Badge } from '../components/badge/badge';
import { Button } from '../components/button/button';
import { Checkbox } from '../components/checkbox/checkbox';
import { Input } from '../components/input/input';
import { Kbd } from '../components/kbd/kbd';
import {
  RadioGroup,
  RadioGroupItem,
} from '../components/radio-group/radio-group';
import { Switch } from '../components/switch/switch';
import { Toggle } from '../components/toggle/toggle';

const SCALES = UI_SCALE_OPTIONS.map(({ value }) => value);
const DENSITIES = DENSITY_OPTIONS.map(({ value }) => value);

/** How far a ratio may move from its Default-scale value. */
const PROPORTION_TOLERANCE = 0.15;

function Row({ scale, density }: { scale: string; density: string }) {
  const name = `${scale}, ${density}`;
  return (
    <div
      data-ui-scale={scale}
      data-density={density}
      data-testid={`row-${scale}-${density}`}
      className="nx:flex nx:flex-wrap nx:items-center nx:gap-3 nx:bg-background nx:py-2 nx:text-foreground"
    >
      <span className="nx:w-36 nx:typography-label-small nx:text-muted-foreground">
        {scale} · {density}
      </span>
      <Button variant="outline">
        <IconSearch aria-hidden />
        Search
      </Button>
      <Input aria-label={`Name, ${name}`} className="nx:w-32" />
      <Toggle variant="outline">Bold</Toggle>
      <Badge isCaps={false}>New</Badge>
      <Kbd>Ctrl</Kbd>
      <Checkbox defaultChecked aria-label={`Accept, ${name}`} />
      <RadioGroup defaultValue="team" aria-label={`Plan, ${name}`}>
        <RadioGroupItem value="team" aria-label={`Team, ${name}`} />
      </RadioGroup>
      <Switch defaultChecked aria-label={`Alerts, ${name}`} />
    </div>
  );
}

function Matrix() {
  return (
    <div className="nx:flex nx:flex-col nx:p-6">
      {SCALES.map((scale) =>
        DENSITIES.map((density) => (
          <Row key={`${scale}-${density}`} scale={scale} density={density} />
        ))
      )}
    </div>
  );
}

const box = (element: Element) => element.getBoundingClientRect();
const style = (element: Element) => getComputedStyle(element);
const lineHeight = (element: Element) => parseFloat(style(element).lineHeight);

/** The height inside the border and padding, with fractions kept. */
function contentHeight(element: Element) {
  const { borderTopWidth, borderBottomWidth, paddingTop, paddingBottom } =
    style(element);
  return [borderTopWidth, borderBottomWidth, paddingTop, paddingBottom].reduce(
    (height, edge) => height - parseFloat(edge),
    box(element).height
  );
}

/** Checks that `part` stays inside the border of `control`. */
async function expectInsideBorder(part: Element, control: HTMLElement) {
  const mark = box(part);
  const outer = box(control);
  const top = outer.top + control.clientTop;
  const left = outer.left + control.clientLeft;
  await expect(mark.top).toBeGreaterThanOrEqual(top);
  await expect(mark.bottom).toBeLessThanOrEqual(top + control.clientHeight);
  await expect(mark.left).toBeGreaterThanOrEqual(left);
  await expect(mark.right).toBeLessThanOrEqual(left + control.clientWidth);
}

function rowParts(canvasElement: HTMLElement, scale: string, density: string) {
  const row = within(
    within(canvasElement).getByTestId(`row-${scale}-${density}`)
  );
  const button = row.getByRole('button', { name: 'Search' });
  return {
    button,
    icon: button.querySelector('svg')!,
    input: row.getByRole('textbox'),
    toggle: row.getByRole('button', { name: 'Bold' }),
    badge: row.getByText('New'),
    kbd: row.getByText('Ctrl'),
    checkbox: row.getByRole('checkbox'),
    radio: row.getByRole('radio'),
    switchControl: row.getByRole('switch'),
  };
}

/** The ratios a UI scale must keep: control to text, icon to text, box to text. */
function ratios(parts: ReturnType<typeof rowParts>) {
  const text = lineHeight(parts.button);
  return {
    'Button height to its text': box(parts.button).height / text,
    'Icon to its text size':
      box(parts.icon).width / parseFloat(style(parts.button).fontSize),
    'Checkbox to the text beside it': box(parts.checkbox).width / text,
    'Switch to the text beside it': box(parts.switchControl).height / text,
  };
}

const meta = {
  title: 'Tokens/UI Scale',
  component: Matrix,
  tags: ['!autodocs'],
  // The rows set their own scale, so the page stays at Default.
  globals: { uiScale: 'default' },
  parameters: {
    docs: {
      description: {
        component:
          'Every part at every UI scale and density. The UI scale grows text, icons, spacing and corners together. Density changes only spacing.',
      },
    },
  },
} satisfies Meta<typeof Matrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProportionAtEveryScaleAndDensity: Story = {
  play: async ({ canvasElement }) => {
    await canvasElement.ownerDocument.fonts.ready;
    for (const density of DENSITIES) {
      const reference = ratios(rowParts(canvasElement, 'default', density));
      let previousHeight = 0;
      for (const scale of SCALES) {
        const parts = rowParts(canvasElement, scale, density);
        const label = `${scale} × ${density}`;

        // Each text line fits inside its control.
        for (const element of [
          parts.button,
          parts.input,
          parts.toggle,
          parts.badge,
          parts.kbd,
        ]) {
          await expect(contentHeight(element), label).toBeGreaterThanOrEqual(
            lineHeight(element)
          );
        }

        // Each mark stays inside its control.
        await expectInsideBorder(parts.icon, parts.button);
        await expectInsideBorder(
          parts.checkbox.querySelector('[data-slot="checkbox-check"]')!,
          parts.checkbox
        );
        await expectInsideBorder(
          parts.radio.querySelector('[data-slot="radio-group-dot"]')!,
          parts.radio
        );
        await expectInsideBorder(
          parts.switchControl.querySelector('[data-slot="switch-thumb"]')!,
          parts.switchControl
        );

        // The parts keep their proportions to the text.
        for (const [ratio, value] of Object.entries(ratios(parts))) {
          const base = reference[ratio as keyof typeof reference];
          await expect(
            Math.abs(value / base - 1),
            `${label}: ${ratio}`
          ).toBeLessThanOrEqual(PROPORTION_TOLERANCE);
        }

        // Each scale is larger than the one before it.
        const height = box(parts.button).height;
        await expect(height, label).toBeGreaterThan(previousHeight);
        previousHeight = height;
      }
    }
  },
};
