import { DENSITY_OPTIONS } from '@nxds/core';
import { PhCheck } from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ref, useId } from 'vue';

import { expectInsideBorder } from '../../stories/support/story-height-test-utils';

import { Switch } from '.';

// `aria-label` falls through to the switch element, so it is not a declared prop.
type SwitchArgs = InstanceType<typeof Switch>['$props'] & {
  'aria-label'?: string;
};

const meta = {
  title: 'Components/Switch',
  parameters: {
    docs: {
      description: {
        component:
          'Switch turns a setting on or off right away, with no save step. Pair it with a label so the label text is clickable too.',
      },
    },
  },
  component: Switch,
  args: {
    'onUpdate:modelValue': fn(),
  },
  argTypes: {
    size: { control: 'select', options: ['default', 'sm'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    components: { Switch },
    setup: () => ({ args }),
    template: '<Switch v-bind="args" />',
  }),
} satisfies Meta<SwitchArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const WithLabel: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Switch },
    setup: () => ({ switchId: useId() }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch :id="switchId" />
        <label :for="switchId">Airplane mode</label>
      </div>
    `,
  }),
};

export const Checked: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `default-value` to start the switch in the on position.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    template: `
      <Switch aria-label="Toggle switch" :default-value="true" />
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'A disabled switch shows muted colors and ignores clicks.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    template: `
      <Switch aria-label="Toggle switch" disabled />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();
    // An unchecked-disabled switch recolors its border via a semantic disabled
    // token at full opacity (not a fade).
    await expect(switchEl).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(switchEl).opacity).toBe('1');
  },
};

export const Small: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="sm"` for dense rows.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    template: `
      <Switch size="sm" aria-label="Toggle switch" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toHaveAttribute('data-size', 'sm');

    // The smaller control still toggles (geometry-only size change).
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
  },
};

export const LabelOnLeft: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put the label and description on the left of a settings row.',
      },
    },
  },
  render: () => ({
    components: { Switch },
    setup: () => ({ switchId: useId(), descriptionId: useId() }),
    template: `
      <div class="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:rounded-lg nx:border-default nx:border-border-default nx:p-4">
        <div class="nx:space-y-0.5">
          <label :for="switchId">Marketing emails</label>
          <p :id="descriptionId" class="nx:typography-body-default nx:text-muted-foreground">
            Receive emails about new products and features.
          </p>
        </div>
        <Switch :id="switchId" :aria-describedby="descriptionId" />
      </div>
    `,
  }),
};

export const ClickInteraction: Story = {
  args: {
    'aria-label': 'Toggle switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // Initially unchecked
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');

    // Click to toggle on
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true);

    // Click to toggle off
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(false);
  },
};

export const KeyboardInteraction: Story = {
  args: {
    'aria-label': 'Toggle switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // Tab to focus
    await userEvent.tab();
    await expect(switchEl).toHaveFocus();

    // Space to toggle on
    await userEvent.keyboard(' ');
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true);

    // Space to toggle off
    await userEvent.keyboard(' ');
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(false);
  },
};

export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    'aria-label': 'Disabled switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();

    // Click should not toggle
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
  },
};

export const DisabledChecked: Story = {
  args: {
    'aria-label': 'Toggle switch',
    disabled: true,
    defaultValue: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();
    // A checked-disabled switch fills via a semantic primary-disabled token at
    // full opacity (not a fade).
    await expect(switchEl).toHaveClass(
      'nx:data-[state=checked]:disabled:bg-primary-disabled'
    );
    await expect(getComputedStyle(switchEl).opacity).toBe('1');
  },
};

