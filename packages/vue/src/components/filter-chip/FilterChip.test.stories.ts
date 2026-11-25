import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import filterChipMeta, { LongLabel } from './FilterChip.stories';

const meta = {
  ...filterChipMeta,
  title: 'Tests/FilterChip',
};

export default meta;
type Story = StoryObj<typeof filterChipMeta>;

export const LongLabelGeometry: Story = {
  ...LongLabel,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Remove owner filter: InternationalCustomerExperienceOperations',
    });
    await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(
      button.parentElement!.getBoundingClientRect().width
    );
  },
};
