import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import paginationMeta, { IconOnly } from './Pagination.stories';

const meta = {
  ...paginationMeta,
  title: 'Tests/Pagination',
};

export default meta;
type Story = StoryObj<typeof paginationMeta>;

export const IconOnlySquare: Story = {
  ...IconOnly,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { name, label } of [
      { name: 'Go to previous page', label: 'Previous' },
      { name: 'Go to next page', label: 'Next' },
    ]) {
      const link = canvas.getByRole('link', { name });
      const { width, height } = link.getBoundingClientRect();
      await expect(width).toBe(height);
      await expect(within(link).getByText(label)).toHaveClass('nx:sr-only');
    }
  },
};
