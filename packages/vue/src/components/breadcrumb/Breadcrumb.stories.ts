import { PhFolder, PhGear, PhHouse } from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbMenuTrigger,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '.';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          "Breadcrumb shows where the current page sits in your app's hierarchy. Use it on pages two or more levels deep. For top-level navigation, use NavigationMenu or Sidebar.",
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const breadcrumbComponents = {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbMenuTrigger,
  BreadcrumbPage,
  BreadcrumbSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
};

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Breadcrumb,
      BreadcrumbItem,
      BreadcrumbLink,
      BreadcrumbList,
      BreadcrumbPage,
      BreadcrumbSeparator,
    },
    template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
  }),
};

export const WithEllipsis: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Collapse the middle of a long trail into an ellipsis menu.',
      },
    },
  },
  render: () => ({
    components: {
      Breadcrumb,
      BreadcrumbEllipsis,
      BreadcrumbItem,
      BreadcrumbLink,
      BreadcrumbList,
      BreadcrumbPage,
      BreadcrumbSeparator,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
    },
    template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/projects">Projects</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/projects/design-system">Design System</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/projects/design-system/components">Components</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show hidden breadcrumbs' })
    );

    await waitFor(async () => {
      await expect(
        within(document.body).getByRole('menuitem', {
          name: 'Design System',
        })
      ).toBeVisible();
    });

    // Close the menu before the a11y scan: an open menu aria-hides the
    // still-focusable breadcrumb trail, which axe flags as aria-hidden-focus.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

export const WithIcons: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add icons to segments and a menu trigger for alternate paths.',
      },
    },
  },
  render: () => ({
    components: {
      Breadcrumb,
      BreadcrumbItem,
      BreadcrumbLink,
      BreadcrumbList,
      BreadcrumbMenuTrigger,
      BreadcrumbPage,
      BreadcrumbSeparator,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      PhFolder,
    },
    template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">
              <PhFolder aria-hidden="true" />
              <span>Workspace</span>
            </BreadcrumbLink>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbMenuTrigger aria-label="Show alternate paths for Workspace" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/workspaces/personal">Personal</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/workspaces/team">Team</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/workspaces/archived">Archived</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">
              <PhFolder aria-hidden="true" />
              <span>Projects</span>
            </BreadcrumbLink>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbMenuTrigger aria-label="Show alternate paths for Projects" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/projects/components">Components</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/projects/patterns">Patterns</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/projects/tokens">Tokens</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <PhFolder aria-hidden="true" />
              <span>Breadcrumb</span>
            </BreadcrumbPage>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbMenuTrigger aria-label="Show related pages for Breadcrumb" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/components/breadcrumb/api">Breadcrumb API</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/components/breadcrumb/stories">Breadcrumb Stories</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Show alternate paths for Workspace',
      })
    );

    await waitFor(async () => {
      await expect(
        within(document.body).getByRole('menuitem', { name: 'Team' })
      ).toBeVisible();
    });

    // Close the menu before the a11y scan: an open menu aria-hides the
    // still-focusable breadcrumb trail, which axe flags as aria-hidden-focus.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  },
};

// Behaviour stories: tests and Storybook only.

export const IconOnly: Story = {
  render: () => ({
    components: { ...breadcrumbComponents, PhFolder, PhHouse, PhGear },
    template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home" aria-label="Home">
              <PhHouse aria-hidden="true" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects" aria-label="Projects">
              <PhFolder aria-hidden="true" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <PhGear aria-hidden="true" />
              <span class="nx:sr-only">Settings</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-slot',
      'breadcrumb-link'
    );
    await expect(
      canvas.getByRole('link', { name: 'Projects' })
    ).toHaveAttribute('data-slot', 'breadcrumb-link');
    await expect(canvas.getByText('Settings')).toHaveClass('nx:sr-only');
  },
};

export const LongContent: Story = {
  render: () => ({
    components: breadcrumbComponents,
    template: `
      <div class="nx:w-[240px]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                <span>Quarterly reporting workspace with an unusually long name</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <span>Budget assumptions and approval workflow details</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    `,
  }),
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: breadcrumbComponents,
    template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbMenuTrigger aria-label="Show alternate paths for Home" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/accounts">Accounts</a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="/companies">Companies</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contacts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    const link = canvas.getByRole('link', { name: 'Home' });
    const trigger = canvas.getByRole('button', {
      name: 'Show alternate paths for Home',
    });
    const page = canvas.getByText('Contacts');

    // The list is a keyboard-focusable scroll region, so it is the first tab
    // stop; the link and trigger follow, and the current page is never focused.
    await userEvent.tab();
    await expect(list).toHaveFocus();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute(
      'data-slot',
      'breadcrumb-menu-trigger'
    );
    await expect(page).not.toHaveFocus();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: breadcrumbComponents,
    template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as-child>
              <a href="/home">Home</a>
            </BreadcrumbLink>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbMenuTrigger aria-label="Show alternate paths for Home" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/companies">Companies</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/companies">Companies</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contacts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'breadcrumb',
      'breadcrumb-list',
      'breadcrumb-item',
      'breadcrumb-link',
      'breadcrumb-menu-trigger',
      'breadcrumb-separator',
      'breadcrumb-ellipsis',
      'breadcrumb-page',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    // as-child merges BreadcrumbLink's attributes onto the child anchor.
    const link = within(canvasElement).getByRole('link', { name: 'Home' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');

    const page = canvasElement.querySelector('[data-slot="breadcrumb-page"]');
    await expect(page).toHaveAttribute('aria-current', 'page');
    await expect(page).not.toHaveAttribute('role');
    await expect(page).not.toHaveAttribute('aria-disabled');
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: breadcrumbComponents,
    template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem as-child>
                  <a href="/projects/design-system">Design System</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
  }),
};
