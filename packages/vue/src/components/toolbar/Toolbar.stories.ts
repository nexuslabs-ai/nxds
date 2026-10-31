import {
  PhArchive,
  PhArrowUUpLeft,
  PhCaretDown,
  PhCaretLeft,
  PhCaretRight,
  PhDotsThree,
  PhTextB,
  PhTextItalic,
  PhTextUnderline,
  PhX,
} from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { defineComponent, ref, useId } from 'vue';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Label } from '../label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from '.';

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Toolbar groups related controls behind one Tab stop. Arrow keys move between controls, and Home and End jump to the first and last. For actions that each need their own Tab stop, use a row of Buttons.',
          '',
          '- Label the toolbar with `aria-label` or `aria-labelledby`.',
          '- Build it from ToolbarButton, ToolbarLink, ToolbarToggleGroup and ToolbarToggleItem so every control joins the arrow-key order.',
          '- ToolbarButton and ToolbarLink take Button `variant` and `size`, but not `loading`.',
          '- ToolbarButton and ToolbarToggleItem take `#start-icon` and `icon-only`. `icon-only` shows only the icon, and the text stays as the hidden name. `icon-only` ignores `as-child`.',
          '- Use `as-child` to make a toolbar control a menu trigger.',
          '- Keep text fields outside the toolbar, because arrow keys would conflict with typing.',
          '- In narrow containers, controls wrap in DOM order and arrow keys still reach every row.',
          '- Your app owns the commands, selection, visibility and placement.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      PhArrowUUpLeft,
      PhTextB,
      PhTextItalic,
      PhTextUnderline,
      Toolbar,
      ToolbarButton,
      ToolbarLink,
      ToolbarSeparator,
      ToolbarToggleGroup,
      ToolbarToggleItem,
      Tooltip,
      TooltipContent,
      TooltipTrigger,
    },
    setup: () => ({ previewId: useId(), formatting: ref<string[]>([]) }),
    template: `
      <div class="nx:grid nx:gap-4">
        <Toolbar aria-label="Text formatting">
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="nx:inline-flex">
                <ToolbarButton icon-only class="nx:text-muted-foreground" @click="formatting = []">
                  <template #start-icon><PhArrowUUpLeft /></template>Undo formatting</ToolbarButton>
              </span>
            </TooltipTrigger>
            <TooltipContent>Reset formatting</TooltipContent>
          </Tooltip>
          <ToolbarSeparator class="nx:data-[orientation=vertical]:h-4" />
          <ToolbarToggleGroup v-model="formatting" type="multiple" aria-label="Text style">
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="nx:inline-flex">
                  <ToolbarToggleItem value="bold" icon-only>
                    <template #start-icon><PhTextB /></template>Bold</ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="nx:inline-flex">
                  <ToolbarToggleItem value="italic" icon-only>
                    <template #start-icon><PhTextItalic /></template>Italic</ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="nx:inline-flex">
                  <ToolbarToggleItem value="underline" icon-only>
                    <template #start-icon><PhTextUnderline /></template>Underline</ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>
          </ToolbarToggleGroup>
          <ToolbarSeparator class="nx:data-[orientation=vertical]:h-4" />
          <ToolbarLink class="nx:text-muted-foreground" :href="'#' + previewId">Preview</ToolbarLink>
        </Toolbar>
        <p
          :id="previewId"
          class="nx:typography-body-default nx:text-muted-foreground"
          :style="{
            fontWeight: formatting.includes('bold') ? 700 : undefined,
            fontStyle: formatting.includes('italic') ? 'italic' : undefined,
            textDecoration: formatting.includes('underline') ? 'underline' : undefined,
          }"
        >Select formatting to update this preview.</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('group', { name: 'Text style' })
    ).toBeInTheDocument();
    const bold = canvas.getByRole('button', { name: 'Bold' });
    const italic = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.click(bold);
    await userEvent.click(italic);
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('button', { name: 'Underline' })
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('link', { name: 'Preview' })).toHaveFocus();
  },
};

export const FileActions: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Group file actions and move extra ones into a "More" dropdown menu.',
      },
    },
  },
  render: () => ({
    components: {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      PhDotsThree,
      Toolbar,
      ToolbarButton,
      ToolbarGroup,
      ToolbarSeparator,
    },
    template: `
      <Toolbar aria-label="File actions">
        <ToolbarGroup aria-label="Selection actions">
          <ToolbarButton variant="outline">Download</ToolbarButton>
          <ToolbarButton>Move</ToolbarButton>
          <ToolbarButton disabled>Share</ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <ToolbarButton icon-only>
              <template #start-icon><PhDotsThree /></template>More file actions</ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Move' }));
    await userEvent.keyboard('{ArrowRight}');
    const trigger = canvas.getByRole('button', { name: 'More file actions' });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByRole('menuitem', { name: 'Rename' })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Calendar: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Pair previous and next buttons with a single-select view switcher.',
      },
    },
  },
  render: () => ({
    components: {
      PhCaretLeft,
      PhCaretRight,
      Toolbar,
      ToolbarButton,
      ToolbarGroup,
      ToolbarToggleGroup,
      ToolbarToggleItem,
    },
    setup: () => ({ view: ref('week') }),
    template: `
      <Toolbar aria-label="Calendar controls">
        <ToolbarGroup aria-label="Date navigation">
          <ToolbarButton icon-only>
            <template #start-icon><PhCaretLeft /></template>Previous period</ToolbarButton>
          <ToolbarButton>Today</ToolbarButton>
          <ToolbarButton icon-only>
            <template #start-icon><PhCaretRight /></template>Next period</ToolbarButton>
        </ToolbarGroup>
        <ToolbarToggleGroup
          class="nx:ms-auto"
          type="single"
          :model-value="view"
          aria-label="Calendar view"
          @update:model-value="(value) => value && (view = value)"
        >
          <ToolbarToggleItem value="day">Day</ToolbarToggleItem>
          <ToolbarToggleItem value="week">Week</ToolbarToggleItem>
          <ToolbarToggleItem value="month">Month</ToolbarToggleItem>
        </ToolbarToggleGroup>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radiogroup', { name: 'Calendar view' })
    ).toBeInTheDocument();
    const month = canvas.getByRole('radio', { name: 'Month' });
    const unselectedWidth = month.getBoundingClientRect().width;
    await userEvent.click(month);
    await expect(month).toHaveAttribute('aria-checked', 'true');
    await expect(month.getBoundingClientRect().width).toBe(unselectedWidth);
    await expect(canvas.getByRole('radio', { name: 'Week' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  },
};

const onSave = fn();
export const KeyboardAndDisabled: Story = {
  beforeEach: () => onSave.mockClear(),
  render: () => ({
    components: { Button, Toolbar, ToolbarButton },
    setup: () => ({ onSave }),
    template: `
      <div class="nx:grid nx:gap-4">
        <Button variant="outline">Before toolbar</Button>
        <Toolbar aria-label="Document actions" data-testid="document-toolbar">
          <ToolbarButton>First</ToolbarButton>
          <ToolbarButton disabled @click="onSave">Unavailable</ToolbarButton>
          <ToolbarButton @click="onSave">Save</ToolbarButton>
        </Toolbar>
        <Button variant="outline">After toolbar</Button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'First' });
    const save = canvas.getByRole('button', { name: 'Save' });
    await expect(canvas.getByTestId('document-toolbar')).toHaveAttribute(
      'data-slot',
      'toolbar'
    );
    await expect(save).toHaveAttribute('data-size', 'sm');
    await expect(
      canvas.getByRole('button', { name: 'Unavailable' })
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Before toolbar' })
    );
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(save).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onSave).toHaveBeenCalledOnce();
    await userEvent.keyboard('{ArrowRight}');
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(save).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(first).toHaveFocus();
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'After toolbar' })
    ).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(first).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(
      canvas.getByRole('button', { name: 'Before toolbar' })
    ).toHaveFocus();
  },
};

