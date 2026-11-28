import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { Breadcrumb } from './breadcrumb';
import breadcrumbMeta, { IconOnly } from './Breadcrumb.stories';

const meta: Meta<typeof Breadcrumb> = {
  ...breadcrumbMeta,
  title: 'Tests/Breadcrumb',
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const IconOnlyStyle: Story = {
  ...IconOnly,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Settings')).toHaveClass('nx:sr-only');
  },
};
