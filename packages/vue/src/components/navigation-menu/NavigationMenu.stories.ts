import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectInterruptibleOverlayMotion } from '../../stories/support/overlay-motion-test-utils';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '.';

const meta = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'NavigationMenu shows top-level site links, with flyout panels for groups of pages. Use it for a website header. For app commands, use Menubar.',
      },
    },
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#automation">Automation</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Company</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#about">About</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#careers">Careers</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
};

export const WithSimpleLink: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Style a plain link with `navigationMenuTriggerStyle()` to sit beside triggers.',
      },
    },
  },
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
    },
    setup: () => ({ triggerStyle: navigationMenuTriggerStyle() }),
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#docs" :class="triggerStyle">Docs</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" :class="triggerStyle">Pricing</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
};

export const WithoutViewport: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `:viewport="false"` to open each flyout under its own trigger.',
      },
    },
  },
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    template: `
      <NavigationMenu :viewport="false">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
};

export const WithIndicator: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add NavigationMenuIndicator to point an arrow at the open flyout.',
      },
    },
  },
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuIndicator,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Company</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#about">About</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: { story: 'Disable a trigger so its flyout cannot open.' },
    },
  },
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger disabled>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/i });

    await expect(trigger).toBeDisabled();

    // Disabled trigger uses a semantic text token at full opacity (not a fade).
    await expect(trigger).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(trigger).opacity).toBe('1');
  },
};

export const OpenCloseInteraction: Story = {
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: /Products/i });
    await expect(trigger).toHaveAttribute('data-state', 'closed');

    // Open the flyout by clicking the trigger
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'open'));

    // The flyout links render in-tree (no portal)
    const link = await canvas.findByRole('link', { name: 'Analytics' });
    await expect(link).toBeInTheDocument();
    await expectInterruptibleOverlayMotion(
      canvasElement.querySelector('[data-slot="navigation-menu-viewport"]')
    );

    // Close with Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('data-state', 'closed')
    );
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/i });

    // Focus the trigger and open with the keyboard
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'open'));

    // Close with Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('data-state', 'closed')
    );
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    template: `
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                <li>
                  <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Root carries data-slot + data-viewport
    const root = canvasElement.querySelector('[data-slot="navigation-menu"]');
    await expect(root).toBeInTheDocument();
    await expect(root).toHaveAttribute('data-viewport', 'true');

    // List + Item slots present
    await expect(
      canvasElement.querySelector('[data-slot="navigation-menu-list"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="navigation-menu-item"]')
    ).toBeInTheDocument();

    // Trigger slot
    const trigger = canvas.getByRole('button', { name: /Products/i });
    await expect(trigger).toHaveAttribute(
      'data-slot',
      'navigation-menu-trigger'
    );
    // #470: trigger reuses navigationMenuTriggerStyle -> typography-label-default.
    await expect(trigger).toHaveClass('nx:typography-label-default');

    // Open → content + link slots render
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="navigation-menu-content"]')
      ).toBeInTheDocument();
      expect(
        canvasElement.querySelector('[data-slot="navigation-menu-link"]')
      ).toBeInTheDocument();
    });
    // #470: flyout link migrated from the raw named text-size utility.
    await expect(
      canvasElement.querySelector('[data-slot="navigation-menu-link"]')
    ).toHaveClass('nx:typography-body-default');

    await userEvent.keyboard('{Escape}');
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    },
    setup: () => ({ triggerStyle: navigationMenuTriggerStyle() }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">With Flyout Triggers</h3>
          <NavigationMenu aria-label="Flyout navigation">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                    <li>
                      <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
                    <li>
                      <NavigationMenuLink href="#about">About</NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">Simple Links (no flyout)</h3>
          <NavigationMenu aria-label="Simple links navigation">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="#docs" :class="triggerStyle">Docs</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#pricing" :class="triggerStyle">Pricing</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
};
