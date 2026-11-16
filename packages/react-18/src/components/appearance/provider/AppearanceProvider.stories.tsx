import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../../button/button';

import { NxdsAppearanceProvider, useNxdsAppearance } from './provider';

function ModeControls() {
  const { resolvedMode, setState } = useNxdsAppearance();

  return (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <Button
        variant="outline"
        onClick={() => setState((previous) => ({ ...previous, mode: 'dark' }))}
      >
        Dark
      </Button>
      <p className="nx:m-0">Resolved mode: {resolvedMode}</p>
    </div>
  );
}

const meta: Meta<typeof NxdsAppearanceProvider> = {
  title: 'Appearance/Provider',
  component: NxdsAppearanceProvider,
};

export default meta;
type Story = StoryObj<typeof meta>;

const themeCss = () =>
  document.querySelector('style[data-nxds-appearance-theme]')?.textContent;

// The story's provider sits inside the preview's. It writes to the page when
// its own appearance changes, so the play asserts after the mode switch.
export const OwnColors: Story = {
  args: {
    storageKey: false,
    deriveColors: false,
    children: <ModeControls />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;

    await userEvent.click(canvas.getByRole('button', { name: 'Dark' }));
    await waitFor(() => expect(root).toHaveClass('dark'));
    await expect(canvas.getByText('Resolved mode: dark')).toBeVisible();
    await expect(root).toHaveAttribute('data-density', 'default');
    await expect(themeCss()).toBe('');
  },
};
