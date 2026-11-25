import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import {
  expectMenuItemInsetAtEveryDensity,
  expectRadioDotInsetAtEveryUiScale,
} from '../../stories/support/menu-item-inset-test-utils';
import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
} from './context-menu';
import contextMenuMeta, {
  IndicatorCrossFade,
  OpenCloseInteraction,
  WithDataAttributes,
  WithDisabledItems,
} from './ContextMenu.stories';

const triggerClass =
  'nx:flex nx:h-[96px] nx:w-full nx:max-w-md nx:select-none nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-dashed nx:border-border-default nx:typography-body-default nx:text-muted-foreground';

const meta: Meta<typeof ContextMenu> = {
  ...contextMenuMeta,
  title: 'Tests/ContextMenu',
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const IndicatorCrossFadeStyle: Story = {
  ...IndicatorCrossFade,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Indicator Motion');

    try {
      await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

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
        '[data-slot="context-menu-checkbox-indicator-icon"]'
      );
      const uncheckedIcon = uncheckedItem.querySelector(
        '[data-slot="context-menu-checkbox-indicator-icon"]'
      );
      const indeterminateIcon = indeterminateItem.querySelector(
        '[data-slot="context-menu-checkbox-indicator-icon"]'
      );
      const selectedDot = selectedRadio.querySelector(
        '[data-slot="context-menu-radio-indicator-icon"]'
      );
      const unselectedDot = unselectedRadio.querySelector(
        '[data-slot="context-menu-radio-indicator-icon"]'
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
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="nx:w-56">
        <ContextMenuLabel inset>Appearance</ContextMenuLabel>
        <ContextMenuCheckboxItem checked>Status bar</ContextMenuCheckboxItem>
        <ContextMenuItem inset>Reset view</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fireEvent.contextMenu(canvas.getByText('Right click here'), {
      clientX: 20,
      clientY: 20,
    });
    const menu = await within(document.body).findByRole('menu');
    const item = within(menu).getByRole('menuitemcheckbox', {
      name: 'Status bar',
    });
    const check = item.querySelector<HTMLElement>(
      '[data-slot="context-menu-checkbox-indicator"]'
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
    <ContextMenu>
      <ContextMenuTrigger className={triggerClass}>
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="nx:w-56">
        <ContextMenuRadioGroup value="bottom">
          <ContextMenuRadioItem value="top">Top</ContextMenuRadioItem>
          <ContextMenuRadioItem value="bottom">Bottom</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fireEvent.contextMenu(canvas.getByText('Right click here'), {
      clientX: 20,
      clientY: 20,
    });
    const menu = await within(document.body).findByRole('menu');
    const item = within(menu).getByRole('menuitemradio', { name: 'Bottom' });
    const indicator = item.querySelector<HTMLElement>(
      '[data-slot="context-menu-radio-indicator"]'
    )!.parentElement!;
    const dot = item.querySelector(
      '[data-slot="context-menu-radio-indicator-icon"]'
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
    const trigger = canvas.getByText('Right click here');

    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

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
    const trigger = canvas.getByText('Right click here');
    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });

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
    const trigger = canvas.getByText('Right click here');
    await fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 });
    await within(document.body).findByRole('menu');

    const shortcut = document.querySelector(
      '[data-slot="context-menu-shortcut"]'
    );
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass('nx:typography-body-small');
    await expect(shortcut).not.toHaveClass(/tracking-/);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(document.querySelector('[data-aria-hidden="true"]')).toBeNull();
    });
  },
};
