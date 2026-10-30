import { DENSITY_OPTIONS } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
  expectPlacedBelow,
} from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '.';

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'DropdownMenu opens a list of actions from a button. Use it for a short list of actions or options. For picking a form value, use Select.',
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

export const WithLabelsAndSeparators: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuGroup,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuShortcut,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">My Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="nx:w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem>Billing<DropdownMenuShortcut>⌘B</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem>Settings<DropdownMenuShortcut>⌘S</DropdownMenuShortcut></DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const WithCheckboxItems: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Use DropdownMenuCheckboxItem for settings that toggle on and off.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuCheckboxItem,
      DropdownMenuContent,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    },
    setup: () => ({
      showStatusBar: ref(true),
      showActivityBar: ref(false),
      showPanel: ref(false),
    }),
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">View Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="nx:w-56">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem v-model="showStatusBar">Status Bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showActivityBar">Activity Bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showPanel">Panel</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const WithRadioItems: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Use DropdownMenuRadioItem inside a DropdownMenuRadioGroup to pick one option.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuLabel,
      DropdownMenuRadioGroup,
      DropdownMenuRadioItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    },
    setup: () => ({ position: ref('bottom') }),
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Panel Position</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="nx:w-56">
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup v-model="position">
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const IndicatorCrossFade: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuCheckboxItem,
      DropdownMenuContent,
      DropdownMenuRadioGroup,
      DropdownMenuRadioItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    },
    setup: () => ({
      showStatusBar: ref(true),
      showActivityBar: ref(false),
      showBookmarksBar: ref<boolean | 'indeterminate'>('indeterminate'),
      position: ref('bottom'),
    }),
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Indicator Motion</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="nx:w-56">
          <DropdownMenuCheckboxItem v-model="showStatusBar">Status Bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showActivityBar">Activity Bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showBookmarksBar">Bookmarks Bar</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup v-model="position">
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Indicator Motion' });

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
        '[data-slot="dropdown-menu-checkbox-indicator-icon"]'
      );
      const uncheckedIcon = uncheckedItem.querySelector(
        '[data-slot="dropdown-menu-checkbox-indicator-icon"]'
      );
      const indeterminateIcon = indeterminateItem.querySelector(
        '[data-slot="dropdown-menu-checkbox-indicator-icon"]'
      );
      const selectedDot = selectedRadio.querySelector(
        '[data-slot="dropdown-menu-radio-indicator-icon"]'
      );
      const unselectedDot = unselectedRadio.querySelector(
        '[data-slot="dropdown-menu-radio-indicator-icon"]'
      );

      await expect(checkedIcon).toBeInTheDocument();
      await expect(uncheckedIcon).toBeInTheDocument();
      await expect(indeterminateIcon).toBeInTheDocument();
      await expect(selectedDot).toBeInTheDocument();
      await expect(unselectedDot).toBeInTheDocument();
      await expect(indeterminateItem).toHaveAttribute(
        'data-state',
        'indeterminate'
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

export const WithSubMenu: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Nest a DropdownMenuSub to open a second menu from an item.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuShortcut,
      DropdownMenuSub,
      DropdownMenuSubContent,
      DropdownMenuSubTrigger,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="nx:w-56">
          <DropdownMenuItem>New Tab<DropdownMenuShortcut>⌘T</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem>New Window<DropdownMenuShortcut>⌘N</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Save Page As...</DropdownMenuItem>
              <DropdownMenuItem>Create Shortcut...</DropdownMenuItem>
              <DropdownMenuItem>Name Window...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Developer Tools</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Exit<DropdownMenuShortcut>⌘Q</DropdownMenuShortcut></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const WithDestructiveItem: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const WithDisabledItems: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Edit</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Undo</DropdownMenuItem>
          <DropdownMenuItem>Redo</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Cut</DropdownMenuItem>
          <DropdownMenuItem disabled>Copy</DropdownMenuItem>
          <DropdownMenuItem>Paste</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Edit' });

    try {
      await userEvent.click(trigger);

      const menu = await within(document.body).findByRole('menu');
      const cutItem = within(menu).getByRole('menuitem', { name: 'Cut' });
      const copyItem = within(menu).getByRole('menuitem', { name: 'Copy' });
      const pasteItem = within(menu).getByRole('menuitem', { name: 'Paste' });

      await expect(cutItem).toHaveAttribute('data-disabled');
      await expect(cutItem).toHaveAttribute('aria-disabled', 'true');
      await expect(copyItem).toHaveAttribute('data-disabled');
      await expect(copyItem).toHaveAttribute('aria-disabled', 'true');

      // Disabled items use a semantic text token at full opacity (not a fade).
      await expect(cutItem).toHaveClass(
        'nx:data-disabled:text-disabled-foreground'
      );
      await expect(getComputedStyle(cutItem).opacity).toBe('1');

      for (
        let step = 0;
        step < 5 && !pasteItem.hasAttribute('data-highlighted');
        step += 1
      ) {
        await userEvent.keyboard('{ArrowDown}');
        await expect(cutItem).not.toHaveAttribute('data-highlighted');
        await expect(copyItem).not.toHaveAttribute('data-highlighted');
      }

      await expect(pasteItem).toHaveAttribute('data-highlighted');
    } finally {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeNull();
      });
    }
  },
};

