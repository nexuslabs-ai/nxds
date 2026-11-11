import * as React from 'react';

import {
  ArchiveIcon,
  ArrowUUpLeftIcon,
  CursorIcon,
  EraserIcon,
  PencilSimpleIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@phosphor-icons/react/ssr';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconX,
} from '../../lib/icons';
import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu';
import { Hide } from '../hide/hide';
import { Label } from '../label/label';
import { Show } from '../show/show';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip/tooltip';

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarTool,
  ToolbarToolGroup,
  ToolbarToolPanel,
} from './toolbar';

const meta: Meta<typeof Toolbar> = {
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
          '- For tools with options, use ToolbarToolGroup, ToolbarTool and ToolbarToolPanel. Choosing another tool swaps the open panel. Escape returns focus to the tool.',
          '- ToolbarButton and ToolbarLink take Button `variant` and `size`, but not `loading` or icon slots.',
          '- Use `variant="floating"` for a toolbar that sits over content, like a canvas.',
          '- Use `asChild` to make a toolbar control a menu trigger.',
          '- Keep text fields outside the toolbar, because arrow keys would conflict with typing.',
          '- In narrow containers, controls wrap in DOM order and arrow keys still reach every row.',
          '- Your app owns the commands, selection, visibility and placement.',
        ].join('\n'),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

function EditorToolbar() {
  const previewId = React.useId();
  const [formatting, setFormatting] = React.useState<string[]>([]);
  return (
    <div className="nx:grid nx:gap-4">
      <Toolbar aria-label="Text formatting">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="nx:inline-flex">
              <ToolbarButton
                size="icon-sm"
                aria-label="Undo formatting"
                onClick={() => setFormatting([])}
                className="nx:text-muted-foreground"
              >
                <ArrowUUpLeftIcon aria-hidden="true" />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>Reset formatting</TooltipContent>
        </Tooltip>
        <ToolbarSeparator className="nx:data-[orientation=vertical]:h-4" />
        <ToolbarToggleGroup
          type="multiple"
          value={formatting}
          onValueChange={setFormatting}
          aria-label="Text style"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                <ToolbarToggleItem
                  value="bold"
                  aria-label="Bold"
                  size="icon-sm"
                >
                  <TextBIcon aria-hidden="true" />
                </ToolbarToggleItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                <ToolbarToggleItem
                  value="italic"
                  aria-label="Italic"
                  size="icon-sm"
                >
                  <TextItalicIcon aria-hidden="true" />
                </ToolbarToggleItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                <ToolbarToggleItem
                  value="underline"
                  aria-label="Underline"
                  size="icon-sm"
                >
                  <TextUnderlineIcon aria-hidden="true" />
                </ToolbarToggleItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
        </ToolbarToggleGroup>
        <ToolbarSeparator className="nx:data-[orientation=vertical]:h-4" />
        <ToolbarLink
          className="nx:text-muted-foreground"
          href={`#${previewId}`}
        >
          Preview
        </ToolbarLink>
      </Toolbar>
      <p
        id={previewId}
        className="nx:typography-body-default nx:text-muted-foreground"
        style={{
          fontWeight: formatting.includes('bold') ? 700 : undefined,
          fontStyle: formatting.includes('italic') ? 'italic' : undefined,
          textDecoration: formatting.includes('underline')
            ? 'underline'
            : undefined,
        }}
      >
        Select formatting to update this preview.
      </p>
    </div>
  );
}

