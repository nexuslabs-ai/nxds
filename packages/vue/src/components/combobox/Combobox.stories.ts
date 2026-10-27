import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { computed, defineComponent, type PropType, reactive, ref } from 'vue';

import { cn } from '../../lib/utils';
import { expectImmediateItemMotion } from '../../stories/support/motion-test-utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '.';

type ComboboxItemData = {
  value: string;
  label: string;
  disabled?: boolean;
};

// The search matches each item's `value` + `keywords`, not its rendered
// children, so pass the label as a keyword to make it searchable. `select`
// passes the trimmed `value` (case preserved).
const frameworks: ComboboxItemData[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

// The play stories' picker; each docs story spells its picker out instead.
const ComboboxExample = defineComponent({
  components: {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
  },
  inheritAttrs: false,
  props: {
    defaultValue: { type: String, default: '' },
    items: {
      type: Array as PropType<ComboboxItemData[]>,
      default: () => frameworks,
    },
  },
  setup(props) {
    const open = ref(false);
    const value = ref(props.defaultValue);
    const selectedLabel = computed(
      () => props.items.find((item) => item.value === value.value)?.label
    );

    function handleSelect(next: string) {
      value.value = next === value.value ? '' : next;
      open.value = false;
    }

    return { cn, open, value, selectedLabel, handleSelect };
  },
  template: `
    <Combobox v-model:open="open">
      <ComboboxTrigger class="nx:w-64" v-bind="$attrs">
        <span :class="cn('nx:min-w-0 nx:flex-1 nx:truncate nx:text-left', selectedLabel ? undefined : 'nx:text-muted-foreground')">{{ selectedLabel ?? 'Select framework' }}</span>
      </ComboboxTrigger>
      <ComboboxContent label="Framework">
        <ComboboxInput placeholder="Search framework..." />
        <ComboboxList>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxGroup>
            <ComboboxItem
              v-for="option in items"
              :key="option.value"
              :value="option.value"
              :keywords="[option.label]"
              :disabled="option.disabled"
              :selected="value === option.value"
              @select="handleSelect"
            >{{ option.label }}</ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  `,
});

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Combobox lets the user search a list and pick one option. Use it for lists too long to scan. For a short list without search, use Select.',
      },
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Raw composition holding open + value state at the call site — the canonical
// controlled usage, and the composition example the pattern is built around.
export const Controlled: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Combobox,
      ComboboxContent,
      ComboboxEmpty,
      ComboboxGroup,
      ComboboxInput,
      ComboboxItem,
      ComboboxList,
      ComboboxTrigger,
    },
    setup: () => ({
      open: ref(false),
      value: ref('astro'),
      frameworks: [
        { value: 'next', label: 'Next.js' },
        { value: 'sveltekit', label: 'SvelteKit' },
        { value: 'nuxt', label: 'Nuxt.js' },
        { value: 'remix', label: 'Remix' },
        { value: 'astro', label: 'Astro' },
      ],
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <Combobox v-model:open="open">
          <ComboboxTrigger class="nx:w-64">
            <span class="nx:min-w-0 nx:flex-1 nx:truncate nx:text-left">{{ frameworks.find((framework) => framework.value === value)?.label ?? 'Select framework' }}</span>
          </ComboboxTrigger>
          <ComboboxContent label="Framework">
            <ComboboxInput placeholder="Search framework..." />
            <ComboboxList>
              <ComboboxEmpty>No framework found.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem
                  v-for="framework in frameworks"
                  :key="framework.value"
                  :value="framework.value"
                  :keywords="[framework.label]"
                  :selected="value === framework.value"
                  @select="value = $event === value ? '' : $event; open = false"
                >{{ framework.label }}</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <output class="nx:typography-body-small nx:text-muted-foreground">Selected: {{ value || 'none' }}</output>
      </div>
    `,
  }),
};

export const Default: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Open the trigger, type to filter the options, and pick one.',
      },
    },
  },
  render: () => ({
    components: {
      Combobox,
      ComboboxContent,
      ComboboxEmpty,
      ComboboxGroup,
      ComboboxInput,
      ComboboxItem,
      ComboboxList,
      ComboboxTrigger,
    },
    setup: () => ({
      open: ref(false),
      value: ref(''),
      frameworks: [
        { value: 'next', label: 'Next.js' },
        { value: 'sveltekit', label: 'SvelteKit' },
        { value: 'nuxt', label: 'Nuxt.js' },
        { value: 'remix', label: 'Remix' },
        { value: 'astro', label: 'Astro' },
      ],
    }),
    template: `
      <Combobox v-model:open="open">
        <ComboboxTrigger class="nx:w-64">
          <span :class="['nx:min-w-0 nx:flex-1 nx:truncate nx:text-left', { 'nx:text-muted-foreground': !value }]">{{ frameworks.find((framework) => framework.value === value)?.label ?? 'Select framework' }}</span>
        </ComboboxTrigger>
        <ComboboxContent label="Framework">
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="framework in frameworks"
                :key="framework.value"
                :value="framework.value"
                :keywords="[framework.label]"
                :selected="value === framework.value"
                @select="value = $event === value ? '' : $event; open = false"
              >{{ framework.label }}</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    `,
  }),
};

export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size` on the trigger to `sm`, the default, or `lg`.',
      },
    },
  },
  render: () => ({
    components: {
      Combobox,
      ComboboxContent,
      ComboboxEmpty,
      ComboboxGroup,
      ComboboxInput,
      ComboboxItem,
      ComboboxList,
      ComboboxTrigger,
    },
    setup: () => ({
      pickers: reactive([
        { size: 'sm' as const, placeholder: 'Small', open: false, value: '' },
        { size: undefined, placeholder: 'Default', open: false, value: '' },
        { size: 'lg' as const, placeholder: 'Large', open: false, value: '' },
      ]),
      frameworks: [
        { value: 'next', label: 'Next.js' },
        { value: 'sveltekit', label: 'SvelteKit' },
        { value: 'nuxt', label: 'Nuxt.js' },
        { value: 'remix', label: 'Remix' },
        { value: 'astro', label: 'Astro' },
      ],
    }),
    template: `
      <div class="nx:flex nx:w-64 nx:flex-col nx:gap-3">
        <Combobox v-for="picker in pickers" :key="picker.placeholder" v-model:open="picker.open">
          <ComboboxTrigger :size="picker.size" class="nx:w-full">
            <span :class="['nx:min-w-0 nx:flex-1 nx:truncate nx:text-left', { 'nx:text-muted-foreground': !picker.value }]">{{ frameworks.find((framework) => framework.value === picker.value)?.label ?? picker.placeholder }}</span>
          </ComboboxTrigger>
          <ComboboxContent label="Framework">
            <ComboboxInput placeholder="Search framework..." />
            <ComboboxList>
              <ComboboxEmpty>No framework found.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem
                  v-for="framework in frameworks"
                  :key="framework.value"
                  :value="framework.value"
                  :keywords="[framework.label]"
                  :selected="picker.value === framework.value"
                  @select="picker.value = $event === picker.value ? '' : $event; picker.open = false"
                >{{ framework.label }}</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    `,
  }),
};