export const Vertical: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `orientation="vertical"` to stack the controls in a column.',
      },
    },
  },
  render: () => ({
    components: { Toolbar, ToolbarButton, ToolbarSeparator },
    template: `
      <Toolbar orientation="vertical" aria-label="Drawing actions">
        <ToolbarButton>Select</ToolbarButton>
        <ToolbarButton>Draw</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton>Erase</ToolbarButton>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: 'Draw' })).toHaveFocus();
    const first = canvas
      .getByRole('button', { name: 'Select' })
      .getBoundingClientRect();
    const second = canvas
      .getByRole('button', { name: 'Draw' })
      .getBoundingClientRect();
    await expect(second.top).toBeGreaterThanOrEqual(first.bottom);
    await expect(
      canvasElement.querySelector('[data-slot="toolbar-separator"]')
    ).toHaveAttribute('data-orientation', 'horizontal');
  },
};

export const RightToLeft: Story = {
  render: () => ({
    components: { Toolbar, ToolbarButton },
    template: `
      <Toolbar dir="rtl" aria-label="RTL actions" :loop="false">
        <ToolbarButton>First</ToolbarButton>
        <ToolbarButton>Second</ToolbarButton>
        <ToolbarButton>Last</ToolbarButton>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'First' }));
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: 'Second' })).toHaveFocus();
    await userEvent.keyboard('{End}{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: 'Last' })).toHaveFocus();
  },
};