export const Default: Story = {
  tags: ['docs'],
  render: () => <EditorToolbar />,
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

function FileToolbar() {
  return (
    <Toolbar aria-label="File actions">
      <ToolbarGroup aria-label="Selection actions">
        <ToolbarButton variant="outline">Download</ToolbarButton>
        <ToolbarButton>Move</ToolbarButton>
        <ToolbarButton disabled>Share</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton size="icon-sm" aria-label="More file actions">
            <IconDots />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Toolbar>
  );
}

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
  render: () => <FileToolbar />,
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

function CalendarToolbar() {
  const [view, setView] = React.useState('week');
  function handleViewChange(value: string) {
    if (value) setView(value);
  }
  return (
    <Toolbar aria-label="Calendar controls">
      <ToolbarGroup aria-label="Date navigation">
        <ToolbarButton size="icon-sm" aria-label="Previous period">
          <IconChevronLeft />
        </ToolbarButton>
        <ToolbarButton>Today</ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Next period">
          <IconChevronRight />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarToggleGroup
        className="nx:ms-auto"
        type="single"
        value={view}
        onValueChange={handleViewChange}
        aria-label="Calendar view"
      >
        <ToolbarToggleItem value="day">Day</ToolbarToggleItem>
        <ToolbarToggleItem value="week">Week</ToolbarToggleItem>
        <ToolbarToggleItem value="month">Month</ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  );
}

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
  render: () => <CalendarToolbar />,
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
  render: () => (
    <div className="nx:grid nx:gap-4">
      <Button variant="outline">Before toolbar</Button>
      <Toolbar aria-label="Document actions" data-testid="document-toolbar">
        <ToolbarButton>First</ToolbarButton>
        <ToolbarButton disabled onClick={onSave}>
          Unavailable
        </ToolbarButton>
        <ToolbarButton onClick={onSave}>Save</ToolbarButton>
      </Toolbar>
      <Button variant="outline">After toolbar</Button>
    </div>
  ),
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
  render: () => (
    <Toolbar orientation="vertical" aria-label="Drawing actions">
      <ToolbarButton>Select</ToolbarButton>
      <ToolbarButton>Draw</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>Erase</ToolbarButton>
    </Toolbar>
  ),
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
  render: () => (
    <Toolbar dir="rtl" aria-label="RTL actions" loop={false}>
      <ToolbarButton>First</ToolbarButton>
      <ToolbarButton>Second</ToolbarButton>
      <ToolbarButton>Last</ToolbarButton>
    </Toolbar>
  ),
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
  render: () => (
    <div className="nx:w-full" style={{ maxWidth: 240 }}>
      <Toolbar aria-label="Narrow actions">
        <ToolbarButton variant="outline">Download files</ToolbarButton>
        <ToolbarButton>Move files</ToolbarButton>
        <ToolbarButton>Archive files</ToolbarButton>
        <ToolbarButton>Duplicate files</ToolbarButton>
      </Toolbar>
    </div>
  ),
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

// A standalone Toolbar opens its tooltips after Radix's default 700ms. Opening
// within 300ms proves the Toolbar joined the outer provider's group.
export const InsideTooltipProvider: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Toolbar aria-label="Text formatting">
        <Tooltip>
          <TooltipTrigger asChild>
            <ToolbarButton size="icon-sm" aria-label="Bold">
              <TextBIcon aria-hidden="true" />
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
      </Toolbar>
    </TooltipProvider>
  ),
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
  render: () => (
    <div className="nx:grid nx:gap-4">
      {(
        [
          ['sm', 'icon-sm'],
          ['default', 'icon'],
          ['lg', 'icon-lg'],
        ] as const
      ).map(([size, iconSize]) => (
        <Toolbar key={size} aria-label={size + ' controls'}>
          <ToolbarButton size={size}>Action</ToolbarButton>
          <ToolbarToggleGroup type="multiple" aria-label="Formatting">
            <ToolbarToggleItem value="bold" size={size}>
              Bold
            </ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton size={iconSize} aria-label="Undo">
            <ArrowUUpLeftIcon aria-hidden="true" />
          </ToolbarButton>
        </Toolbar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const separators: number[] = [];
    for (const toolbar of within(canvasElement).getAllByRole('toolbar', {
      name: /controls$/,
    })) {
      const bar = within(toolbar);
      const button = bar.getByRole('button', { name: 'Action' });
      const toggle = bar.getByRole('button', { name: 'Bold' });
      const undo = bar.getByRole('button', { name: 'Undo' });
      const height = button.getBoundingClientRect().height;
      await expect(toggle.getBoundingClientRect().height).toBe(height);
      await expect(undo.getBoundingClientRect().height).toBe(height);
      await expect(getComputedStyle(toggle).fontSize).toBe(
        getComputedStyle(button).fontSize
      );
      const separator = bar.getByRole('separator').getBoundingClientRect();
      await expect(separator.height).toBeLessThan(height);
      separators.push(separator.height);
    }
    await expect(separators[0]).toBeLessThan(separators[2] ?? 0);
  },
};

export const Floating: Story = {
  tags: ['docs'],
  render: () => (
    <div className="nx:flex nx:min-h-40 nx:items-end nx:justify-center">
      <Toolbar variant="floating" aria-label="Canvas">
        <ToolbarToolGroup aria-label="Drawing tools" defaultValue="select">
          <ToolbarTool value="select" size="icon-sm" aria-label="Select">
            <CursorIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="draw" size="icon-sm" aria-label="Draw">
            <PencilSimpleIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="erase" size="icon-sm" aria-label="Erase">
            <EraserIcon aria-hidden="true" />
          </ToolbarTool>
        </ToolbarToolGroup>
        <ToolbarSeparator />
        <ToolbarButton size="icon-sm" aria-label="Undo">
          <ArrowUUpLeftIcon aria-hidden="true" />
        </ToolbarButton>
      </Toolbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('toolbar', { name: 'Canvas' })
    ).toHaveAttribute('data-variant', 'floating');
  },
};

export const GroupSpacing: Story = {
  render: () => (
    <div className="nx:grid nx:gap-6">
      {(
        [
          ['default', undefined],
          ['floating', undefined],
          ['default', 'nx:gap-4'],
        ] as const
      ).map(([variant, className]) => (
        <Toolbar
          key={`${variant}-${className}`}
          variant={variant}
          className={className}
          aria-label={`${variant} bar`}
        >
          <ToolbarToolGroup aria-label="Tools" defaultValue="select">
            <ToolbarTool value="select" size="icon-sm" aria-label="Select">
              <CursorIcon aria-hidden="true" />
            </ToolbarTool>
            <ToolbarTool value="draw" size="icon-sm" aria-label="Draw">
              <PencilSimpleIcon aria-hidden="true" />
            </ToolbarTool>
          </ToolbarToolGroup>
          <ToolbarToggleGroup type="multiple" aria-label="Formatting">
            <ToolbarToggleItem value="bold" size="icon-sm" aria-label="Bold">
              <TextBIcon aria-hidden="true" />
            </ToolbarToggleItem>
            <ToolbarToggleItem
              value="italic"
              size="icon-sm"
              aria-label="Italic"
            >
              <TextItalicIcon aria-hidden="true" />
            </ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarGroup aria-label="History">
            <ToolbarButton size="icon-sm" aria-label="Undo">
              <ArrowUUpLeftIcon aria-hidden="true" />
            </ToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const toolbar of within(canvasElement).getAllByRole('toolbar')) {
      const barGap = getComputedStyle(toolbar).columnGap;
      for (const name of ['Tools', 'Formatting', 'History']) {
        await expect(
          getComputedStyle(within(toolbar).getByRole('group', { name }))
            .columnGap
        ).toBe(barGap);
      }
    }
  },
};

function HistoryGroup() {
  return (
    <ToolbarGroup aria-label="History">
      <ToolbarButton size="icon-sm" aria-label="Undo">
        <ArrowUUpLeftIcon aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton size="icon-sm" aria-label="Clear canvas">
        <EraserIcon aria-hidden="true" />
      </ToolbarButton>
    </ToolbarGroup>
  );
}

export const GroupInShowHide: Story = {
  render: () => (
    <Toolbar variant="floating" aria-label="Canvas tools">
      <Show above="md" as="div">
        <HistoryGroup />
      </Show>
      <Hide above="md" as="div">
        <HistoryGroup />
      </Hide>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar');
    await expect(
      getComputedStyle(within(toolbar).getByRole('group', { name: 'History' }))
        .columnGap
    ).toBe(getComputedStyle(toolbar).columnGap);
  },
};

export const VerticalTools: Story = {
  render: () => (
    <Toolbar orientation="vertical" aria-label="Canvas tools">
      <ToolbarToolGroup aria-label="Tools" defaultValue="select">
        <ToolbarTool value="select" size="icon-sm" aria-label="Select">
          <CursorIcon aria-hidden="true" />
        </ToolbarTool>
        <ToolbarTool value="draw" size="icon-sm" aria-label="Draw">
          <PencilSimpleIcon aria-hidden="true" />
        </ToolbarTool>
      </ToolbarToolGroup>
      <ToolbarGroup aria-label="History">
        <ToolbarButton size="icon-sm" aria-label="Undo">
          <ArrowUUpLeftIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Clear canvas">
          <EraserIcon aria-hidden="true" />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [first, second] of [
      ['Select', 'Draw'],
      ['Undo', 'Clear canvas'],
    ]) {
      const above = canvas
        .getByRole('button', { name: first })
        .getBoundingClientRect();
      const below = canvas
        .getByRole('button', { name: second })
        .getBoundingClientRect();
      await expect(below.top).toBeGreaterThanOrEqual(above.bottom);
    }
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:gap-10">
      <InlineExample />
      <AttachedExample />
      <SelectionExample />
      <Toolbar variant="floating" aria-label="Floating canvas tools">
        <ToolbarButton size="icon-sm" aria-label="Pointer">
          <CursorIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="Pencil">
          <PencilSimpleIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton size="icon-sm" aria-label="Undo last change">
          <ArrowUUpLeftIcon aria-hidden="true" />
        </ToolbarButton>
      </Toolbar>
    </div>
  ),
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
  render: () => (
    <Toolbar aria-label="Formatting availability">
      <ToolbarButton>Undo</ToolbarButton>
      <ToolbarToggleGroup
        type="multiple"
        disabled
        aria-label="Unavailable formatting"
      >
        <ToolbarToggleItem value="bold">Bold</ToolbarToggleItem>
        <ToolbarToggleItem value="italic">Italic</ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarButton>Preview</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Bold' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Preview' })).toHaveFocus();
  },
};

