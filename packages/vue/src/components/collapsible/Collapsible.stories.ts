import { PhCaretUpDown } from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

import { Button } from '../button';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '.';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          'Collapsible shows and hides one content region. Use it for a single expandable section. For a stacked set of sections, use Accordion.',
      },
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

const collapsibleComponents = {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
};

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      Collapsible,
      CollapsibleContent,
      CollapsibleTrigger,
      PhCaretUpDown,
    },
    template: `
      <Collapsible class="nx:flex nx:w-72 nx:flex-col">
        <div class="nx:flex nx:flex-col nx:gap-2">
          <div class="nx:flex nx:items-center nx:justify-between nx:gap-4">
            <span class="nx:typography-label-default nx:text-foreground">@nxds starred 3 repositories</span>
            <CollapsibleTrigger as-child>
              <Button variant="ghost" size="sm" aria-label="Toggle repositories">
                <PhCaretUpDown />
              </Button>
            </CollapsibleTrigger>
          </div>
          <div class="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">@radix-ui/react-collapsible</div>
        </div>
        <CollapsibleContent>
          <div class="nx:mt-2 nx:flex nx:flex-col nx:gap-2">
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">@radix-ui/react-toggle</div>
            <div class="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">@radix-ui/react-slider</div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    `,
  }),
};

export const Open: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `default-open` to show the content on first render.',
      },
    },
  },
  render: () => ({
    components: { Button, Collapsible, CollapsibleContent, CollapsibleTrigger },
    template: `
      <Collapsible default-open class="nx:flex nx:w-72 nx:flex-col">
        <CollapsibleTrigger as-child>
          <Button variant="outline">Toggle details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-muted-foreground">Revealed content shown while open.</div>
        </CollapsibleContent>
      </Collapsible>
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `disabled` so the trigger cannot toggle the content.',
      },
    },
  },
  render: () => ({
    components: { Button, Collapsible, CollapsibleContent, CollapsibleTrigger },
    template: `
      <Collapsible disabled class="nx:flex nx:w-72 nx:flex-col">
        <CollapsibleTrigger as-child>
          <Button variant="outline">Toggle details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">Unreachable while disabled.</div>
        </CollapsibleContent>
      </Collapsible>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

// Behaviour stories: tests and Storybook only.

export const ClickInteraction: Story = {
  args: { 'onUpdate:open': fn() },
  render: (args) => ({
    components: collapsibleComponents,
    setup: () => ({ args }),
    template: `
      <Collapsible v-bind="args" class="nx:flex nx:w-72 nx:flex-col">
        <CollapsibleTrigger as-child>
          <Button variant="outline">Toggle details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">Now you see me.</div>
        </CollapsibleContent>
      </Collapsible>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(args['onUpdate:open']).toHaveBeenCalledWith(true);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Now you see me.')).toBeVisible();
  },
};

export const KeyboardInteraction: Story = {
  args: { 'onUpdate:open': fn() },
  render: (args) => ({
    components: collapsibleComponents,
    setup: () => ({ args }),
    template: `
      <Collapsible v-bind="args" class="nx:flex nx:w-72 nx:flex-col">
        <CollapsibleTrigger as-child>
          <Button variant="outline">Toggle details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">Keyboard-revealed content.</div>
        </CollapsibleContent>
      </Collapsible>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args['onUpdate:open']).toHaveBeenCalledWith(true);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const DisabledInteraction: Story = {
  args: { 'onUpdate:open': fn() },
  render: (args) => ({
    components: collapsibleComponents,
    setup: () => ({ args }),
    template: `
      <Collapsible v-bind="args" disabled class="nx:flex nx:w-72 nx:flex-col">
        <CollapsibleTrigger as-child>
          <Button variant="outline">Toggle details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">Unreachable while disabled.</div>
        </CollapsibleContent>
      </Collapsible>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    // user-event refuses to click through `pointer-events: none`, so the check is
    // bypassed to prove the disabled trigger ignores the click itself.
    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(args['onUpdate:open']).not.toHaveBeenCalled();
  },
};

export const VModel: Story = {
  render: () => ({
    components: collapsibleComponents,
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="nx:flex nx:w-72 nx:flex-col nx:gap-2">
        <Collapsible v-model:open="open" class="nx:flex nx:flex-col">
          <CollapsibleTrigger as-child>
            <Button variant="outline">Toggle details</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="nx:mt-2">Bound content.</div>
          </CollapsibleContent>
        </Collapsible>
        <Button variant="ghost" @click="open = false">Close from outside</Button>
        <p data-testid="open-state">{{ open ? 'open' : 'closed' }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    await userEvent.click(trigger);
    await expect(canvas.getByTestId('open-state')).toHaveTextContent('open');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close from outside' })
    );
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByTestId('open-state')).toHaveTextContent('closed');
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: collapsibleComponents,
    template: `
      <Collapsible default-open class="nx:flex nx:w-72 nx:flex-col">
        <CollapsibleTrigger as-child>
          <Button variant="outline">Toggle details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="nx:mt-2">Content</div>
        </CollapsibleContent>
      </Collapsible>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="collapsible"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="collapsible-trigger"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="collapsible-content"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="collapsible-content"]')
    ).toHaveClass('nx:duration-default');
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: collapsibleComponents,
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <Collapsible class="nx:flex nx:w-64 nx:flex-col">
          <CollapsibleTrigger as-child>
            <Button variant="outline">Closed by default</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-muted-foreground">Hidden until toggled.</div>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible default-open class="nx:flex nx:w-64 nx:flex-col">
          <CollapsibleTrigger as-child>
            <Button variant="outline">Open by default</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-muted-foreground">Visible on first render.</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    `,
  }),
};