export const NarrowContainer: Story = {
  render: () => ({
    components: { Toolbar, ToolbarButton },
    template: `
      <div class="nx:w-full" :style="{ maxWidth: '240px' }">
        <Toolbar aria-label="Narrow actions">
          <ToolbarButton variant="outline">Download files</ToolbarButton>
          <ToolbarButton>Move files</ToolbarButton>
          <ToolbarButton>Archive files</ToolbarButton>
          <ToolbarButton>Duplicate files</ToolbarButton>
        </Toolbar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar');
    const first = canvas.getByRole('button', { name: 'Download files' });
    const last = canvas.getByRole('button', { name: 'Duplicate files' });
    await expect(toolbar.scrollWidth).toBeLessThanOrEqual(
      toolbar.clientWidth + 1
    );
    await expect(last.getBoundingClientRect().top).toBeGreaterThan(
      first.getBoundingClientRect().top
    );
    await userEvent.click(first);
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    await expect(last).toHaveFocus();
  },
};

// A standalone Toolbar opens its tooltips after Reka's default 700ms. Opening
// within 300ms proves the Toolbar joined the outer provider's group.
export const InsideTooltipProvider: Story = {
  render: () => ({
    components: {
      PhTextB,
      Toolbar,
      ToolbarButton,
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
    },
    template: `
      <TooltipProvider :delay-duration="0">
        <Toolbar aria-label="Text formatting">
          <Tooltip>
            <TooltipTrigger as-child>
              <ToolbarButton icon-only>
                <template #start-icon><PhTextB /></template>Bold</ToolbarButton>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
        </Toolbar>
      </TooltipProvider>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('button', { name: 'Bold' }));
    await waitFor(
      async () => {
        await expect(
          within(document.body).getByRole('tooltip', { name: 'Bold' })
        ).toBeVisible();
      },
      { timeout: 300 }
    );
  },
};