function InlineExample() {
  const [view, setView] = React.useState('all');
  return (
    <section className="nx:grid nx:gap-4">
      <div>
        <h2 className="nx:typography-heading-small">Documents</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Keep your working files close at hand.
        </p>
      </div>
      <Toolbar
        aria-label="Document view"
        className="nx:w-full nx:rounded-none nx:border-0 nx:border-b-default nx:shadow-none nx:bg-transparent nx:p-0 nx:pb-3"
      >
        <ToolbarToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value);
          }}
          aria-label="Show documents"
        >
          <ToolbarToggleItem value="all">All documents</ToolbarToggleItem>
          <ToolbarToggleItem value="recent">Recent</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton className="nx:ms-auto">
              Show <IconChevronDown aria-hidden="true" />
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setView('all')}>
              All documents
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setView('recent')}>
              Recent documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Toolbar>
      <ul className="nx:grid nx:gap-3 nx:typography-body-default">
        <li>
          Project brief{' '}
          <span className="nx:text-muted-foreground">· Today</span>
        </li>
        {view === 'all' && (
          <li>
            Research notes{' '}
            <span className="nx:text-muted-foreground">· Last week</span>
          </li>
        )}
      </ul>
    </section>
  );
}

function AttachedExample() {
  const [formatting, setFormatting] = React.useState<string[]>([]);
  const [text, setText] = React.useState(
    'Good tools stay close to the work. Draft your next idea here.'
  );
  return (
    <section className="nx:grid nx:gap-3">
      <h2 className="nx:typography-heading-small">Draft a note</h2>
      <div className="nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container">
        <Toolbar
          aria-label="Note formatting"
          className="nx:w-full nx:rounded-none nx:rounded-t-lg nx:border-0 nx:border-b-default nx:border-border-default nx:shadow-none nx:bg-background nx:p-2"
        >
          <ToolbarToggleGroup
            type="multiple"
            value={formatting}
            onValueChange={setFormatting}
            aria-label="Note style"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="bold"
                    size="icon-sm"
                    aria-label="Bold note"
                  >
                    <span className="nx:font-bold">B</span>
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="italic"
                    size="icon-sm"
                    aria-label="Italic note"
                  >
                    <span className="nx:italic">I</span>
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarToggleItem
                    value="underline"
                    size="icon-sm"
                    aria-label="Underline note"
                  >
                    <span className="nx:underline">U</span>
                  </ToolbarToggleItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarButton>
                More <IconChevronDown aria-hidden="true" />
              </ToolbarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setFormatting([])}>
                Clear formatting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>
        <textarea
          aria-label="Note"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="nx:block nx:min-h-32 nx:w-full nx:resize-y nx:rounded-b-lg nx:bg-transparent nx:p-4 nx:typography-body-default nx:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
          style={{
            fontWeight: formatting.includes('bold') ? 700 : undefined,
            fontStyle: formatting.includes('italic') ? 'italic' : undefined,
            textDecoration: formatting.includes('underline')
              ? 'underline'
              : undefined,
          }}
        />
      </div>
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Formatting applies to the whole note.
      </p>
    </section>
  );
}