export const Grouped: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Wrap options in ComboboxGroup with a `heading` to sort them into labeled groups.',
      },
    },
  },
  render: () => ({
    components: {
      Combobox,
      ComboboxContent,
      ComboboxEmpty,
      ComboboxGroup,
      ComboboxInput,
      ComboboxItem,
      ComboboxList,
      ComboboxTrigger,
    },
    setup: () => ({
      open: ref(false),
      value: ref(''),
      groups: [
        {
          heading: 'React',
          options: [
            { value: 'next', label: 'Next.js' },
            { value: 'remix', label: 'Remix' },
          ],
        },
        {
          heading: 'Svelte',
          options: [{ value: 'sveltekit', label: 'SvelteKit' }],
        },
        { heading: 'Vue', options: [{ value: 'nuxt', label: 'Nuxt.js' }] },
        { heading: 'Other', options: [{ value: 'astro', label: 'Astro' }] },
      ],
    }),
    template: `
      <Combobox v-model:open="open">
        <ComboboxTrigger class="nx:w-64">
          <span :class="['nx:min-w-0 nx:flex-1 nx:truncate nx:text-left', { 'nx:text-muted-foreground': !value }]">{{ groups.flatMap((group) => group.options).find((option) => option.value === value)?.label ?? 'Select framework' }}</span>
        </ComboboxTrigger>
        <ComboboxContent label="Framework">
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxGroup v-for="group in groups" :key="group.heading" :heading="group.heading">
              <ComboboxItem
                v-for="option in group.options"
                :key="option.value"
                :value="option.value"
                :keywords="[option.label]"
                :selected="value === option.value"
                @select="value = $event === value ? '' : $event; open = false"
              >{{ option.label }}</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    `,
  }),
};