export const Sizes: Story = {
  render: () => ({
    components: {
      Toolbar,
      ToolbarButton,
      ToolbarToggleGroup,
      ToolbarToggleItem,
    },
    setup: () => ({ sizes: ['sm', 'default', 'lg'] as const }),
    template: `
      <div class="nx:grid nx:gap-4">
        <Toolbar v-for="size in sizes" :key="size" :aria-label="size + ' controls'">
          <ToolbarButton :size="size">Action</ToolbarButton>
          <ToolbarToggleGroup type="multiple" aria-label="Formatting">
            <ToolbarToggleItem value="bold" :size="size">Bold</ToolbarToggleItem>
          </ToolbarToggleGroup>
        </Toolbar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const toolbar of within(canvasElement).getAllByRole('toolbar', {
      name: /controls$/,
    })) {
      const button = within(toolbar).getByRole('button', { name: 'Action' });
      const toggle = within(toolbar).getByRole('button', { name: 'Bold' });
      await expect(toggle.getBoundingClientRect().height).toBe(
        button.getBoundingClientRect().height
      );
      await expect(getComputedStyle(toggle).fontSize).toBe(
        getComputedStyle(button).fontSize
      );
    }
  },
};

export const IconOnly: Story = {
  render: () => ({
    components: {
      PhArrowUUpLeft,
      PhTextB,
      Toolbar,
      ToolbarButton,
      ToolbarToggleGroup,
      ToolbarToggleItem,
    },
    template: `
      <Toolbar aria-label="Text formatting">
        <ToolbarButton icon-only>
          <template #start-icon><PhArrowUUpLeft /></template>Undo formatting</ToolbarButton>
        <ToolbarToggleGroup type="multiple" aria-label="Formatting">
          <ToolbarToggleItem value="bold" icon-only>
            <template #start-icon><PhTextB /></template>Bold</ToolbarToggleItem>
        </ToolbarToggleGroup>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar', {
      name: 'Text formatting',
    });
    for (const name of ['Undo formatting', 'Bold']) {
      const button = within(toolbar).getByRole('button', { name });
      const { width, height } = button.getBoundingClientRect();
      await expect(width).toBe(height);
      await expect(within(button).getByText(name)).toHaveClass('nx:sr-only');
    }
  },
};

export const StartIcon: Story = {
  render: () => ({
    components: {
      PhArrowUUpLeft,
      PhTextB,
      Toolbar,
      ToolbarButton,
      ToolbarToggleGroup,
      ToolbarToggleItem,
    },
    template: `
      <Toolbar aria-label="Text formatting">
        <ToolbarButton>
          <template #start-icon><PhArrowUUpLeft /></template>Undo formatting</ToolbarButton>
        <ToolbarToggleGroup type="multiple" aria-label="Formatting">
          <ToolbarToggleItem value="bold">
            <template #start-icon><PhTextB /></template>Bold</ToolbarToggleItem>
        </ToolbarToggleGroup>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar', {
      name: 'Text formatting',
    });
    for (const name of ['Undo formatting', 'Bold']) {
      const button = within(toolbar).getByRole('button', { name });
      await expect(
        button.querySelector('[aria-hidden="true"] svg')
      ).not.toBeNull();
      await expect(button.querySelector('.nx\\:sr-only')).toBeNull();
    }
  },
};

export const DisabledToggles: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Disable a toggle group while the rest of the toolbar stays usable.',
      },
    },
  },
  render: () => ({
    components: {
      Toolbar,
      ToolbarButton,
      ToolbarToggleGroup,
      ToolbarToggleItem,
    },
    template: `
      <Toolbar aria-label="Formatting availability">
        <ToolbarButton>Undo</ToolbarButton>
        <ToolbarToggleGroup type="multiple" disabled aria-label="Unavailable formatting">
          <ToolbarToggleItem value="bold">Bold</ToolbarToggleItem>
          <ToolbarToggleItem value="italic">Italic</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarButton>Preview</ToolbarButton>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Bold' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Preview' })).toHaveFocus();
  },
};

