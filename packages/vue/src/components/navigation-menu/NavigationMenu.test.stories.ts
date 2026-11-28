import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectInterruptibleOverlayMotion } from '../../stories/support/overlay-motion-test-utils';

import navigationMenuMeta, {
  Disabled,
  OpenCloseInteraction,
  WithDataAttributes,
} from './NavigationMenu.stories';

const meta = {
  ...navigationMenuMeta,
  title: 'Tests/NavigationMenu',
};

export default meta;
type Story = StoryObj<typeof navigationMenuMeta>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/i });

    // Disabled trigger uses a semantic text token at full opacity (not a fade).
    await expect(trigger).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(trigger).opacity).toBe('1');
  },
};

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/i });

    await userEvent.click(trigger);
    await canvas.findByRole('link', { name: 'Analytics' });
    await expectInterruptibleOverlayMotion(
      canvasElement.querySelector('[data-slot="navigation-menu-viewport"]')
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('data-state', 'closed')
    );
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/i });

    // #470: trigger reuses navigationMenuTriggerStyle -> typography-label-default.
    await expect(trigger).toHaveClass('nx:typography-label-default');

    await userEvent.click(trigger);
    await canvas.findByRole('link', { name: 'Analytics' });

    // #470: flyout link migrated from the raw named text-size utility.
    await expect(
      canvasElement.querySelector('[data-slot="navigation-menu-link"]')
    ).toHaveClass('nx:typography-body-default');

    await userEvent.keyboard('{Escape}');
  },
};