export const Invalid: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ switchId: useId(), errorId: useId() }),
    template: `
      <div class="nx:grid nx:gap-2">
        <div class="nx:flex nx:items-center nx:gap-2">
          <Switch :id="switchId" aria-invalid="true" :aria-describedby="errorId" />
          <label :for="switchId" class="nx:typography-label-default">Enable required setting</label>
        </div>
        <p :id="errorId" class="nx:typography-body-default nx:text-error-subtle-foreground">
          This setting must be enabled to continue.
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    const error = canvas.getByText('This setting must be enabled to continue.');

    await expect(switchEl).toHaveAttribute('aria-invalid', 'true');
    await expect(switchEl).toHaveAttribute('aria-describedby', error.id);
    await expect(switchEl).toHaveAccessibleDescription(
      'This setting must be enabled to continue.'
    );
    await expect(switchEl).toHaveClass('nx:aria-invalid:border-error-border');
    await expect(switchEl).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
    await expect(switchEl).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:border-primary-background'
    );
  },
};

export const LabelClick: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ switchId: useId() }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch :id="switchId" />
        <label :for="switchId">Airplane mode</label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Airplane mode'));
    await expect(canvas.getByRole('switch')).toHaveAttribute(
      'data-state',
      'checked'
    );
  },
};

export const WithDataAttributes: Story = {
  args: {
    'aria-label': 'Toggle switch',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // Check data-slot attribute
    await expect(switchEl).toHaveAttribute('data-slot', 'switch');

    // Default size resolves to data-size="default"
    await expect(switchEl).toHaveAttribute('data-size', 'default');

    // Check thumb has data-slot
    const thumb = switchEl.querySelector('[data-slot="switch-thumb"]');
    await expect(thumb).toBeInTheDocument();
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);
const STROKES = ['fine', 'normal', 'strong'] as const;

export const SizesAtEveryDensity: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ densities: DENSITIES }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <div
          v-for="density in densities"
          :key="density"
          :data-density="density"
          :data-testid="'row-' + density"
          class="nx:flex nx:items-center nx:gap-3"
        >
          <Switch :default-value="true" :aria-label="'Default size, ' + density" />
          <Switch size="sm" :default-value="true" :aria-label="'Small size, ' + density" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const size = (element: Element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    };
    const reference = within(canvas.getByTestId('row-default'))
      .getAllByRole('switch')
      .map(size);
    for (const density of DENSITIES) {
      const controls = within(
        canvas.getByTestId(`row-${density}`)
      ).getAllByRole('switch');
      // Each switch keeps its Default size at every density.
      await expect(controls.map(size)).toEqual(reference);
      // The thumb stays inside the track's border at every density.
      for (const control of controls) {
        await expectInsideBorder(
          control.querySelector('[data-slot="switch-thumb"]')!,
          control
        );
      }
    }
  },
};

export const ThumbAtEveryStroke: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ strokes: STROKES }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <div
          v-for="stroke in strokes"
          :key="stroke"
          :data-borderwidth="stroke"
          :data-testid="'row-' + stroke"
          class="nx:flex nx:items-center nx:gap-3"
        >
          <Switch :aria-label="'Off, ' + stroke" />
          <Switch :default-value="true" :aria-label="'On, ' + stroke" />
          <Switch size="sm" :aria-label="'Small off, ' + stroke" />
          <Switch size="sm" :default-value="true" :aria-label="'Small on, ' + stroke" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const stroke of STROKES) {
      const controls = within(canvas.getByTestId(`row-${stroke}`)).getAllByRole(
        'switch'
      );
      // The thumb is a circle as tall as the inside of the track, and it
      // stays inside the border, on and off, at every stroke.
      for (const control of controls) {
        const thumb = control.querySelector<HTMLElement>(
          '[data-slot="switch-thumb"]'
        )!;
        await expect(thumb.offsetHeight).toBe(control.clientHeight);
        await expect(thumb.offsetWidth).toBe(thumb.offsetHeight);
        await expectInsideBorder(thumb, control);
      }
    }
  },
};

export const TargetArea: Story = {
  render: () => ({
    components: { Switch },
    template: `<Switch aria-label="Email alerts" />`,
  }),
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('switch');
    const box = control.getBoundingClientRect();
    // A press 1px outside the track still lands on its 24px-high target,
    // at the middle and near the end of the track.
    await expect(
      document.elementFromPoint(box.left + box.width / 2, box.top - 1)
    ).toBe(control);
    await expect(document.elementFromPoint(box.left + 3, box.bottom + 1)).toBe(
      control
    );
  },
};

export const VModel: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ enabled: ref(true) }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch id="emails" v-model="enabled" />
        <label for="emails">Emails {{ enabled ? 'on' : 'off' }}</label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Emails on')).toBeVisible();
    await userEvent.click(canvas.getByRole('switch'));
    await expect(canvas.getByText('Emails off')).toBeVisible();
  },
};

export const ThumbSlot: Story = {
  render: () => ({
    components: { PhCheck, Switch },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Switch id="auto-save">
          <template #thumb="{ checked }">
            <PhCheck
              v-if="checked"
              aria-hidden="true"
              class="nx:size-4 nx:p-0.5 nx:text-primary-background"
            />
          </template>
        </Switch>
        <label for="auto-save">Auto-save</label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch');
    const thumb = toggle.querySelector('[data-slot="switch-thumb"]');

    await expect(thumb?.querySelector('svg')).toBeNull();
    await userEvent.click(toggle);
    await expect(thumb?.querySelector('svg')).not.toBeNull();
  },
};