const selectionFiles = ['Project brief', 'Research notes', 'Launch checklist'];

function SelectionExample() {
  const selectionId = React.useId();
  const [selected, setSelected] = React.useState<string[]>([
    'Project brief',
    'Research notes',
  ]);
  const [message, setMessage] = React.useState('');
  const [archived, setArchived] = React.useState<string[]>([]);
  const firstCheckbox = React.useRef<HTMLButtonElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  function clearSelection() {
    setSelected([]);
    firstCheckbox.current?.focus();
  }
  function archiveSelection() {
    setMessage(
      `${selected.length} document${selected.length === 1 ? '' : 's'} archived.`
    );
    setArchived((current) => [...current, ...selected]);
    setSelected([]);
    headingRef.current?.focus();
  }
  function toggleSelection(name: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, name] : current.filter((item) => item !== name)
    );
    setMessage('');
  }
  return (
    <section className="nx:grid nx:gap-4">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="nx:typography-heading-small nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
        >
          Select documents
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Actions appear when documents are selected.
        </p>
      </div>
      <div className="nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-3">
        {selectionFiles
          .filter((name) => !archived.includes(name))
          .map((name, index) => (
            <Label
              htmlFor={`${selectionId}-${index}`}
              key={name}
              className="nx:flex nx:min-h-10 nx:cursor-pointer nx:items-center nx:gap-3 nx:px-2 nx:typography-body-default"
            >
              <Checkbox
                id={`${selectionId}-${index}`}
                ref={index === 0 ? firstCheckbox : undefined}
                checked={selected.includes(name)}
                onCheckedChange={(checked) =>
                  toggleSelection(name, checked === true)
                }
              />
              {name}
            </Label>
          ))}
        {archived.length === selectionFiles.length && (
          <p className="nx:p-2 nx:typography-body-default nx:text-muted-foreground">
            No documents remaining.
          </p>
        )}
      </div>
      <div className="nx:flex nx:min-h-16 nx:justify-center">
        {selected.length > 0 && (
          <Toolbar
            aria-label="Selected document actions"
            className="nx:h-fit nx:justify-center nx:gap-0 nx:bg-popover nx:p-0"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToolbarButton
                  size="icon-sm"
                  aria-label="Clear selection"
                  className="nx:text-muted-foreground"
                  onClick={clearSelection}
                >
                  <IconX aria-hidden="true" />
                </ToolbarButton>
              </TooltipTrigger>
              <TooltipContent>Clear selection</TooltipContent>
            </Tooltip>
            <span
              className="nx:px-2 nx:typography-label-default nx:whitespace-nowrap"
              aria-live="polite"
            >
              {selected.length} selected
            </span>
            <ToolbarSeparator />
            <ToolbarButton onClick={archiveSelection}>
              <ArchiveIcon aria-hidden="true" />
              Archive
            </ToolbarButton>
          </Toolbar>
        )}
      </div>
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {message}
      </p>
    </section>
  );
}

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
  render: () => <InlineExample />,
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
  render: () => <AttachedExample />,
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
export const Selection: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show an action bar for the documents a user has selected.',
      },
    },
  },
  render: () => <SelectionExample />,
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