export const WithInsetItems: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="nx:w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem inset>Back</DropdownMenuItem>
          <DropdownMenuItem inset>Forward</DropdownMenuItem>
          <DropdownMenuItem inset>Reload</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

// ============================================
// INTERACTION TESTS
// ============================================

const threeItemMenu = (labels: [string, string, string]) => () => ({
  components: {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  },
  setup: () => ({ labels }),
  template: `
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem v-for="label in labels" :key="label">{{ label }}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  `,
});

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const CheckInsetAtEveryDensity: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuCheckboxItem,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="nx:w-56">
          <DropdownMenuLabel inset>Appearance</DropdownMenuLabel>
          <DropdownMenuCheckboxItem :model-value="true">Status bar</DropdownMenuCheckboxItem>
          <DropdownMenuItem inset>Reset view</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
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
    const inset = (element: Element) =>
      parseFloat(getComputedStyle(element).paddingLeft);
    for (const density of DENSITIES) {
      // The density applies to the open panel and everything in it.
      menu.setAttribute('data-density', density);
      // The check sits 8px in, and the text starts 8px after it.
      await expect(check.offsetLeft).toBe(8);
      await expect(inset(item) - check.offsetLeft - check.offsetWidth).toBe(8);
      // Inset items and labels line up with that text.
      await expect(
        inset(within(menu).getByRole('menuitem', { name: 'Reset view' }))
      ).toBe(inset(item));
      await expect(inset(within(menu).getByText('Appearance'))).toBe(
        inset(item)
      );
    }

    await userEvent.keyboard('{Escape}');
    await expectExitBeforeUnmount(menu);
  },
};

export const OpenCloseInteraction: Story = {
  render: threeItemMenu(['Item 1', 'Item 2', 'Item 3']),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Menu should not be visible initially
    const trigger = canvas.getByRole('button', { name: 'Open Menu' });
    await expect(trigger).toBeInTheDocument();

    // Open the menu
    await userEvent.click(trigger);

    // Menu content should now be visible
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeInTheDocument();
    await expect(menu).toHaveAttribute('data-slot', 'dropdown-menu-content');
    await expectInterruptibleOverlayMotion(menu);
    await expectPlacedBelow(menu, trigger);

    // Items should be visible
    const item1 = within(menu).getByRole('menuitem', { name: 'Item 1' });
    await expect(item1).toBeInTheDocument();

    // Close the menu by pressing Escape
    await userEvent.keyboard('{Escape}');

    // Wait for menu to be removed from DOM
    await expectExitBeforeUnmount(document.querySelector('[role="menu"]'));
    // Reka returns focus to the trigger a tick after the menu unmounts.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const KeyboardInteraction: Story = {
  render: threeItemMenu(['First', 'Second', 'Third']),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the menu
    const trigger = canvas.getByRole('button', { name: 'Open Menu' });
    await userEvent.click(trigger);

    // Menu should be open
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeInTheDocument();

    // Navigate with arrow keys
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');

    // The second item should be focused
    const secondItem = within(menu).getByRole('menuitem', { name: 'Second' });
    await expect(secondItem).toHaveAttribute('data-highlighted');

    // Close with Escape
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuShortcut,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item<DropdownMenuShortcut>⌘I</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Destructive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the menu
    const trigger = canvas.getByRole('button', { name: 'Open Menu' });
    await userEvent.click(trigger);

    // Wait for menu to be visible
    await within(document.body).findByRole('menu');

    // Check data-slot attributes
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="dropdown-menu-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dropdown-menu-label"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dropdown-menu-separator"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dropdown-menu-item"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dropdown-menu-shortcut"]')
      ).toBeInTheDocument();
    });

    const shortcut = document.querySelector(
      '[data-slot="dropdown-menu-shortcut"]'
    );
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass('nx:tracking-widest');

    // Check destructive variant
    const destructiveItem = document.querySelector(
      '[data-slot="dropdown-menu-item"][data-variant="destructive"]'
    );
    await expect(destructiveItem).toBeInTheDocument();

    // Close the menu and wait for complete cleanup
    await userEvent.keyboard('{Escape}');

    // Wait for menu to be fully removed from DOM (including aria-hidden cleanup)
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
      // Ensure no lingering aria-hidden elements from Reka
      expect(document.querySelector('[data-aria-hidden="true"]')).toBeNull();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuShortcut,
      DropdownMenuSub,
      DropdownMenuSubContent,
      DropdownMenuSubTrigger,
      DropdownMenuTrigger,
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">Basic Menu</h3>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline">Basic Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>New File</DropdownMenuItem>
              <DropdownMenuItem>Open File</DropdownMenuItem>
              <DropdownMenuItem>Save</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">With Shortcuts</h3>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline">With Shortcuts</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="nx:w-48">
              <DropdownMenuItem>New File<DropdownMenuShortcut>⌘N</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem>Save<DropdownMenuShortcut>⌘S</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem>Close<DropdownMenuShortcut>⌘W</DropdownMenuShortcut></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">With Destructive</h3>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline">With Destructive</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">With Submenu</h3>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline">With Submenu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
                  <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
};
