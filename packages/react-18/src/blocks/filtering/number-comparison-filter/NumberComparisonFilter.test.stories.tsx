import type { StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import numberComparisonFilterMeta, {
  NarrowContainer,
} from './NumberComparisonFilter.stories';

const meta = {
  ...numberComparisonFilterMeta,
  title: 'Tests/NumberComparisonFilter',
};

export default meta;
type Story = StoryObj<typeof numberComparisonFilterMeta>;

export const NarrowContainerFits: Story = {
  ...NarrowContainer,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = canvas.getByRole('button', { name: /^Edit Amount:/ });
    const remove = canvas.getByRole('button', { name: 'Remove Amount filter' });
    const root = value.closest('[data-slot="filter-condition"]')!;
    const bounds = root.getBoundingClientRect();
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    for (const button of [value, remove]) {
      await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
        bounds.right + 1
      );
    }
  },
};
