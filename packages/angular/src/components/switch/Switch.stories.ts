import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField } from '@angular/forms/signals';
import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, fn, type Mock, userEvent, within } from 'storybook/test';

import { NxSwitch } from './switch';

// `aria-label` belongs to the switch element, so it is not a declared input.
type SwitchArgs = {
  checked: boolean;
  disabled: boolean;
  size: 'default' | 'sm';
  ariaLabel?: string;
  checkedChange: Mock<(checked: boolean) => void>;
};

const meta: Meta<SwitchArgs> = {
  title: 'Components/Switch',
  parameters: {
    docs: {
      description: {
        component:
          'Switch turns a setting on or off right away, with no save step. Pair it with a label so the label text is clickable too.',
      },
    },
  },
  component: NxSwitch,
  decorators: [moduleMetadata({ imports: [NxSwitch] })],
  args: {
    checked: false,
    disabled: false,
    size: 'default',
    checkedChange: fn(),
  },
  argTypes: {
    size: { control: 'select', options: ['default', 'sm'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template:
      '<button nxSwitch [checked]="checked" [disabled]="disabled" [size]="size" [attr.aria-label]="ariaLabel ?? null" (checkedChange)="checkedChange($event)"></button>',
  }),
};

export default meta;
type Story = StoryObj<SwitchArgs>;

// Docs stories: the docs site shows these, in this order.

export const WithLabel: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <button nxSwitch id="airplane-mode"></button>
        <label for="airplane-mode">Airplane mode</label>
      </div>
    `,
  }),
};

export const Checked: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `checked` to start the switch in the on position.',
      },
    },
  },
  render: () => ({
    template: `
      <button nxSwitch aria-label="Toggle switch" [checked]="true"></button>
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
    template: `
      <button nxSwitch aria-label="Toggle switch" disabled></button>
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
    template: `
      <button nxSwitch size="sm" aria-label="Toggle switch"></button>
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
    template: `
      <div class="nx:flex nx:items-center nx:justify-between nx:gap-4 nx:rounded-lg nx:border-default nx:border-border-default nx:p-4">
        <div class="nx:space-y-0.5">
          <label for="marketing-emails">Marketing emails</label>
          <p id="marketing-emails-description" class="nx:typography-body-default nx:text-muted-foreground">
            Receive emails about new products and features.
          </p>
        </div>
        <button nxSwitch id="marketing-emails" aria-describedby="marketing-emails-description"></button>
      </div>
    `,
  }),
};

export const ClickInteraction: Story = {
  args: {
    ariaLabel: 'Toggle switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // Initially unchecked
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');

    // Click to toggle on
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'checked');
    await expect(args.checkedChange).toHaveBeenCalledWith(true);

    // Click to toggle off
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args.checkedChange).toHaveBeenCalledWith(false);
  },
};

export const KeyboardInteraction: Story = {
  args: {
    ariaLabel: 'Toggle switch',
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
    await expect(args.checkedChange).toHaveBeenCalledWith(true);

    // Space to toggle off
    await userEvent.keyboard(' ');
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args.checkedChange).toHaveBeenCalledWith(false);
  },
};

export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    ariaLabel: 'Disabled switch',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeDisabled();

    // Click should not toggle
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    await expect(args.checkedChange).not.toHaveBeenCalled();
  },
};

export const DisabledChecked: Story = {
  args: {
    ariaLabel: 'Toggle switch',
    disabled: true,
    checked: true,
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
    template: `
      <div class="nx:grid nx:gap-2">
        <div class="nx:flex nx:items-center nx:gap-2">
          <button nxSwitch id="required-setting" aria-invalid="true" aria-describedby="required-setting-error"></button>
          <label for="required-setting" class="nx:typography-label-default">Enable required setting</label>
        </div>
        <p id="required-setting-error" class="nx:typography-body-default nx:text-error-subtle-foreground">
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
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <button nxSwitch id="label-click-switch"></button>
        <label for="label-click-switch">Airplane mode</label>
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
    ariaLabel: 'Toggle switch',
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

export const TwoWayBinding: Story = {
  render: () => ({
    props: { enabled: true },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <button nxSwitch id="emails" [(checked)]="enabled"></button>
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

export const NgModel: Story = {
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  render: () => ({
    props: { enabled: true },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <button nxSwitch id="ng-model-emails" [(ngModel)]="enabled"></button>
        <label for="ng-model-emails">Emails {{ enabled ? 'on' : 'off' }}</label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('switch')).toBeChecked();
    await userEvent.click(canvas.getByRole('switch'));
    await expect(canvas.getByText('Emails off')).toBeVisible();
  },
};

/** Toggles a reactive form control, then disables it. */
export const ReactiveForm: Story = {
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  render: () => ({
    props: { emails: new FormControl(true, { nonNullable: true }) },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <button nxSwitch id="reactive-emails" [formControl]="emails"></button>
        <label for="reactive-emails">Emails {{ emails.value ? 'on' : 'off' }}</label>
        <button type="button" (click)="emails.disable()">Lock settings</button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeChecked();
    await userEvent.click(switchEl);
    await expect(canvas.getByText('Emails off')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Lock settings' })
    );
    await expect(switchEl).toBeDisabled();
  },
};

@Component({
  selector: 'nx-switch-signal-form',
  imports: [NxSwitch, FormField],
  template: `
    <div class="nx:flex nx:items-center nx:gap-2">
      <button
        nxSwitch
        id="signal-emails"
        [formField]="settings.emails"
      ></button>
      <label for="signal-emails"
        >Emails {{ model().emails ? 'on' : 'off' }}</label
      >
      <button type="button" (click)="locked.set(true)">Lock settings</button>
    </div>
  `,
})
class SignalFormSettings {
  protected readonly model = signal({ emails: true });
  protected readonly locked = signal(false);
  protected readonly settings = form(this.model, (path) =>
    disabled(path.emails, { when: () => this.locked() })
  );
}

/** Toggles a Signal Forms field, then disables it. */
export const SignalForm: Story = {
  decorators: [moduleMetadata({ imports: [SignalFormSettings] })],
  render: () => ({ template: '<nx-switch-signal-form />' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toBeChecked();
    await userEvent.click(switchEl);
    await expect(canvas.getByText('Emails off')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Lock settings' })
    );
    await expect(switchEl).toBeDisabled();
  },
};
