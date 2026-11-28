import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import markerMeta, {
  ClickInteraction,
  Disabled,
  WithDataAttributes,
} from './Marker.stories';

import type { MarkerProps } from '.';

const meta = {
  ...markerMeta,
  title: 'Tests/Marker',
};

export default meta;
type Story = StoryObj<typeof markerMeta>;
type RevertStory = StoryObj<MarkerProps & { onRevert: () => void }>;

export const DisabledStyle: RevertStory = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const enabled = canvas.getByRole('button', { name: 'Revert this change' });
    const disabled = canvas.getByRole('button', { name: 'Delete this draft' });
    const link = canvas.getByRole('link', { name: 'View the pull request' });

    const enabledColor = getComputedStyle(enabled).color;

    await expect(disabled).toHaveStyle({ pointerEvents: 'none' });
    await expect(disabled).not.toHaveStyle({ color: enabledColor });

    // An `a` ignores native `disabled`, so the row's inertness rests entirely
    // on the aria-disabled pair.
    await expect(link).toHaveStyle({ pointerEvents: 'none' });
    await expect(link).not.toHaveStyle({ color: enabledColor });
  },
};

export const ClickInteractionStyle: RevertStory = {
  ...ClickInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Revert this change' });

    // A bare <button> has no UA pointer cursor, so this is the row's own
    // `:is(button)` rule — WithDataAttributesStyle proves the negative case.
    await expect(button).toHaveStyle({ cursor: 'pointer' });
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const marker = canvasElement.querySelector('[data-slot="marker"]');

    // The cursor rule rides the same static cva string as everywhere else, so
    // a non-interactive row proves the `:is(button)` scoping actually bites.
    await expect(marker).not.toHaveStyle({ cursor: 'pointer' });
  },
};
