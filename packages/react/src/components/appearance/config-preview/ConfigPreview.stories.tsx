import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { NxdsAppearanceConfigPreview } from './config-preview';

const meta: Meta<typeof NxdsAppearanceConfigPreview> = {
  title: 'Appearance/ConfigPreview',
  component: NxdsAppearanceConfigPreview,
  parameters: {
    docs: {
      description: {
        component:
          'NxdsAppearanceConfigPreview prints an appearance state as a code object. Use it to show the values a settings panel produces.',
      },
    },
  },
  args: {
    state: {
      ...DEFAULT_NXDS_APPEARANCE,
      lightContrast: 37,
      darkContrast: 82,
    },
    resolvedMode: 'light',
  },
};

export default meta;
type Story = StoryObj<typeof NxdsAppearanceConfigPreview>;

export const Default: Story = {};

export const OwnColors: Story = {
  args: { deriveColors: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('mode: "light",')).toBeVisible();
    await expect(canvas.getByText('density: "default",')).toBeVisible();
    await expect(canvas.queryByText(/brandColor:/)).toBeNull();
    await expect(canvas.queryByText(/surfaceTone:/)).toBeNull();
    await expect(canvas.queryByText(/Contrast:/)).toBeNull();
  },
};
