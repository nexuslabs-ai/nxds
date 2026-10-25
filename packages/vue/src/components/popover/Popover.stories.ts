import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useId } from 'vue';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
  expectPlacedBelow,
} from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';

import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '.';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Popover opens a floating panel next to a trigger. Use it for short forms and extra controls. For a hover hint, use Tooltip, and for a list of actions, use DropdownMenu.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Button, Popover, PopoverContent, PopoverTrigger },
    template: `
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p class="nx:typography-body-default nx:text-muted-foreground">Place content for the popover here.</p>
        </PopoverContent>
      </Popover>
    `,
  }),
};

export const WithForm: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put a small form with labelled inputs inside the popover.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Input,
      Label,
      Popover,
      PopoverContent,
      PopoverTrigger,
    },
    setup: () => ({ widthId: useId(), maxWidthId: useId() }),
    template: `
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline">Set dimensions</Button>
        </PopoverTrigger>
        <PopoverContent class="nx:w-80">
          <div class="nx:flex nx:flex-col nx:gap-4">
            <div class="nx:flex nx:flex-col nx:gap-1.5">
              <h4 class="nx:typography-label-default nx:leading-none">Dimensions</h4>
              <p class="nx:typography-body-default nx:text-muted-foreground">Set the dimensions for the layer.</p>
            </div>
            <div class="nx:flex nx:flex-col nx:gap-2">
              <div class="nx:grid nx:grid-cols-3 nx:items-center nx:gap-4">
                <Label :for="widthId">Width</Label>
                <Input :id="widthId" default-value="100%" class="nx:col-span-2" />
              </div>
              <div class="nx:grid nx:grid-cols-3 nx:items-center nx:gap-4">
                <Label :for="maxWidthId">Max. width</Label>
                <Input :id="maxWidthId" default-value="300px" class="nx:col-span-2" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    `,
  }),
};

export const Placements: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `side` and `align` on PopoverContent to place it around the trigger.',
      },
    },
  },
  render: () => ({
    components: { Button, Popover, PopoverContent, PopoverTrigger },
    setup: () => ({
      sides: ['top', 'right', 'bottom', 'left'] as const,
      aligns: ['start', 'center', 'end'] as const,
    }),
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-4">
        <Popover v-for="side in sides" :key="side">
          <PopoverTrigger as-child>
            <Button variant="outline">side: {{ side }}</Button>
          </PopoverTrigger>
          <PopoverContent :side="side">
            <p class="nx:typography-body-default">Opens on {{ side }}.</p>
          </PopoverContent>
        </Popover>
        <Popover v-for="align in aligns" :key="align">
          <PopoverTrigger as-child>
            <Button variant="outline">align: {{ align }}</Button>
          </PopoverTrigger>
          <PopoverContent :align="align">
            <p class="nx:typography-body-default">Aligned {{ align }}.</p>
          </PopoverContent>
        </Popover>
      </div>
    `,
  }),
};

export const WithAnchor: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Wrap another element in PopoverAnchor to position the popover against it instead of the trigger.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Popover,
      PopoverAnchor,
      PopoverContent,
      PopoverTrigger,
    },
    template: `
      <Popover>
        <PopoverAnchor as-child>
          <div class="nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:p-container nx:typography-label-default nx:text-muted-foreground">The popover positions against this anchor box.</div>
        </PopoverAnchor>
        <div class="nx:mt-4">
          <PopoverTrigger as-child>
            <Button variant="outline">Toggle popover</Button>
          </PopoverTrigger>
        </div>
        <PopoverContent>
          <p class="nx:typography-body-default">Positioned relative to the anchor box, not the trigger button.</p>
        </PopoverContent>
      </Popover>
    `,
  }),
};

// ============================================
// INTERACTION TESTS
// ============================================

const basicPopover = () => ({
  components: { Button, Popover, PopoverContent, PopoverTrigger },
  template: `
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p class="nx:typography-body-default">Popover content</p>
      </PopoverContent>
    </Popover>
  `,
});

export const OpenCloseInteraction: Story = {
  render: basicPopover,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });

    await userEvent.click(trigger);
    const content = await within(document.body).findByText('Popover content');
    const panel = content.closest('[data-slot="popover-content"]');

    await waitFor(() => expect(content).toBeVisible());
    await expectInterruptibleOverlayMotion(panel);
    await expectPlacedBelow(panel, trigger);

    await userEvent.keyboard('{Escape}');
    await expectExitBeforeUnmount(panel);
    await expect(trigger).toHaveFocus();
  },
};

export const WithDataAttributes: Story = {
  render: basicPopover,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });

    // Open the popover, then assert the content's data-slot hook
    await userEvent.click(trigger);
    await waitFor(() => {
      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toBeInTheDocument();
    });

    // Clean up so the portal doesn't leak into sibling stories
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="popover-content"]')
      ).toBeNull();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { Button, Popover, PopoverContent, PopoverTrigger },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">Trigger Variants</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
            <Popover v-for="[variant, label] in [['outline', 'Outline trigger'], ['secondary', 'Secondary trigger'], ['ghost', 'Ghost trigger']]" :key="variant">
              <PopoverTrigger as-child>
                <Button :variant="variant">{{ label }}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p class="nx:typography-body-default">Popover content</p>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <h3 class="nx:text-foreground nx:mb-4 nx:typography-label-default">Placements</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
            <Popover v-for="[side, label] in [['top', 'Top'], ['right', 'Right'], ['bottom', 'Bottom'], ['left', 'Left']]" :key="side">
              <PopoverTrigger as-child>
                <Button variant="outline">{{ label }}</Button>
              </PopoverTrigger>
              <PopoverContent :side="side">
                <p class="nx:typography-body-default">{{ label }}</p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
};
