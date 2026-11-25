import type { StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import filterConditionMeta, { LongContent } from './FilterCondition.stories';

const meta = {
  ...filterConditionMeta,
  title: 'Tests/FilterCondition',
};

export default meta;
type Story = StoryObj<typeof filterConditionMeta>;

export const LongContentFits: Story = {
  ...LongContent,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: `Edit Workspace value: ${args.value}`,
    });
    await expect(trigger.scrollWidth).toBeLessThanOrEqual(
      trigger.clientWidth + 1
    );
    const condition = canvas.getByTestId('condition');
    await expect(condition.scrollWidth).toBeLessThanOrEqual(
      condition.clientWidth + 1
    );
  },
};
