import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  IconBook,
  IconCheck,
  IconFileText,
  IconGitBranch,
  IconPencil,
  IconRotate,
  IconSearch,
} from '@tabler/icons-vue';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Spinner } from '../spinner';

import { Marker, MarkerContent, MarkerIcon, type MarkerProps } from '.';

const meta = {
  title: 'Components/Marker',
  component: Marker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Marker labels a point in a list, feed or message stream with muted text and an optional icon. Use it for dates, edit notes and progress updates. For a rule with no label, use Separator.',
      },
    },
  },
} satisfies Meta<typeof Marker>;

export default meta;
type Story = StoryObj<typeof meta>;
type RevertStory = StoryObj<MarkerProps & { onRevert: () => void }>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Marker, MarkerContent },
    template: `
      <Marker>
        <MarkerContent>Edited 2 minutes ago</MarkerContent>
      </Marker>
    `,
  }),
};

export const Separator: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Center the label between two rules to divide a feed by date or event.',
      },
    },
  },
  render: () => ({
    components: { Marker, MarkerContent },
    template: `
      <div class="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
        <Marker variant="separator">
          <MarkerContent>Today</MarkerContent>
        </Marker>
        <Marker variant="separator">
          <MarkerContent>Worked for 42s</MarkerContent>
        </Marker>
        <Marker variant="separator">
          <MarkerContent>Conversation compacted</MarkerContent>
        </Marker>
      </div>
    `,
  }),
};

export const Border: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Underline each row with a rule to separate steps in a log.',
      },
    },
  },
  render: () => ({
    components: {
      IconFileText,
      IconGitBranch,
      IconSearch,
      Marker,
      MarkerContent,
      MarkerIcon,
    },
    template: `
      <div class="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
        <Marker variant="border">
          <MarkerIcon><IconGitBranch /></MarkerIcon>
          <MarkerContent>Switched to release-candidate</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerIcon><IconSearch /></MarkerIcon>
          <MarkerContent>Reviewed 8 related files</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerIcon><IconFileText /></MarkerIcon>
          <MarkerContent>Opened implementation notes</MarkerContent>
        </Marker>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Lead the label with a decorative icon in any variant.',
      },
    },
  },
  render: () => ({
    components: {
      IconBook,
      IconPencil,
      IconSearch,
      Marker,
      MarkerContent,
      MarkerIcon,
    },
    template: `
      <div class="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
        <Marker>
          <MarkerIcon><IconPencil /></MarkerIcon>
          <MarkerContent>Edited 2 minutes ago</MarkerContent>
        </Marker>
        <Marker variant="separator">
          <MarkerIcon><IconSearch /></MarkerIcon>
          <MarkerContent>Explored 4 files</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerIcon><IconBook /></MarkerIcon>
          <MarkerContent>Syncing completed</MarkerContent>
        </Marker>
      </div>
    `,
  }),
};

export const Status: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `role="status"` so screen readers announce progress as it changes, without moving focus.',
      },
    },
  },
  render: () => ({
    components: { Marker, MarkerContent, MarkerIcon, Spinner },
    template: `
      <div class="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
        <Marker role="status">
          <MarkerIcon><Spinner /></MarkerIcon>
          <MarkerContent>Compacting conversation</MarkerContent>
        </Marker>
        <Marker variant="separator" role="status">
          <MarkerIcon><Spinner /></MarkerIcon>
          <MarkerContent>Running tests</MarkerContent>
        </Marker>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('status');

    await expect(first).toHaveTextContent('Compacting conversation');
  },
};

export const InContext: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place markers between message rows to show dates and edits.',
      },
    },
  },
  render: () => ({
    components: { IconPencil, Marker, MarkerContent, MarkerIcon },
    template: `
      <div class="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-3">
        <div class="nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:p-3 nx:typography-body-default nx:text-container-foreground">Rewrote the onboarding copy</div>
        <Marker variant="separator">
          <MarkerContent>Today</MarkerContent>
        </Marker>
        <div class="nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:p-3 nx:typography-body-default nx:text-container-foreground">Shipped the appearance provider</div>
        <div class="nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:p-3 nx:typography-body-default nx:text-container-foreground">Reviewed the token audit</div>
        <Marker>
          <MarkerIcon><IconPencil /></MarkerIcon>
          <MarkerContent>Edited 2 minutes ago</MarkerContent>
        </Marker>
      </div>
    `,
  }),
};

