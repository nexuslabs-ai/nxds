import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import type { Avatar } from './avatar';
import avatarMeta, {
  CroppedImage,
  OnContainerSurface,
  WithDataAttributes,
} from './Avatar.stories';

const meta: Meta<typeof Avatar> = {
  ...avatarMeta,
  title: 'Tests/Avatar',
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const CroppedImageStyle: Story = {
  ...CroppedImage,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Wide portrait crop');

    await expect(getComputedStyle(image).objectFit).toBe('cover');
  },
};

export const OnContainerSurfaceStyle: Story = {
  ...OnContainerSurface,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card');
    const styleOf = (element: Element) => window.getComputedStyle(element);

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    const surface = styleOf(card).backgroundColor;
    // Only a surface that differs from `background` can catch a ring that
    // fell back to `background`.
    await expect(surface).not.toBe(
      styleOf(canvas.getByTestId('page')).backgroundColor
    );

    const rings = card.querySelectorAll<HTMLElement>(
      '[data-slot="avatar"]:not([data-ring]), [data-slot="avatar-status"]'
    );
    await expect(rings.length).toBeGreaterThan(0);
    for (const ring of rings) {
      await expect(styleOf(ring).getPropertyValue('--tw-ring-color')).toBe(
        surface
      );
    }

    await expect(
      styleOf(canvas.getByTestId('ring-avatar')).getPropertyValue(
        '--tw-ring-offset-color'
      )
    ).toBe(surface);
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultAvatar = canvas.getByRole('img', { name: 'Default avatar' });

    // Initials scale with the avatar diameter, so md renders at the base size.
    await expect(defaultAvatar).toHaveStyle({
      fontSize: getComputedStyle(document.documentElement)
        .getPropertyValue('--nx-typography-size-base')
        .trim(),
    });
  },
};
