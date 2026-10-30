import {
  PhBook,
  PhCreditCard,
  PhFile,
  PhGear,
  PhUser,
  PhUsers,
} from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { Button } from '../button';
import { Spinner } from '../spinner';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
} from '.';

const meta = {
  title: 'Components/Command',
  component: Command,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Command is a searchable list of actions with keyboard navigation. Use it for command palettes and quick search. For picking a form value, use Combobox.',
      },
    },
  },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

// Presentational chrome for the inline (non-dialog) palette stories — a fixed
// width with a bordered, elevated surface so the palette reads as a card.
const paletteClass =
  'nx:w-[480px] nx:rounded-lg nx:border-default nx:border-border-default nx:shadow-md';

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    },
    template: `
      <Command label="Command menu" class="nx:w-[480px] nx:rounded-lg nx:border-default nx:border-border-default nx:shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
};

export const Grouped: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Sort commands into CommandGroup sections with headings and separators.',
      },
    },
  },
  render: () => ({
    components: {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
      CommandSeparator,
      CommandShortcut,
    },
    template: `
      <Command label="Command menu" class="nx:w-[480px] nx:rounded-lg nx:border-default nx:border-border-default nx:shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
            <CommandItem>Billing<CommandShortcut>⌘B</CommandShortcut></CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    components: {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    },
    setup: () => ({ paletteClass, search: ref('') }),
    template: `
      <Command label="Command menu" :class="paletteClass">
        <CommandInput v-model="search" placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>
            {{ search ? 'No results found for "' + search + '".' : 'No results found.' }}
          </CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
  parameters: {
    a11y: {
      // The no-results state legitimately renders an empty listbox; axe's
      // aria-required-children flags the transient absence of option children,
      // which is expected here. All other a11y rules stay enabled.
      options: { rules: { 'aria-required-children': { enabled: false } } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Typing a query that matches nothing surfaces the empty state.
    await userEvent.type(input, 'roadmap');
    await expect(
      canvas.getByText('No results found for "roadmap".')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-empty"]')
    ).toBeInTheDocument();
  },
};

export const AsyncLoading: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show CommandLoading outside CommandList while results load.',
      },
    },
  },
  render: () => ({
    components: {
      Command,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
      CommandLoading,
      Spinner,
    },
    setup: () => ({ recent: ['Recent project', 'Team dashboard'] }),
    template: `
      <Command label="Async command menu" class="nx:w-[480px] nx:rounded-lg nx:border-default nx:border-border-default nx:shadow-md">
        <CommandInput placeholder="Search commands..." />
        <CommandLoading :progress="60" label="Loading command results">
          <Spinner aria-hidden="true" role="presentation" class="nx:size-3.5 nx:[--nx-icon-size:var(--nx-spacing-3_5)]" />Loading commands...</CommandLoading>
        <CommandList>
          <CommandGroup heading="Recent">
            <CommandItem v-for="item in recent" :key="item" :value="item">
              {{ item }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole('progressbar');
    // The progressbar must not be a child of CommandList's role="listbox"
    // (axe aria-required-children).
    await expect(progressbar.closest('[role="listbox"]')).toBeNull();
  },
};

