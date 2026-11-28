import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import breadcrumbMeta, { IconOnly } from './Breadcrumb.stories';

const meta = {
  ...breadcrumbMeta,
  title: 'Tests/Breadcrumb',
};

export default meta;
type Story = StoryObj<typeof breadcrumbMeta>;

export const IconOnlyStyle: Story = {
  ...IconOnly,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Settings')).toHaveClass('nx:sr-only');
  },
};
