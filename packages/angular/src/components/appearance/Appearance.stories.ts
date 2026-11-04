import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { DEFAULT_NXDS_APPEARANCE, type NxdsAppearanceState } from '@nxds/core';
import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { NxButton } from '../button/button';

import { NxdsAppearance, provideNxdsAppearance } from '.';

@Component({
  selector: 'nx-appearance-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxButton],
  template: `
    <div class="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <div class="nx:flex nx:gap-2">
        <button nxButton variant="outline" (click)="update({ mode: 'dark' })">
          Dark
        </button>
        <button
          nxButton
          variant="outline"
          (click)="update({ brandColor: '#2563eb' })"
        >
          Blue brand
        </button>
        <button
          nxButton
          variant="outline"
          (click)="update({ corners: 'round' })"
        >
          Round corners
        </button>
        <button nxButton variant="outline" (click)="appearance.reset()">
          Reset
        </button>
      </div>
      <p class="nx:m-0">Resolved mode: {{ appearance.resolvedMode() }}</p>
    </div>
  `,
})
class AppearanceControls {
  protected readonly appearance = inject(NxdsAppearance);

  protected update(patch: Partial<NxdsAppearanceState>) {
    this.appearance.setState((previous) => ({ ...previous, ...patch }));
  }
}

// The story renders in the preview's app, so this is the preview's appearance.
// Destroying the second app removes it from the document, so the play re-applies it.
let previewAppearance: NxdsAppearance | undefined;

@Component({
  selector: 'nx-controlled-app-host',
  template: '<div data-testid="controlled-app"></div>',
})
class ControlledAppHost {
  constructor() {
    previewAppearance = inject(NxdsAppearance);
  }
}

const meta: Meta = {
  title: 'Appearance/Provider',
  decorators: [
    moduleMetadata({ imports: [AppearanceControls, ControlledAppHost] }),
  ],
  render: () => ({ template: '<nx-appearance-controls />' }),
};

export default meta;
type Story = StoryObj;

const themeCss = () =>
  document.querySelector('style[data-nxds-appearance-theme]')?.textContent;

export const AppliesThemeToPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;

    await expect(root).not.toHaveClass('dark');
    await waitFor(() => expect(themeCss()).toBeTruthy());

    await userEvent.click(canvas.getByRole('button', { name: 'Dark' }));
    await waitFor(() => expect(root).toHaveClass('dark'));
    await expect(canvas.getByText('Resolved mode: dark')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Round corners' })
    );
    await waitFor(() => expect(root).toHaveAttribute('data-radius', 'round'));

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(root).not.toHaveClass('dark'));
  },
};

export const BrandColorRederivesTheme: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(themeCss()).toBeTruthy());
    const before = themeCss();

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Blue brand' })
    );
    await waitFor(() => expect(themeCss()).not.toBe(before));
    await expect(
      document.querySelectorAll('style[data-nxds-appearance-theme]')
    ).toHaveLength(1);
  },
};

const CONTROLLED_STORAGE_KEY = 'nxds-appearance-controlled-story';

export const ControlledState: Story = {
  render: () => ({ template: '<nx-controlled-app-host />' }),
  play: async ({ canvasElement }) => {
    const preview = previewAppearance;
    if (!preview) {
      throw new Error(
        'ControlledState render did not capture the preview appearance.'
      );
    }
    const host = within(canvasElement).getByTestId('controlled-app');
    const state = signal<NxdsAppearanceState>(DEFAULT_NXDS_APPEARANCE);
    const onStateChange = fn();
    const app = await createApplication({
      providers: [
        provideNxdsAppearance({
          storageKey: CONTROLLED_STORAGE_KEY,
          state,
          onStateChange,
        }),
      ],
    });
    app.bootstrap(AppearanceControls, host);
    const controls = within(host);

    try {
      await userEvent.click(
        await controls.findByRole('button', { name: 'Dark' })
      );
      await expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'dark' })
      );
      await expect(controls.getByText('Resolved mode: light')).toBeVisible();
      await expect(localStorage.getItem(CONTROLLED_STORAGE_KEY)).toBeNull();

      state.set({ ...state(), mode: 'dark' });
      await waitFor(() =>
        expect(controls.getByText('Resolved mode: dark')).toBeVisible()
      );
    } finally {
      app.destroy();
      preview.setState(preview.state());
    }
  },
};
