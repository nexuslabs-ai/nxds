import { PhX } from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button';

import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '.';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Drawer slides in a panel from a screen edge that the user can drag to dismiss. Use it for mobile-style panels, especially bottom drawers. Install `vaul-vue` in your app to use it.\n\n- For a side panel without drag gestures, use Sheet.\n- For a centered modal task, use Dialog.\n- For a confirmation that forces a choice, use AlertDialog.\n- Set `:show-handle="false"` on DrawerContent to remove the handle and its spacing. Dragging and dismissal stay the same.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const SCROLLABLE_ITEMS = Array.from({ length: 18 }, (_, index) => ({
  title: `Audit item ${index + 1}`,
  description:
    'A representative row that keeps the drawer body scrollable while actions remain available.',
}));

const waitForDrawerToClose = async () => {
  await waitFor(
    () => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    },
    { timeout: 3000 }
  );
};

const COMPONENTS = {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};

interface HandleExampleProps {
  dismissible?: boolean;
  showHandle?: boolean;
  triggerLabel: string;
}

const handleExample = (props: HandleExampleProps) => () => ({
  components: COMPONENTS,
  setup: () => ({ ...props, open: ref(false), items: SCROLLABLE_ITEMS }),
  template: `
    <Drawer v-model:open="open" :dismissible="dismissible">
      <DrawerTrigger as-child>
        <Button variant="outline">{{ triggerLabel }}</Button>
      </DrawerTrigger>
      <DrawerContent :show-handle="showHandle">
        <DrawerHeader>
          <DrawerTitle>Document preview</DrawerTitle>
          <DrawerDescription>The visual handle is optional. Root settings still control dismissal.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody class="nx:max-h-[45svh] nx:pb-6">
          <p class="nx:typography-body-default nx:text-foreground">Review the document. Root settings determine which dismissal methods are available.</p>
          <ul class="nx:flex nx:flex-col nx:gap-3">
            <li v-for="item in items" :key="item.title" class="nx:typography-body-default nx:text-foreground">{{ item.title }}</li>
          </ul>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose as-child>
            <Button variant="outline">Close preview</Button>
          </DrawerClose>
          <Button v-if="dismissible === false" @click="open = false">Finish preview</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  `,
});

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      Drawer,
      DrawerBody,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerFooter,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Drag down or press Escape to dismiss this drawer.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p class="nx:typography-body-default nx:text-foreground">Drawer content goes here. On touch devices it can be dragged to dismiss.</p>
          </DrawerBody>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose as-child>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    `,
  }),
};

export const ScrollableContent: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      Drawer,
      DrawerBody,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerFooter,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
    },
    setup: () => ({
      items: Array.from({ length: 18 }, (_, index) => ({
        title: `Audit item ${index + 1}`,
        description:
          'A representative row that keeps the drawer body scrollable while actions remain available.',
      })),
    }),
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Open Details</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Review changes</DrawerTitle>
            <DrawerDescription>Long drawers keep the action footer reachable while the body scrolls.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody data-testid="drawer-scroll-area" class="nx:max-h-[45svh] nx:pb-2">
            <ul class="nx:flex nx:flex-col nx:gap-3">
              <li v-for="item in items" :key="item.title" class="nx:rounded-md nx:border-default nx:border-border-default nx:bg-background nx:p-4">
                <p class="nx:typography-label-default nx:text-foreground">{{ item.title }}</p>
                <p class="nx:typography-body-default nx:text-muted-foreground">{{ item.description }}</p>
              </li>
            </ul>
          </DrawerBody>
          <DrawerFooter class="nx:border-t-default nx:border-border-default">
            <Button>Save changes</Button>
            <DrawerClose as-child>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Manual check: on a touch device, scroll DrawerBody, then drag the handle or frame to dismiss the drawer.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Details' }));

    const drawer = await within(document.body).findByRole('dialog');
    const scrollArea = within(drawer).getByTestId('drawer-scroll-area');

    await expect(scrollArea).toHaveAttribute('tabindex', '0');
    await expect(scrollArea).toHaveClass(
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );
    await waitFor(() => {
      expect(scrollArea.scrollHeight).toBeGreaterThan(scrollArea.clientHeight);
    });
    await expect(
      within(drawer).getByRole('button', { name: 'Save changes' })
    ).toBeVisible();

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close' })
    );

    await waitForDrawerToClose();
  },
};

export const WithHeaderActions: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place a close button in DrawerHeader next to the title.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Drawer,
      DrawerBody,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
      PhX,
    },
    template: `
      <Drawer direction="right">
        <DrawerTrigger as-child>
          <Button variant="outline">Open Actions</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader class="nx:flex-row nx:items-start nx:justify-between nx:gap-4">
            <div class="nx:flex nx:min-w-0 nx:flex-col nx:gap-1.5">
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>Refine the visible records without leaving the current view.</DrawerDescription>
            </div>
            <DrawerClose as-child>
              <Button variant="ghost" icon-only>
                <template #start-icon><PhX /></template>Close drawer</Button>
            </DrawerClose>
          </DrawerHeader>
          <DrawerBody class="nx:pb-6 nx:typography-body-default nx:text-foreground">Header actions are regular composition: consumers place controls in the header and keep Vaul responsible for dismissal.</DrawerBody>
        </DrawerContent>
      </Drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Actions' }));

    const drawer = await within(document.body).findByRole('dialog');
    const closeButton = within(drawer).getByRole('button', {
      name: 'Close drawer',
    });

    await expect(closeButton).toBeVisible();
    await userEvent.click(closeButton);

    await waitForDrawerToClose();
  },
};

