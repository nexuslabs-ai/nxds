import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta = {
  title: 'Tokens/Nested corners',
  parameters: {
    docs: {
      description: {
        component:
          'A container sets nest-outer-*, nest-border-* and nest-padding-*. Its items use rounded-nest; the corners that touch the container corners add rounded-{side}-nest-corner. Corner = outer − border − padding, at least half the outer radius, in whole pixels.',
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

function corners(element: HTMLElement) {
  const style = getComputedStyle(element);
  return [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ];
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
    const at = (id: string) => corners(canvas.getByTestId(id));

    await expect(at('mode-12-first')).toEqual(['7px', '6px', '6px', '7px']);
    await expect(at('mode-12-middle')).toEqual(['6px', '6px', '6px', '6px']);
    await expect(at('mode-12-last')).toEqual(['6px', '7px', '7px', '6px']);
    await expect(at('mode-4-first')).toEqual(['2px', '2px', '2px', '2px']);
    await expect(at('mode-4-last')).toEqual(['2px', '2px', '2px', '2px']);
    await expect(at('fine-stroke-first')).toEqual(['8px', '6px', '6px', '8px']);
    await expect(at('outside')).toEqual(['6px', '6px', '6px', '6px']);
  },
};