const InlineExample = defineComponent({
  components: {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    PhCaretDown,
    Toolbar,
    ToolbarButton,
    ToolbarToggleGroup,
    ToolbarToggleItem,
  },
  setup: () => ({ view: ref('all') }),
  template: `
    <section class="nx:grid nx:gap-4">
      <div>
        <h2 class="nx:typography-heading-small">Documents</h2>
        <p class="nx:typography-body-default nx:text-muted-foreground">Keep your working files close at hand.</p>
      </div>
      <Toolbar
        aria-label="Document view"
        class="nx:w-full nx:rounded-none nx:border-0 nx:border-b-default nx:shadow-none nx:bg-transparent nx:p-0 nx:pb-3"
      >
        <ToolbarToggleGroup
          type="single"
          :model-value="view"
          aria-label="Show documents"
          @update:model-value="(value) => value && (view = value)"
        >
          <ToolbarToggleItem value="all">All documents</ToolbarToggleItem>
          <ToolbarToggleItem value="recent">Recent</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <ToolbarButton class="nx:ms-auto">Show <PhCaretDown aria-hidden="true" /></ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @select="view = 'all'">All documents</DropdownMenuItem>
            <DropdownMenuItem @select="view = 'recent'">Recent documents</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Toolbar>
      <ul class="nx:grid nx:gap-3 nx:typography-body-default">
        <li>Project brief <span class="nx:text-muted-foreground">· Today</span></li>
        <li v-if="view === 'all'">Research notes <span class="nx:text-muted-foreground">· Last week</span></li>
      </ul>
    </section>
  `,
});

export const Inline: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Restyle the toolbar as a flush row above a list, with a view filter.',
      },
    },
  },
  render: () => InlineExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Recent' }));
    await expect(
      canvas.queryByText('Research notes', { exact: false })
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('radio', { name: 'All documents' }));
    await expect(
      canvas.getByText('Research notes', { exact: false })
    ).toBeVisible();
  },
};

const AttachedExample = defineComponent({
  components: {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    PhCaretDown,
    Toolbar,
    ToolbarButton,
    ToolbarSeparator,
    ToolbarToggleGroup,
    ToolbarToggleItem,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  },
  setup: () => ({
    formatting: ref<string[]>([]),
    text: ref('Good tools stay close to the work. Draft your next idea here.'),
  }),
  template: `
    <section class="nx:grid nx:gap-3">
      <h2 class="nx:typography-heading-small">Draft a note</h2>
      <div class="nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container">
        <Toolbar
          aria-label="Note formatting"
          class="nx:w-full nx:rounded-none nx:rounded-t-lg nx:border-0 nx:border-b-default nx:border-border-default nx:shadow-none nx:bg-background nx:p-2"
        >
          <ToolbarToggleGroup v-model="formatting" type="multiple" aria-label="Note style">
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="nx:inline-flex">
                  <ToolbarToggleItem value="bold" icon-only>
                    <template #start-icon><span class="nx:font-bold">B</span></template>Bold note</ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="nx:inline-flex">
                  <ToolbarToggleItem value="italic" icon-only>
                    <template #start-icon><span class="nx:italic">I</span></template>Italic note</ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <span class="nx:inline-flex">
                  <ToolbarToggleItem value="underline" icon-only>
                    <template #start-icon><span class="nx:underline">U</span></template>Underline note</ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <ToolbarButton>More <PhCaretDown aria-hidden="true" /></ToolbarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @select="formatting = []">Clear formatting</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>
        <textarea
          v-model="text"
          aria-label="Note"
          class="nx:block nx:min-h-32 nx:w-full nx:resize-y nx:rounded-b-lg nx:bg-transparent nx:p-4 nx:typography-body-default nx:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
          :style="{
            fontWeight: formatting.includes('bold') ? 700 : undefined,
            fontStyle: formatting.includes('italic') ? 'italic' : undefined,
            textDecoration: formatting.includes('underline') ? 'underline' : undefined,
          }"
        />
      </div>
      <p class="nx:typography-body-small nx:text-muted-foreground">Formatting applies to the whole note.</p>
    </section>
  `,
});

export const Attached: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Attach the toolbar to the top of a note field to format its text.',
      },
    },
  },
  render: () => AttachedExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Bold note' }));
    await expect(
      canvas.getByRole('button', { name: 'Bold note' })
    ).toHaveAttribute('data-state', 'on');
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toHaveStyle({
      fontWeight: '700',
    });
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole('menuitem', {
        name: 'Clear formatting',
      })
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Bold note' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Note' }),
      ' Ready.'
    );
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toHaveValue(
      'Good tools stay close to the work. Draft your next idea here. Ready.'
    );
  },
};