export const OpenCloseInteraction: Story = {
  render: () => ({
    components: {
      Button,
      Drawer,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerFooter,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Interaction Test</DrawerTitle>
            <DrawerDescription>Testing open and close behavior.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button>Dismiss</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Drawer' });
    await userEvent.click(trigger);

    // Content portals to document.body with role="dialog".
    const drawer = await within(document.body).findByRole('dialog');
    await expect(drawer).toHaveAttribute('data-slot', 'drawer-content');
    const overlay = document.querySelector('[data-slot="drawer-overlay"]');
    await expectInterruptibleOverlayMotion(overlay);
    await expect(
      within(drawer).getByText('Interaction Test')
    ).toBeInTheDocument();

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Dismiss' })
    );

    await expectExitBeforeUnmount(overlay);
    await waitForDrawerToClose();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: {
      Button,
      Drawer,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerFooter,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Keyboard Test</DrawerTitle>
            <DrawerDescription>Testing keyboard interactions.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Drawer' });
    await userEvent.click(trigger);

    await within(document.body).findByRole('dialog');
    await userEvent.keyboard('{Escape}');

    await waitForDrawerToClose();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      Button,
      Drawer,
      DrawerBody,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerFooter,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
    },
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Data Attributes</DrawerTitle>
            <DrawerDescription>Testing data-slot attributes.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p class="nx:typography-body-default nx:text-foreground">Content here</p>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Drawer' });
    await userEvent.click(trigger);

    await within(document.body).findByRole('dialog');

    await waitFor(() => {
      for (const slot of [
        'drawer-overlay',
        'drawer-content',
        'drawer-header',
        'drawer-handle',
        'drawer-title',
        'drawer-description',
        'drawer-body',
        'drawer-footer',
      ]) {
        expect(
          document.querySelector(`[data-slot="${slot}"]`)
        ).toBeInTheDocument();
      }
    });

    await expect(
      document.querySelector('[data-slot="drawer-content"]')
    ).toHaveClass('nx:overflow-hidden');
    await expect(
      document.querySelector('[data-slot="drawer-body"]')
    ).toHaveClass(
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );
    await expect(
      document.querySelector('[data-slot="drawer-body"]')
    ).toHaveAttribute('tabindex', '0');

    await userEvent.keyboard('{Escape}');
  },
};

export const WithoutHandle: Story = {
  render: handleExample({
    showHandle: false,
    triggerLabel: 'Open without handle',
  }),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open without handle',
    });
    await userEvent.click(trigger);
    const drawer = await within(document.body).findByRole('dialog');
    await expect(
      drawer.querySelector('[data-slot="drawer-handle"]')
    ).toBeNull();
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close preview' })
    );
    await waitForDrawerToClose();
  },
};

export const HandleVisibilityWhileOpen: Story = {
  render: () => ({
    components: COMPONENTS,
    setup: () => ({ showHandle: ref(false) }),
    template: `
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">Open handle toggle</Button>
        </DrawerTrigger>
        <DrawerContent :show-handle="showHandle">
          <DrawerHeader>
            <DrawerTitle>Handle visibility</DrawerTitle>
            <DrawerDescription>Change the handle without reopening the drawer.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <Button @click="showHandle = !showHandle">{{ showHandle ? 'Hide handle' : 'Show handle' }}</Button>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button variant="outline">Close preview</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open handle toggle' })
    );
    const drawer = await within(document.body).findByRole('dialog');
    const header = drawer.querySelector<HTMLElement>(
      '[data-slot="drawer-header"]'
    );
    await expect(header).not.toBeNull();
    const hiddenOffset = header!.offsetTop;
    await expect(
      drawer.querySelector('[data-slot="drawer-handle"]')
    ).toBeNull();
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Show handle' })
    );
    await expect(
      drawer.querySelector('[data-slot="drawer-handle"]')
    ).toBeVisible();
    await expect(header!.offsetTop).toBeGreaterThanOrEqual(hiddenOffset + 8);
    await expect(document.querySelector('[role="dialog"]')).toBe(drawer);
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Hide handle' })
    );
    await expect(
      drawer.querySelector('[data-slot="drawer-handle"]')
    ).toBeNull();
    await expect(header!.offsetTop).toBe(hiddenOffset);
    await expect(document.querySelector('[role="dialog"]')).toBe(drawer);
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close preview' })
    );
    await waitForDrawerToClose();
  },
};

export const HiddenHandleNonDismissible: Story = {
  render: handleExample({
    showHandle: false,
    dismissible: false,
    triggerLabel: 'Open non-dismissible preview',
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Open non-dismissible preview',
      })
    );
    const drawer = await within(document.body).findByRole('dialog');
    await expect(
      drawer.querySelector('[data-slot="drawer-handle"]')
    ).toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect(drawer).toHaveAttribute('data-state', 'open');
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close preview' })
    );
    await expect(drawer).toHaveAttribute('data-state', 'open');
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Finish preview' })
    );
    await waitForDrawerToClose();
  },
};

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `direction` on the root to open the drawer from any edge.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Drawer,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerFooter,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
    },
    setup: () => ({
      directions: ['top', 'right', 'bottom', 'left'] as const,
    }),
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-4">
        <Drawer v-for="direction in directions" :key="direction" :direction="direction">
          <DrawerTrigger as-child>
            <Button variant="outline" class="nx:capitalize">{{ direction }}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle class="nx:capitalize">{{ direction }} drawer</DrawerTitle>
              <DrawerDescription>Slides in from the {{ direction }} edge.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    `,
  }),
};
