import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import attachmentMeta, {
  GroupKeyboardInteraction,
  LongFileName,
} from './Attachment.stories';

const meta = {
  ...attachmentMeta,
  title: 'Tests/Attachment',
};

export default meta;
type Story = StoryObj<typeof attachmentMeta>;

const LONG_NAME = 'quarterly-financial-report-with-appendices-final-v12.pdf';

export const GroupKeyboardInteractionGeometry: Story = {
  ...GroupKeyboardInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Attached files' });

    // A tab stop that cannot scroll would make the focus pointless.
    await expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
  },
};

export const LongFileNameGeometry: Story = {
  ...LongFileName,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText(LONG_NAME);

    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  },
};