export const ToolsWithPanels: Story = {
  tags: ['docs'],
  render: function Example() {
    const id = React.useId();
    return (
      <div className="nx:flex nx:min-h-64 nx:items-end">
        <Toolbar aria-label="Canvas">
          <ToolbarToolGroup aria-label="Drawing tools" defaultValue="select">
            <ToolbarTool value="select" size="icon-sm" aria-label="Select">
              <CursorIcon aria-hidden="true" />
            </ToolbarTool>
            <ToolbarTool value="draw" size="icon-sm" aria-label="Draw">
              <PencilSimpleIcon aria-hidden="true" />
            </ToolbarTool>
            <ToolbarTool value="erase" size="icon-sm" aria-label="Erase">
              <EraserIcon aria-hidden="true" />
            </ToolbarTool>
            <ToolbarToolPanel value="draw" side="top">
              <div className="nx:flex nx:items-center nx:gap-2">
                <Checkbox id={`${id}-smooth`} defaultChecked />
                <Label htmlFor={`${id}-smooth`}>Smooth strokes</Label>
              </div>
            </ToolbarToolPanel>
            <ToolbarToolPanel value="erase" side="top">
              <div className="nx:flex nx:items-center nx:gap-2">
                <Checkbox id={`${id}-whole`} />
                <Label htmlFor={`${id}-whole`}>Erase whole strokes</Label>
              </div>
            </ToolbarToolPanel>
          </ToolbarToolGroup>
          <ToolbarSeparator />
          <ToolbarButton size="icon-sm" aria-label="Undo">
            <ArrowUUpLeftIcon aria-hidden="true" />
          </ToolbarButton>
        </Toolbar>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const select = canvas.getByRole('button', { name: 'Select' });
    const draw = canvas.getByRole('button', { name: 'Draw' });
    await expect(select).toHaveAttribute('aria-pressed', 'true');
    await expect(select).not.toHaveAttribute('aria-haspopup');
    await expect(select).not.toHaveAttribute('aria-expanded');
    await expect(draw).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(draw).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(draw);
    const panel = await page.findByRole('dialog', { name: 'Draw' });
    await expect(draw).toHaveAttribute('aria-pressed', 'true');
    await expect(draw).toHaveAttribute('aria-expanded', 'true');
    await expect(draw).toHaveAttribute('aria-controls', panel.id);
    await expect(select).toHaveAttribute('aria-pressed', 'false');
  },
};

type ToolStory = StoryObj<typeof ToolbarToolGroup>;

function CanvasTools({
  onDrawPanelClose,
  ...props
}: React.ComponentProps<typeof ToolbarToolGroup> & {
  onDrawPanelClose?: () => void;
}) {
  const id = React.useId();
  return (
    <div className="nx:flex nx:min-h-64 nx:items-end nx:gap-4">
      <Toolbar aria-label="Canvas">
        <ToolbarToolGroup
          aria-label="Drawing tools"
          defaultValue="select"
          {...props}
        >
          <ToolbarTool value="select" size="icon-sm" aria-label="Select">
            <CursorIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="draw" size="icon-sm" aria-label="Draw">
            <PencilSimpleIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="erase" size="icon-sm" aria-label="Erase">
            <EraserIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="text" size="icon-sm" aria-label="Text" disabled>
            <TextItalicIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarToolPanel
            value="draw"
            side="top"
            onCloseAutoFocus={onDrawPanelClose}
          >
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id={`${id}-smooth`} defaultChecked />
              <Label htmlFor={`${id}-smooth`}>Smooth strokes</Label>
            </div>
          </ToolbarToolPanel>
          <ToolbarToolPanel value="erase" side="top">
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id={`${id}-whole`} />
              <Label htmlFor={`${id}-whole`}>Erase whole strokes</Label>
            </div>
          </ToolbarToolPanel>
        </ToolbarToolGroup>
      </Toolbar>
      <Button variant="outline">Done</Button>
    </div>
  );
}

export const SwitchingTools: ToolStory = {
  args: { onValueChange: fn(), onOpenChange: fn() },
  render: (args) => <CanvasTools {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const erase = canvas.getByRole('button', { name: 'Erase' });
    await userEvent.click(canvas.getByRole('button', { name: 'Draw' }));
    await page.findByRole('dialog', { name: 'Draw' });
    const focused: EventTarget[] = [];
    function recordFocus(event: FocusEvent) {
      if (event.target) focused.push(event.target);
    }
    canvasElement.ownerDocument.addEventListener('focusin', recordFocus);
    await userEvent.click(erase);
    const panel = await page.findByRole('dialog', { name: 'Erase' });
    await expect(panel).toBeVisible();
    await expect(
      page.queryByRole('dialog', { name: 'Draw' })
    ).not.toBeInTheDocument();
    await expect(erase).toHaveFocus();
    canvasElement.ownerDocument.removeEventListener('focusin', recordFocus);
    await expect(
      focused.filter((target) => panel.contains(target as Node))
    ).toEqual([]);
    await expect(args.onValueChange).toHaveBeenLastCalledWith('erase');
    await expect(args.onOpenChange).not.toHaveBeenCalledWith(false);
  },
};

export const ToolPanelKeyboard: ToolStory = {
  render: (args) => <CanvasTools {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const select = canvas.getByRole('button', { name: 'Select' });
    const draw = canvas.getByRole('button', { name: 'Draw' });
    await expect(canvas.getByRole('button', { name: 'Text' })).toBeDisabled();
    await userEvent.tab();
    await expect(select).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: 'Erase' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(draw).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const panel = await page.findByRole('dialog', { name: 'Draw' });
    await waitFor(() =>
      expect(panel).toContainElement(
        canvasElement.ownerDocument.activeElement as HTMLElement
      )
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(draw).toHaveFocus());
    await expect(draw).toHaveAttribute('aria-expanded', 'false');
    await expect(draw).toHaveAttribute('aria-pressed', 'true');
  },
};

export const ToolWithoutPanel: ToolStory = {
  args: { onOpenChange: fn() },
  render: (args) => <CanvasTools {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const select = canvas.getByRole('button', { name: 'Select' });
    await userEvent.click(canvas.getByRole('button', { name: 'Draw' }));
    await page.findByRole('dialog', { name: 'Draw' });
    await userEvent.click(select);
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(select).toHaveAttribute('aria-pressed', 'true');
    await expect(select).not.toHaveAttribute('aria-expanded');
    await expect(select).toHaveFocus();
  },
};

export const ToolPanelOutsideClick: StoryObj<typeof CanvasTools> = {
  args: { onDrawPanelClose: fn() },
  render: (args) => <CanvasTools {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const draw = canvas.getByRole('button', { name: 'Draw' });
    const done = canvas.getByRole('button', { name: 'Done' });
    await userEvent.click(draw);
    await page.findByRole('dialog', { name: 'Draw' });
    await userEvent.click(done);
    await waitFor(() => expect(args.onDrawPanelClose).toHaveBeenCalledTimes(1));
    await expect(done).toHaveFocus();
    await expect(draw).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(draw);
    await page.findByRole('dialog', { name: 'Draw' });
    await userEvent.click(canvasElement);
    await waitFor(() => expect(args.onDrawPanelClose).toHaveBeenCalledTimes(2));
    await expect(draw).not.toHaveFocus();
  },
};

export const ControlledTools: ToolStory = {
  args: {
    value: 'draw',
    open: false,
    onValueChange: fn(),
    onOpenChange: fn(),
  },
  render: (args) => <CanvasTools {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const draw = canvas.getByRole('button', { name: 'Draw' });
    await expect(
      canvas.getByRole('group', { name: 'Drawing tools' })
    ).toHaveAttribute('data-slot', 'toolbar-tool-group');
    await expect(draw).toHaveAttribute('data-slot', 'toolbar-tool');
    await expect(draw).toHaveAttribute('data-state', 'on');
    await expect(draw).toHaveAttribute('data-size', 'icon-sm');
    await expect(
      canvas.getByRole('button', { name: 'Select' })
    ).toHaveAttribute('data-state', 'off');
    await userEvent.click(draw);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Erase' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith('erase');
    await expect(draw).toHaveAttribute('data-state', 'on');
  },
};

function SwitchFromPanelDemo({
  onDrawPanelClose,
}: {
  onDrawPanelClose: () => void;
}) {
  const id = React.useId();
  const [value, setValue] = React.useState('draw');
  return (
    <div className="nx:flex nx:min-h-64 nx:items-end">
      <Toolbar aria-label="Canvas">
        <ToolbarToolGroup
          aria-label="Drawing tools"
          value={value}
          onValueChange={setValue}
          defaultOpen
        >
          <ToolbarTool value="draw" size="icon-sm" aria-label="Draw">
            <PencilSimpleIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="erase" size="icon-sm" aria-label="Erase">
            <EraserIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarToolPanel
            value="draw"
            side="top"
            onCloseAutoFocus={onDrawPanelClose}
          >
            <Button size="sm" onClick={() => setValue('erase')}>
              Switch to eraser
            </Button>
          </ToolbarToolPanel>
          <ToolbarToolPanel value="erase" side="top">
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id={`${id}-whole`} />
              <Label htmlFor={`${id}-whole`}>Erase whole strokes</Label>
            </div>
          </ToolbarToolPanel>
        </ToolbarToolGroup>
      </Toolbar>
    </div>
  );
}

export const SwitchFromPanel: StoryObj<typeof SwitchFromPanelDemo> = {
  args: { onDrawPanelClose: fn() },
  render: (args) => <SwitchFromPanelDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await page.findByRole('button', { name: 'Switch to eraser' })
    );
    const panel = await page.findByRole('dialog', { name: 'Erase' });
    await waitFor(() => expect(args.onDrawPanelClose).toHaveBeenCalled());
    await expect(panel).toContainElement(
      canvasElement.ownerDocument.activeElement as HTMLElement
    );
  },
};

