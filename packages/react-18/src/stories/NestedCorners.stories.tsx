import type { Meta, StoryObj } from '@storybook/react';
import { within } from 'storybook/test';

import { expectCorners } from './support/corner-test-utils';

const meta = {
  title: 'Tokens/Nested corners',
  parameters: {
    docs: {
      description: {
        component:
          "A container sets `nest-outer-*`, `nest-border-*` and `nest-padding-*`. Its items use `rounded-nest`. The corners that touch the container's corners add `rounded-{side}-nest-corner`. A list whose items can sit in groups uses `nest-edges-y` or `nest-edges-x`, and its items use `rounded-nest-edges`. The corner is the outer radius minus the border and padding, at least half the outer radius, in whole pixels.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const item = 'nx:h-8 nx:w-12 nx:bg-muted nx:rounded-nest';

function Row({ name }: { name: string }) {
  return (
    <div className="nx:flex nx:w-fit nx:gap-1 nx:rounded-md nx:border-default nx:border-border-default nx:p-1 nx:nest-outer-md nx:nest-border-default nx:nest-padding-1">
      <div
        data-testid={`${name}-first`}
        className={`${item} nx:rounded-s-nest-corner`}
      />
      <div data-testid={`${name}-middle`} className={item} />
      <div
        data-testid={`${name}-last`}
        className={`${item} nx:rounded-e-nest-corner`}
      />
    </div>
  );
}

export const FormulaAndMinimum: Story = {
  render: () => (
    <div className="nx:grid nx:gap-4">
      <div data-radius="12">
        <Row name="mode-12" />
      </div>
      <div data-radius="4">
        <Row name="mode-4" />
      </div>
      <div data-radius="12" data-borderwidth="fine">
        <Row name="fine-stroke" />
      </div>
      <div data-radius="12">
        <div data-testid="outside" className={item} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCorners(canvas.getByTestId('mode-12-first'), [
      '7px',
      '6px',
      '6px',
      '7px',
    ]);
    await expectCorners(canvas.getByTestId('mode-12-middle'), [
      '6px',
      '6px',
      '6px',
      '6px',
    ]);
    await expectCorners(canvas.getByTestId('mode-12-last'), [
      '6px',
      '7px',
      '7px',
      '6px',
    ]);
    await expectCorners(canvas.getByTestId('mode-4-first'), [
      '2px',
      '2px',
      '2px',
      '2px',
    ]);
    await expectCorners(canvas.getByTestId('mode-4-last'), [
      '2px',
      '2px',
      '2px',
      '2px',
    ]);
    await expectCorners(canvas.getByTestId('fine-stroke-first'), [
      '8px',
      '6px',
      '6px',
      '8px',
    ]);
    await expectCorners(canvas.getByTestId('outside'), [
      '6px',
      '6px',
      '6px',
      '6px',
    ]);
  },
};
