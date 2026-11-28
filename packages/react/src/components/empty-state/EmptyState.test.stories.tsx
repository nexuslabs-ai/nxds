import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { EmptyState } from './empty-state';
import emptyStateMeta, {
  Bordered,
  LongCopyWithLink,
} from './EmptyState.stories';

const meta: Meta<typeof EmptyState> = {
  ...emptyStateMeta,
  title: 'Tests/EmptyState',
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const LongCopyWithLinkStyle: Story = {
  ...LongCopyWithLink,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /learn more/i });

    // underline-offset-4 is unique to the hook — no anchor defaults to 4px.
    await expect(link).toHaveStyle({ textUnderlineOffset: '4px' });
  },
};

export const BorderedStyle: Story = {
  ...Bordered,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="empty-state"]');
    await expect(root).toHaveStyle({ borderStyle: 'dashed' });
  },
};