export const AsChildLink: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Render the marker as a link with `as-child` to make the row clickable.',
      },
    },
  },
  render: () => ({
    components: { IconGitBranch, Marker, MarkerContent, MarkerIcon },
    template: `
      <Marker as-child>
        <a href="#pull-request">
          <MarkerIcon><IconGitBranch /></MarkerIcon>
          <MarkerContent>View the pull request</MarkerContent>
        </a>
      </Marker>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'View the pull request' });

    await expect(link).toHaveAttribute('data-slot', 'marker');
  },
};

// Behaviour stories: tests and Storybook only.

export const LongContent: Story = {
  render: () => ({
    components: { Marker, MarkerContent },
    template: `
      <div class="nx:max-w-64">
        <Marker variant="separator">
          <MarkerContent>
            Everything below this point was synced from a device that has been
            offline since last Tuesday
          </MarkerContent>
        </Marker>
      </div>
    `,
  }),
};

export const WithLink: Story = {
  render: () => ({
    components: { Marker, MarkerContent },
    template: `
      <Marker>
        <MarkerContent>
          Draft saved. <a href="#restore">Restore the previous version</a>
        </MarkerContent>
      </Marker>
    `,
  }),
};

/**
 * A disabled or `aria-disabled` child ignores the pointer and dims, shown
 * beside an enabled row.
 */
export const Disabled: RevertStory = {
  args: { onRevert: fn() },
  render: (args) => ({
    components: {
      IconGitBranch,
      IconRotate,
      Marker,
      MarkerContent,
      MarkerIcon,
    },
    setup: () => ({ args }),
    template: `
      <div class="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
        <Marker as-child>
          <button type="button" @click="args.onRevert">
            <MarkerIcon><IconRotate /></MarkerIcon>
            <MarkerContent>Revert this change</MarkerContent>
          </button>
        </Marker>
        <Marker as-child>
          <button type="button" disabled @click="args.onRevert">
            <MarkerIcon><IconRotate /></MarkerIcon>
            <MarkerContent>Delete this draft</MarkerContent>
          </button>
        </Marker>
        <Marker as-child>
          <a href="#pull-request" aria-disabled="true" tabindex="-1">
            <MarkerIcon><IconGitBranch /></MarkerIcon>
            <MarkerContent>View the pull request</MarkerContent>
          </a>
        </Marker>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const enabled = canvas.getByRole('button', { name: 'Revert this change' });
    const disabled = canvas.getByRole('button', { name: 'Delete this draft' });
    const link = canvas.getByRole('link', { name: 'View the pull request' });

    const enabledColor = getComputedStyle(enabled).color;

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveStyle({ pointerEvents: 'none' });
    await expect(disabled).not.toHaveStyle({ color: enabledColor });

    // user-event refuses to click through `pointer-events: none`, so the check
    // is bypassed to prove the handler stays silent on the native path too.
    await userEvent.click(disabled, { pointerEventsCheck: 0 });
    await expect(args.onRevert).not.toHaveBeenCalled();

    // An `a` ignores native `disabled`, so the row's inertness rests entirely
    // on the aria-disabled pair.
    await expect(link).toHaveStyle({ pointerEvents: 'none' });
    await expect(link).not.toHaveStyle({ color: enabledColor });
  },
};

export const ClickInteraction: RevertStory = {
  args: { onRevert: fn() },
  render: (args) => ({
    components: { IconRotate, Marker, MarkerContent, MarkerIcon },
    setup: () => ({ args }),
    template: `
      <Marker as-child>
        <button type="button" @click="args.onRevert">
          <MarkerIcon><IconRotate /></MarkerIcon>
          <MarkerContent>Revert this change</MarkerContent>
        </button>
      </Marker>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Revert this change' });

    // A bare <button> has no UA pointer cursor, so this is the row's own
    // `:is(button)` rule — WithDataAttributes proves the negative case.
    await expect(button).toHaveStyle({ cursor: 'pointer' });

    await userEvent.click(button);
    await expect(args.onRevert).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardInteraction: RevertStory = {
  args: { onRevert: fn() },
  render: (args) => ({
    components: { Marker, MarkerContent },
    setup: () => ({ args }),
    template: `
      <Marker as-child>
        <button type="button" @click="args.onRevert">
          <MarkerContent>Revert this change</MarkerContent>
        </button>
      </Marker>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Revert this change' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onRevert).toHaveBeenCalledTimes(1);
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { IconCheck, Marker, MarkerContent, MarkerIcon },
    template: `
      <Marker variant="separator">
        <MarkerIcon><IconCheck /></MarkerIcon>
        <MarkerContent>Today</MarkerContent>
      </Marker>
    `,
  }),
  play: async ({ canvasElement }) => {
    const marker = canvasElement.querySelector('[data-slot="marker"]');
    const icon = canvasElement.querySelector('[data-slot="marker-icon"]');
    const content = canvasElement.querySelector('[data-slot="marker-content"]');

    await expect(marker).toHaveAttribute('data-variant', 'separator');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(content).toHaveTextContent('Today');

    // The cursor rule rides the same static cva string as everywhere else, so
    // a non-interactive row proves the `:is(button)` scoping actually bites.
    await expect(marker).not.toHaveStyle({ cursor: 'pointer' });
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: { IconCheck, Marker, MarkerContent, MarkerIcon },
    setup: () => ({ variants: ['default', 'separator', 'border'] as const }),
    template: `
      <div class="nx:flex nx:w-full nx:max-w-sm nx:flex-col nx:gap-6">
        <div v-for="variant in variants" :key="variant" class="nx:flex nx:flex-col nx:gap-2">
          <span class="nx:typography-label-small nx:text-muted-foreground-subtle">variant="{{ variant }}"</span>
          <Marker :variant="variant">
            <MarkerContent>Today</MarkerContent>
          </Marker>
          <Marker :variant="variant">
            <MarkerIcon><IconCheck /></MarkerIcon>
            <MarkerContent>Today, with an icon</MarkerContent>
          </Marker>
        </div>
      </div>
    `,
  }),
};
