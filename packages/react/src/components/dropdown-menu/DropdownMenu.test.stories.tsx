import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectMenuItemInsetAtEveryDensity,
  expectRadioDotInsetAtEveryUiScale,
} from '../../stories/support/menu-item-inset-test-utils';
import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
  expectPlacedBelow,
} from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button/button';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import dropdownMenuMeta, {
  IndicatorCrossFade,
  OpenCloseInteraction,
  WithDataAttributes,
  WithDisabledItems,
} from './DropdownMenu.stories';

const meta: Meta<typeof DropdownMenu> = {
  ...dropdownMenuMeta,
  title: 'Tests/DropdownMenu',
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const IndicatorCrossFadeStyle: Story = {
  ...IndicatorCrossFade,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Indicator Motion' });

    try {
      await userEvent.click(trigger);

      const menu = await within(document.body).findByRole('menu');
      const checkedItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Status Bar',
      });
      const indeterminateItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Bookmarks Bar',
      });
      const selectedRadio = within(menu).getByRole('menuitemradio', {
        name: 'Bottom',
      });

      const checkedIcon = checkedItem.querySelector(
        '[data-slot="dropdown-menu-checkbox-indicator-icon"]'
      );
      const indeterminateIcon = indeterminateItem.querySelector(
        '[data-slot="dropdown-menu-checkbox-indicator-icon"]'
      );
      const selectedDot = selectedRadio.querySelector(
        '[data-slot="dropdown-menu-radio-indicator-icon"]'
      );

      await expect(checkedIcon).toHaveClass('nx:transition-[opacity,scale]');
      await expect(checkedIcon).toHaveClass(
        'nx:group-data-[state=checked]:opacity-100'
      );
      await expect(indeterminateIcon).toHaveClass(
        'nx:group-data-[state=indeterminate]:opacity-100'
      );
      await expect(selectedDot).toHaveClass(
        'nx:group-data-[state=checked]:opacity-100'
      );
    } finally {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeNull();
      });
    }
  },
};

export const WithDisabledItemsStyle: Story = {
  ...WithDisabledItems,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Edit' });

    try {
      await userEvent.click(trigger);

      const menu = await within(document.body).findByRole('menu');
      const cutItem = within(menu).getByRole('menuitem', { name: 'Cut' });

      // Disabled items use a semantic text token at full opacity (not a fade).
      await expect(cutItem).toHaveClass(
        'nx:data-disabled:text-disabled-foreground'
      );
      await expect(getComputedStyle(cutItem).opacity).toBe('1');
    } finally {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeNull();
      });
    }
  },
};

export const CheckInsetAtEveryDensity: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="nx:w-56">
        <DropdownMenuLabel inset>Appearance</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>Status bar</DropdownMenuCheckboxItem>
        <DropdownMenuItem inset>Reset view</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'View' }));
    const menu = await within(document.body).findByRole('menu');
    const item = within(menu).getByRole('menuitemcheckbox', {
      name: 'Status bar',
    });
    const check = item.querySelector<HTMLElement>(
      '[data-slot="dropdown-menu-checkbox-indicator"]'
    )!.parentElement!;
    await expectMenuItemInsetAtEveryDensity(menu, item, check, [
      within(menu).getByRole('menuitem', { name: 'Reset view' }),
      within(menu).getByText('Appearance'),
    ]);

    await userEvent.keyboard('{Escape}');
    await expectExitBeforeUnmount(menu);
  },
};

export const RadioDotAtEveryUiScale: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="nx:w-56">
        <DropdownMenuRadioGroup value="bottom">
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'View' }));
    const menu = await within(document.body).findByRole('menu');
    const item = within(menu).getByRole('menuitemradio', { name: 'Bottom' });
    const indicator = item.querySelector<HTMLElement>(
      '[data-slot="dropdown-menu-radio-indicator"]'
    )!.parentElement!;
    const dot = item.querySelector(
      '[data-slot="dropdown-menu-radio-indicator-icon"]'
    )!;
    await expectRadioDotInsetAtEveryUiScale(menu, indicator, dot);

    await userEvent.keyboard('{Escape}');
    await expectExitBeforeUnmount(menu);
  },
};

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open Menu' });

    await userEvent.click(trigger);

    const menu = await within(document.body).findByRole('menu');
    await expectInterruptibleOverlayMotion(menu);

    await userEvent.keyboard('{Escape}');

    // Wait for menu to be removed from DOM
    await expectExitBeforeUnmount(document.querySelector('[role="menu"]'));
  },
};

export const OpenCloseInteractionPlacement: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open Menu' });

    await userEvent.click(trigger);

    const menu = await within(document.body).findByRole('menu');
    await expectPlacedBelow(menu, trigger);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open Menu' }));
    await within(document.body).findByRole('menu');

    const shortcut = document.querySelector(
      '[data-slot="dropdown-menu-shortcut"]'
    );
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass(/tracking-/);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(document.querySelector('[data-aria-hidden="true"]')).toBeNull();
    });
  },
};