export const WithDisabledOption: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `disabled` on an item so it shows but cannot be picked.',
      },
    },
  },
  render: () => ({
    components: {
      Combobox,
      ComboboxContent,
      ComboboxEmpty,
      ComboboxGroup,
      ComboboxInput,
      ComboboxItem,
      ComboboxList,
      ComboboxTrigger,
    },
    setup: () => ({
      open: ref(false),
      value: ref(''),
      frameworks: [
        { value: 'next', label: 'Next.js', disabled: false },
        { value: 'sveltekit', label: 'SvelteKit', disabled: true },
        { value: 'astro', label: 'Astro', disabled: false },
      ],
    }),
    template: `
      <Combobox v-model:open="open">
        <ComboboxTrigger class="nx:w-64">
          <span :class="['nx:min-w-0 nx:flex-1 nx:truncate nx:text-left', { 'nx:text-muted-foreground': !value }]">{{ frameworks.find((framework) => framework.value === value)?.label ?? 'Select framework' }}</span>
        </ComboboxTrigger>
        <ComboboxContent label="Framework">
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="framework in frameworks"
                :key="framework.value"
                :value="framework.value"
                :keywords="[framework.label]"
                :disabled="framework.disabled"
                :selected="value === framework.value"
                @select="value = $event === value ? '' : $event; open = false"
              >{{ framework.label }}</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `disabled` on the trigger so the popover cannot open.',
      },
    },
  },
  render: () => ({
    components: {
      Combobox,
      ComboboxContent,
      ComboboxEmpty,
      ComboboxGroup,
      ComboboxInput,
      ComboboxItem,
      ComboboxList,
      ComboboxTrigger,
    },
    setup: () => ({
      open: ref(false),
      value: ref('next'),
      frameworks: [
        { value: 'next', label: 'Next.js' },
        { value: 'sveltekit', label: 'SvelteKit' },
        { value: 'nuxt', label: 'Nuxt.js' },
        { value: 'remix', label: 'Remix' },
        { value: 'astro', label: 'Astro' },
      ],
    }),
    template: `
      <Combobox v-model:open="open">
        <ComboboxTrigger class="nx:w-64" disabled>
          <span :class="['nx:min-w-0 nx:flex-1 nx:truncate nx:text-left', { 'nx:text-muted-foreground': !value }]">{{ frameworks.find((framework) => framework.value === value)?.label ?? 'Select framework' }}</span>
        </ComboboxTrigger>
        <ComboboxContent label="Framework">
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="framework in frameworks"
                :key="framework.value"
                :value="framework.value"
                :keywords="[framework.label]"
                :selected="value === framework.value"
                @select="value = $event === value ? '' : $event; open = false"
              >{{ framework.label }}</ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Next.js' });

    await expect(trigger).toBeDisabled();
    // The disabled trigger sets pointer-events: none; bypass the guard to prove
    // the click is a no-op and the popover stays closed.
    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    await waitFor(() => {
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
  },
};

export const InvalidField: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `aria-invalid` and place the combobox in a Field to show an error.',
      },
    },
  },
  render: () => ({
    components: {
      Combobox,
      ComboboxContent,
      ComboboxEmpty,
      ComboboxGroup,
      ComboboxInput,
      ComboboxItem,
      ComboboxList,
      ComboboxTrigger,
      Field,
      FieldDescription,
      FieldError,
      FieldLabel,
    },
    setup: () => ({
      open: ref(false),
      value: ref(''),
      frameworks: [
        { value: 'next', label: 'Next.js' },
        { value: 'sveltekit', label: 'SvelteKit' },
        { value: 'nuxt', label: 'Nuxt.js' },
        { value: 'remix', label: 'Remix' },
        { value: 'astro', label: 'Astro' },
      ],
    }),
    template: `
      <Field data-invalid>
        <FieldLabel for="framework-invalid">Framework</FieldLabel>
        <Combobox v-model:open="open">
          <ComboboxTrigger
            id="framework-invalid"
            class="nx:w-64"
            aria-invalid="true"
            aria-describedby="framework-invalid-description framework-invalid-error"
          >
            <span :class="['nx:min-w-0 nx:flex-1 nx:truncate nx:text-left', { 'nx:text-muted-foreground': !value }]">{{ frameworks.find((framework) => framework.value === value)?.label ?? 'Select framework' }}</span>
          </ComboboxTrigger>
          <ComboboxContent label="Framework">
            <ComboboxInput placeholder="Search framework..." />
            <ComboboxList>
              <ComboboxEmpty>No framework found.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem
                  v-for="framework in frameworks"
                  :key="framework.value"
                  :value="framework.value"
                  :keywords="[framework.label]"
                  :selected="value === framework.value"
                  @select="value = $event === value ? '' : $event; open = false"
                >{{ framework.label }}</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription id="framework-invalid-description">
          Choose the framework used by this project.
        </FieldDescription>
        <FieldError id="framework-invalid-error">
          Select a supported framework.
        </FieldError>
      </Field>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');

    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  },
};

export const ClickInteraction: Story = {
  render: () => ({
    components: { ComboboxExample },
    template: '<ComboboxExample />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Astro' })
    );

    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Astro' })).toBeInTheDocument();
    });
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: { ComboboxExample },
    template: '<ComboboxExample />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await userEvent.click(trigger);
    const input = await within(document.body).findByRole('combobox', {
      name: 'Framework',
    });

    await userEvent.type(input, 'rem');
    const listbox = within(document.body).getByRole('listbox');
    await expect(
      within(listbox).getByRole('option', { name: 'Remix' })
    ).toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Remix' })).toBeInTheDocument();
    });
  },
};

export const ClearOnReselect: Story = {
  render: () => ({
    components: { ComboboxExample },
    template: '<ComboboxExample default-value="next" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Next.js' });

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Next.js' })
    );

    await waitFor(() => {
      expect(
        canvas.getByRole('button', { name: 'Select framework' })
      ).toBeInTheDocument();
    });
  },
};

export const EmptyResults: Story = {
  render: () => ({
    components: { ComboboxExample },
    template: '<ComboboxExample />',
  }),
  parameters: {
    a11y: {
      // aria-required-children flags the transient absence of option children
      // while the query matches nothing, which is expected here. All other a11y
      // rules stay enabled. Mirrors the Command Empty story.
      options: { rules: { 'aria-required-children': { enabled: false } } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await userEvent.click(trigger);
    const input = await within(document.body).findByRole('combobox', {
      name: 'Framework',
    });

    await userEvent.type(input, 'zzz');
    await expect(
      await within(document.body).findByText('No framework found.')
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { ComboboxExample },
    template: '<ComboboxExample />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await expect(trigger).toHaveAttribute('data-slot', 'combobox-trigger');

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await expect(listbox).toHaveAttribute('data-slot', 'combobox-list');
    const items = Array.from(
      listbox.querySelectorAll('[data-slot="combobox-item"]')
    );
    await expectImmediateItemMotion(items);
    await expect(
      within(listbox).getByRole('option', { name: 'Next.js' })
    ).toHaveAttribute('data-slot', 'combobox-item');

    await userEvent.keyboard('{Escape}');
  },
};
