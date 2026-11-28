import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { ButtonGroup } from './button-group';
import buttonGroupMeta, {
  IconOnlyInSmallGroup,
  TierAPolishEvidence,
  WithSelectTrigger,
} from './ButtonGroup.stories';

const meta: Meta<typeof ButtonGroup> = {
  ...buttonGroupMeta,
  title: 'Tests/ButtonGroup',
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// An icon-only member stays square at the group's size.
export const IconOnlyInSmallGroupSize: Story = {
  ...IconOnlyInSmallGroup,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByRole('button', { name: 'Copy link' });
    const icon = canvas.getByRole('button', { name: 'More share options' });
    const { width, height } = icon.getBoundingClientRect();

    // `sm` is 32px high.
    await expect(height).toBe(32);
    await expect(width).toBe(height);
    await expect(text.getBoundingClientRect().height).toBe(height);
  },
};

export const WithSelectTriggerStyle: Story = {
  ...WithSelectTrigger,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]'
    )!;
    // The trigger joins the seam like a button: its left border is removed so
    // it doesn't double up against the previous control.
    await expect(getComputedStyle(trigger).borderLeftWidth).toBe('0px');
  },
};

export const TierAPolishEvidenceStyle: Story = {
  ...TierAPolishEvidence,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Docs' });

    await expect(link).toHaveClass('nx:transition-control');
    await expect(link).toHaveClass('nx:duration-fast');
    await expect(link).toHaveClass('nx:focus-visible:outline-2');
    await expect(link).toHaveClass('nx:hover:bg-container-hover');
    await expect(link).toHaveClass('nx:active:bg-container-active');
  },
};