function NamedPanelsDemo() {
  const id = React.useId();
  return (
    <div className="nx:flex nx:min-h-64 nx:items-end">
      <Toolbar aria-label="Canvas">
        <ToolbarToolGroup aria-label="Drawing tools" defaultValue="select">
          <ToolbarTool value="select" size="icon-sm" aria-label="Select">
            <CursorIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="draw" size="icon-sm" aria-label="Draw">
            <PencilSimpleIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarTool value="erase" size="icon-sm" aria-label="Erase">
            <EraserIcon aria-hidden="true" />
          </ToolbarTool>
          <ToolbarToolPanel value="draw" side="top" aria-label="Brush options">
            <Button size="sm">Reset brush</Button>
          </ToolbarToolPanel>
          <ToolbarToolPanel
            value="erase"
            side="top"
            aria-labelledby={`${id}-eraser`}
          >
            <p
              id={`${id}-eraser`}
              className="nx:m-0 nx:mb-2 nx:typography-label-default"
            >
              Eraser settings
            </p>
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id={`${id}-whole`} />
              <Label htmlFor={`${id}-whole`}>Erase whole strokes</Label>
            </div>
          </ToolbarToolPanel>
        </ToolbarToolGroup>
      </Toolbar>
    </div>
  );
}

export const NamedPanels: Story = {
  render: () => <NamedPanelsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Draw' }));
    await expect(
      await page.findByRole('dialog', { name: 'Brush options' })
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Erase' }));
    await expect(
      await page.findByRole('dialog', { name: 'Eraser settings' })
    ).toBeVisible();
  },
};
