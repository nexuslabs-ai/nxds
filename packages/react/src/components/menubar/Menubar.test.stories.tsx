import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectMenuItemInsetAtEveryDensity,
  expectRadioDotInsetAtEveryUiScale,
} from '../../stories/support/menu-item-inset-test-utils';
import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from './menubar';
import menubarMeta, {
  IndicatorCrossFade,
  OpenCloseInteraction,
  WithDataAttributes,
  WithDisabledItems,
} from './Menubar.stories';

const meta: Meta<typeof Menubar> = {
  ...menubarMeta,
  title: 'Tests/Menubar',
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const IndicatorCrossFadeStyle: Story = {
  ...IndicatorCrossFade,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('menuitem', { name: 'View' });

    try {
      await userEvent.click(trigger);

      const menu = await within(document.body).findByRole('menu');
      const checkedItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Status Bar',
      });
      const uncheckedItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Activity Bar',
      });
      const indeterminateItem = within(menu).getByRole('menuitemcheckbox', {
        name: 'Bookmarks Bar',
      });
      const selectedRadio = within(menu).getByRole('menuitemradio', {
        name: 'Bottom',
      });
      const unselectedRadio = within(menu).getByRole('menuitemradio', {
        name: 'Top',
      });

      const checkedIcon = checkedItem.querySelector(
        '[data-slot="menubar-checkbox-indicator-icon"]'
      );
      const uncheckedIcon = uncheckedItem.querySelector(
        '[data-slot="menubar-checkbox-indicator-icon"]'
      );
      const indeterminateIcon = indeterminateItem.querySelector(
        '[data-slot="menubar-checkbox-indicator-icon"]'
      );
      const selectedDot = selectedRadio.querySelector(
        '[data-slot="menubar-radio-indicator-icon"]'
      );
      const unselectedDot = unselectedRadio.querySelector(
        '[data-slot="menubar-radio-indicator-icon"]'
      );

      await expect(checkedItem).toHaveClass('nx:group');
      await expect(selectedRadio).toHaveClass('nx:group');
      await expect(checkedIcon).toHaveClass('nx:transition-[opacity,scale]');
      await expect(uncheckedIcon).toHaveClass('nx:scale-50');
      await expect(uncheckedIcon).toHaveClass('nx:opacity-0');
      await expect(checkedIcon).toHaveClass(
        'nx:group-data-[state=checked]:opacity-100'
      );
      await expect(indeterminateIcon).toHaveClass(
        'nx:group-data-[state=indeterminate]:opacity-100'
      );
      await expect(unselectedDot).toHaveClass('nx:scale-50');
      await expect(unselectedDot).toHaveClass('nx:opacity-0');
      await expect(selectedDot).toHaveClass(
        'nx:group-data-[state=checked]:opacity-100'
      );
    } finally {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeNull();
        expect(document.querySelector('[data-aria-hidden="true"]')).toBeNull();
      });
    }
  },
};

export const CheckInsetAtEveryDensity: Story = {
  render: (_args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent className="nx:w-56">
          <MenubarLabel inset>Appearance</MenubarLabel>
          <MenubarCheckboxItem checked>Status bar</MenubarCheckboxItem>
          <MenubarItem inset>Reset view</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'View' }));
    const menu = await within(document.body).findByRole('menu');
    const item = within(menu).getByRole('menuitemcheckbox', {
      name: 'Status bar',
    });
    const check = item.querySelector<HTMLElement>(
      '[data-slot="menubar-checkbox-indicator"]'
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
  render: (_args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent className="nx:w-56">
          <MenubarRadioGroup value="bottom">
            <MenubarRadioItem value="top">Top</MenubarRadioItem>
            <MenubarRadioItem value="bottom">Bottom</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'View' }));
    const menu = await within(document.body).findByRole('menu');
    const item = within(menu).getByRole('menuitemradio', { name: 'Bottom' });
    const indicator = item.querySelector<HTMLElement>(
      '[data-slot="menubar-radio-indicator"]'
    )!.parentElement!;
    const dot = item.querySelector(
      '[data-slot="menubar-radio-indicator-icon"]'
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
    const trigger = canvas.getByRole('menuitem', { name: 'File' });

    await userEvent.click(trigger);

    const menu = await within(document.body).findByRole('menu');
    await expectInterruptibleOverlayMotion(menu);

    await userEvent.keyboard('{Escape}');

    // Wait for menu to be removed from DOM
    await expectExitBeforeUnmount(document.querySelector('[role="menu"]'));
  },
};

export const WithDisabledItemsStyle: Story = {
  ...WithDisabledItems,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('menuitem', { name: 'Edit' });
    await userEvent.click(trigger);

    const menu = await within(document.body).findByRole('menu');
    const disabledItem = within(menu).getByRole('menuitem', { name: 'Cut' });

    // Disabled items use a semantic text token at full opacity (not a fade).
    await expect(disabledItem).toHaveClass(
      'nx:data-disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(disabledItem).opacity).toBe('1');

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
    const trigger = canvas.getByRole('menuitem', { name: 'File' });
    await userEvent.click(trigger);
    await within(document.body).findByRole('menu');

    const shortcut = document.querySelector('[data-slot="menubar-shortcut"]');
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass(/tracking-/);

    // The bar root owns a raised component surface; triggers hover/open within it.
    const menubar = canvas
      .getByRole('menubar')
      .closest('[data-slot="menubar"]');
    await expect(menubar).toHaveClass('nx:bg-container');
    await expect(trigger).toHaveClass(
      'nx:focus:bg-container-hover',
      'nx:data-[state=open]:bg-container-hover'
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(document.querySelector('[data-aria-hidden="true"]')).toBeNull();
    });
  },
};