export const RichItems: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Give each item an icon, a description and a trailing hint.',
      },
    },
  },
  render: () => ({
    components: {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
      CommandShortcut,
    },
    setup: () => ({
      commands: [
        {
          label: 'Open project plan',
          description: 'View roadmap, milestones, and project notes',
          value: 'open-project-plan',
          keywords: ['roadmap', 'milestones', 'docs'],
          icon: PhFile,
          shortcut: '⌘P',
        },
        {
          label: 'Search documentation',
          description: 'Find API references and implementation guides',
          value: 'search-documentation',
          keywords: ['docs', 'api', 'guide'],
          icon: PhBook,
          shortcut: '⌘D',
        },
        {
          label: 'Project settings',
          description: 'Update members, billing, and notifications',
          value: 'project-settings',
          keywords: ['preferences', 'configuration', 'admin'],
          icon: PhGear,
          trailing: 'Admin',
        },
        {
          label: 'Invite teammate',
          description: 'Add a member to this workspace',
          value: 'invite-teammate',
          keywords: ['members', 'users', 'people'],
          icon: PhUsers,
        },
      ],
    }),
    template: `
      <Command label="Project command menu" class="nx:w-[480px] nx:rounded-lg nx:border-default nx:border-border-default nx:shadow-md">
        <CommandInput placeholder="Search project commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Project">
            <CommandItem
              v-for="command in commands"
              :key="command.value"
              :value="command.value"
              :keywords="command.keywords"
              class="nx:items-start"
            >
              <component :is="command.icon" aria-hidden="true" class="nx:mt-0.5 nx:text-muted-foreground" />
              <span class="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5">
                <span class="nx:truncate">{{ command.label }}</span>
                <span class="nx:truncate nx:typography-body-default nx:text-muted-foreground">
                  {{ command.description }}
                </span>
              </span>
              <CommandShortcut v-if="command.shortcut" class="nx:mt-0.5">
                {{ command.shortcut }}
              </CommandShortcut>
              <span
                v-else-if="command.trailing"
                class="nx:mt-0.5 nx:ml-auto nx:shrink-0 nx:typography-label-small nx:text-muted-foreground"
              >
                {{ command.trailing }}
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
};

export const AdvancedFiltering: Story = {
  render: () => ({
    components: {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
      CommandSeparator,
    },
    setup() {
      const search = ref('');
      const actionCommands = [
        {
          label: 'Invite teammate',
          value: 'invite-teammate',
          keywords: ['members', 'users', 'people'],
          icon: PhUsers,
        },
        {
          label: 'Open billing',
          value: 'open-billing',
          keywords: ['invoice', 'payment', 'card'],
          icon: PhCreditCard,
        },
      ];
      const destinationCommands = [
        {
          label: 'Profile',
          value: 'profile',
          keywords: ['account', 'user'],
          icon: PhUser,
        },
        {
          label: 'Settings',
          value: 'settings',
          keywords: ['preferences', 'configuration'],
          icon: PhGear,
        },
      ];
      const matchesSearch = (command: {
        label: string;
        keywords: string[];
      }) => {
        const query = search.value.trim().toLowerCase();

        if (!query) return true;

        return [command.label, ...command.keywords].some((value) =>
          value.toLowerCase().includes(query)
        );
      };
      const visibleActions = computed(() =>
        actionCommands.filter(matchesSearch)
      );
      const visibleDestinations = computed(() =>
        destinationCommands.filter(matchesSearch)
      );

      return { paletteClass, search, visibleActions, visibleDestinations };
    },
    template: `
      <Command label="Advanced command menu" :class="paletteClass" loop :should-filter="false">
        <CommandInput v-model="search" placeholder="Try members, invoice, or preferences..." />
        <CommandList>
          <CommandEmpty>No matching command.</CommandEmpty>
          <CommandGroup v-if="visibleActions.length > 0" heading="Actions">
            <CommandItem v-for="command in visibleActions" :key="command.value" :value="command.value">
              <component :is="command.icon" aria-hidden="true" />
              {{ command.label }}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator v-if="visibleActions.length > 0 && visibleDestinations.length > 0" always-render />
          <CommandGroup v-if="visibleDestinations.length > 0" heading="Destinations">
            <CommandItem v-for="command in visibleDestinations" :key="command.value" :value="command.value">
              <component :is="command.icon" aria-hidden="true" />
              {{ command.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    await userEvent.type(input, 'members');
    await expect(
      canvas.getByRole('option', { name: 'Invite teammate' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('option', { name: 'Open billing' })
    ).not.toBeInTheDocument();
  },
};

// ============================================
// DIALOG (⌘K) STORY
// ============================================

export const WithDialog: Story = {
  render: () => ({
    components: {
      Button,
      CommandDialog,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    },
    setup() {
      const open = ref(false);
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          open.value = !open.value;
        }
      };
      onMounted(() => document.addEventListener('keydown', onKeyDown));
      onUnmounted(() => document.removeEventListener('keydown', onKeyDown));
      return { open };
    },
    template: `
      <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
        <Button variant="outline" @click="open = true">Open Command Palette</Button>
        <p class="nx:typography-body-default nx:text-muted-foreground">
          Press <kbd class="nx:font-mono">⌘K</kbd> to toggle
        </p>
        <CommandDialog v-model:open="open">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem @select="open = false">Calendar</CommandItem>
              <CommandItem @select="open = false">Search Emoji</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Open Command Palette',
    });
    await userEvent.click(trigger);

    // Dialog content portals to document.body.
    const dialog = await within(document.body).findByRole('dialog');
    const input = within(dialog).getByRole('combobox');

    // Focusing the input confirms the dialog — and its dismiss layer — is
    // fully mounted before we dismiss it.
    await userEvent.click(input);
    await expect(input).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('data-state') ?? 'closed').toBe('closed');
    });
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const Disabled: Story = {
  render: () => ({
    components: {
      Command,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    },
    setup: () => ({ paletteClass }),
    template: `
      <Command label="Command menu" :class="paletteClass">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem disabled>Search Emoji (disabled)</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledItem = canvas.getByRole('option', {
      name: 'Search Emoji (disabled)',
    });

    // The item is non-interactive (pointer-events:none), so assert its state
    // attributes rather than clicking it.
    await expect(disabledItem).toHaveAttribute('data-disabled', 'true');
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

    // Disabled items use a semantic text token at full opacity (not a fade).
    await expect(disabledItem).toHaveClass(
      'nx:data-[disabled=true]:text-disabled-foreground'
    );
    await expect(getComputedStyle(disabledItem).opacity).toBe('1');
  },
};

export const ClickInteraction: Story = {
  render: () => ({
    components: {
      Command,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    },
    setup: () => ({ paletteClass, selected: ref('none') }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Command label="Command menu" :class="paletteClass">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem value="calendar" @select="selected = $event">Calendar</CommandItem>
              <CommandItem value="calculator" @select="selected = $event">Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <p data-testid="last-selected">Selected: {{ selected }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const calculator = canvas.getByRole('option', { name: 'Calculator' });

    await userEvent.click(calculator);
    await expect(canvas.getByTestId('last-selected')).toHaveTextContent(
      /calculator/i
    );
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: {
      Command,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    },
    setup: () => ({ paletteClass, selected: ref('none') }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Command label="Command menu" :class="paletteClass">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem value="calendar" @select="selected = $event">Calendar</CommandItem>
              <CommandItem value="calculator" @select="selected = $event">Calculator</CommandItem>
              <CommandItem value="settings" @select="selected = $event">Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <p data-testid="last-selected">Selected: {{ selected }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // The first item starts highlighted; ArrowDown moves to the second.
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');

    const options = canvas.getAllByRole('option');
    await waitFor(() =>
      expect(options[1]).toHaveAttribute('data-selected', 'true')
    );

    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('last-selected')).toHaveTextContent(
      /calculator/i
    );
  },
};

// Matches keep the order they are written in, so the partial match stays
// above the exact one and Enter runs it.
export const SearchRanking: Story = {
  render: () => ({
    components: { Command, CommandInput, CommandItem, CommandList },
    setup: () => ({ paletteClass, selected: ref('none') }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Command label="Command menu" :class="paletteClass">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandItem value="open recent" @select="selected = $event">Open recent</CommandItem>
            <CommandItem value="open" @select="selected = $event">Open</CommandItem>
          </CommandList>
        </Command>
        <p data-testid="last-selected">Selected: {{ selected }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('combobox'), 'open');
    await waitFor(() =>
      expect(canvas.getAllByRole('option')[0]).toHaveTextContent(
        /^Open recent$/
      )
    );

    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('last-selected')).toHaveTextContent(
      'Selected: open recent'
    );
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      Command,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
      CommandSeparator,
      CommandShortcut,
    },
    setup: () => ({ paletteClass }),
    template: `
      <Command label="Command menu" :class="paletteClass">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('combobox');
    await expect(input).toHaveAttribute('data-slot', 'command-input');

    await expect(
      canvasElement.querySelector('[data-slot="command-input-wrapper"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-list"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-group"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-item"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-separator"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="command-shortcut"]')
    ).toBeInTheDocument();

    const shortcut = canvasElement.querySelector(
      '[data-slot="command-shortcut"]'
    );
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass('nx:tracking-widest');
  },
};