const SelectionExample = defineComponent({
  components: {
    Checkbox,
    PhArchive,
    PhX,
    Label,
    Toolbar,
    ToolbarButton,
    ToolbarSeparator,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  },
  setup() {
    const selectionId = useId();
    const files = ['Project brief', 'Research notes', 'Launch checklist'];
    const selected = ref<string[]>(['Project brief', 'Research notes']);
    const archived = ref<string[]>([]);
    const message = ref('');
    const heading = ref<HTMLElement | null>(null);
    function clearSelection() {
      selected.value = [];
      document.getElementById(`${selectionId}-0`)?.focus();
    }
    function archiveSelection() {
      const count = selected.value.length;
      message.value = `${count} document${count === 1 ? '' : 's'} archived.`;
      archived.value = [...archived.value, ...selected.value];
      selected.value = [];
      heading.value?.focus();
    }
    function toggleSelection(name: string, checked: boolean | 'indeterminate') {
      selected.value =
        checked === true
          ? [...selected.value, name]
          : selected.value.filter((item) => item !== name);
      message.value = '';
    }
    return {
      selectionId,
      files,
      selected,
      archived,
      message,
      heading,
      clearSelection,
      archiveSelection,
      toggleSelection,
    };
  },
  template: `
    <section class="nx:grid nx:gap-4">
      <div>
        <h2 ref="heading" tabindex="-1" class="nx:typography-heading-small nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default">Select documents</h2>
        <p class="nx:typography-body-default nx:text-muted-foreground">Actions appear when documents are selected.</p>
      </div>
      <div class="nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-3">
        <Label
          v-for="(name, index) in files.filter((file) => !archived.includes(file))"
          :key="name"
          :for="selectionId + '-' + index"
          class="nx:flex nx:min-h-10 nx:cursor-pointer nx:items-center nx:gap-3 nx:px-2 nx:typography-body-default"
        >
          <Checkbox
            :id="selectionId + '-' + index"
            :model-value="selected.includes(name)"
            @update:model-value="(checked) => toggleSelection(name, checked)"
          />{{ name }}</Label>
        <p v-if="archived.length === files.length" class="nx:p-2 nx:typography-body-default nx:text-muted-foreground">No documents remaining.</p>
      </div>
      <div class="nx:flex nx:min-h-16 nx:justify-center">
        <Toolbar
          v-if="selected.length > 0"
          aria-label="Selected document actions"
          class="nx:h-fit nx:justify-center nx:gap-0 nx:bg-popover nx:p-0"
        >
          <Tooltip>
            <TooltipTrigger as-child>
              <ToolbarButton
                icon-only
                class="nx:text-muted-foreground"
                @click="clearSelection"
              >
                <template #start-icon><PhX /></template>Clear selection</ToolbarButton>
            </TooltipTrigger>
            <TooltipContent>Clear selection</TooltipContent>
          </Tooltip>
          <span class="nx:px-2 nx:typography-label-default nx:whitespace-nowrap" aria-live="polite">{{ selected.length }} selected</span>
          <ToolbarSeparator class="nx:self-stretch nx:data-[orientation=vertical]:h-auto" />
          <ToolbarButton @click="archiveSelection">
            <PhArchive aria-hidden="true" />Archive</ToolbarButton>
        </Toolbar>
      </div>
      <p role="status" class="nx:typography-body-small nx:text-muted-foreground">{{ message }}</p>
    </section>
  `,
});

export const Selection: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show an action bar for the documents a user has selected.',
      },
    },
  },
  render: () => SelectionExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' })
    );
    await expect(canvas.queryByRole('toolbar')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('checkbox', { name: 'Project brief' })
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Archive' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '1 document archived.'
    );
    await expect(canvas.queryByRole('toolbar')).not.toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AttachedExample, InlineExample, SelectionExample },
    template: `
      <div class="nx:grid nx:gap-10">
        <InlineExample />
        <AttachedExample />
        <SelectionExample />
      </div>
    `,
  }),
};
