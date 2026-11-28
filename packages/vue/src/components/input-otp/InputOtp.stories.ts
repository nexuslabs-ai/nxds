import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, type Mock, userEvent } from 'storybook/test';
import { ref } from 'vue';

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '.';

type InputOTPArgs = InstanceType<typeof InputOTP>['$props'] & {
  'aria-label'?: string;
  'onUpdate:modelValue'?: Mock<(value: string) => void>;
  onComplete?: Mock<(value: string) => void>;
};

const SixDigitSlots = {
  components: { InputOTPGroup, InputOTPSlot },
  template: `
    <InputOTPGroup>
      <InputOTPSlot v-for="index in 6" :key="index" :index="index - 1" />
    </InputOTPGroup>
  `,
};

function slotsIn(scene: HTMLElement) {
  return Array.from(
    scene.querySelectorAll<HTMLInputElement>('[data-slot="input-otp-slot"]')
  );
}

const meta = {
  component: InputOTP,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'InputOTP collects a one-time code, with one slot per character. Use it for verification and sign-in codes. For other short text, use Input.',
      },
    },
  },
  args: {
    'aria-label': 'One-time password',
    'onUpdate:modelValue': fn(),
    onComplete: fn(),
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Prevents input.',
    },
  },
  render: (args) => ({
    components: { InputOTP, SixDigitSlots },
    setup: () => ({ args }),
    template: '<InputOTP v-bind="args"><SixDigitSlots /></InputOTP>',
  }),
} satisfies Meta<InputOTPArgs>;

export default meta;
type Story = StoryObj<InputOTPArgs>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { InputOTP, InputOTPGroup, InputOTPSlot },
    template: `
      <InputOTP aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot :index="0" />
          <InputOTPSlot :index="1" />
          <InputOTPSlot :index="2" />
          <InputOTPSlot :index="3" />
          <InputOTPSlot :index="4" />
          <InputOTPSlot :index="5" />
        </InputOTPGroup>
      </InputOTP>
    `,
  }),
};

export const WithSeparator: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Split a six-digit code into two groups of three with a separator.',
      },
    },
  },
  render: () => ({
    components: { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot },
    template: `
      <InputOTP aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot :index="0" />
          <InputOTPSlot :index="1" />
          <InputOTPSlot :index="2" />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot :index="3" />
          <InputOTPSlot :index="4" />
          <InputOTPSlot :index="5" />
        </InputOTPGroup>
      </InputOTP>
    `,
  }),
  play: async ({ canvasElement }) => {
    const separator = canvasElement.querySelector(
      '[data-slot="input-otp-separator"]'
    );

    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('aria-hidden', 'true');
    await expect(separator).not.toHaveAttribute('role');
    await expect(
      canvasElement.querySelectorAll('[data-slot="input-otp-group"]').length
    ).toBe(2);
  },
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Dim every slot and block input while the field is disabled.',
      },
    },
  },
  render: () => ({
    components: { InputOTP, InputOTPGroup, InputOTPSlot },
    template: `
      <InputOTP disabled aria-label="One-time password">
        <InputOTPGroup>
          <InputOTPSlot :index="0" />
          <InputOTPSlot :index="1" />
          <InputOTPSlot :index="2" />
          <InputOTPSlot :index="3" />
          <InputOTPSlot :index="4" />
          <InputOTPSlot :index="5" />
        </InputOTPGroup>
      </InputOTP>
    `,
  }),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp-slot"]'
    );

    await expect(input).toBeDisabled();
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const slots = slotsIn(canvasElement);

    await userEvent.click(slots[0]!);
    await userEvent.keyboard('123456');

    await expect(slots.map((slot) => slot.value).join('')).toBe('123456');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
    await expect(args.onComplete).toHaveBeenCalledWith('123456');
  },
};

export const Paste: Story = {
  play: async ({ canvasElement, args }) => {
    const slots = slotsIn(canvasElement);

    await userEvent.click(slots[0]!);
    await userEvent.paste('123456');

    await expect(slots.map((slot) => slot.value).join('')).toBe('123456');
    await expect(args.onComplete).toHaveBeenCalledWith('123456');
  },
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[data-slot="input-otp-slot"]'
    );
    await expect(input).toBeInTheDocument();
    // Each slot is its own <input> — every play-fn query depends on it.
    await expect(input?.tagName).toBe('INPUT');
    await expect(input).toHaveAccessibleName(/one-time password/i);
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code');

    const group = canvasElement.querySelector('[data-slot="input-otp-group"]');
    await expect(group).toBeInTheDocument();

    const slots = canvasElement.querySelectorAll(
      '[data-slot="input-otp-slot"]'
    );
    await expect(slots.length).toBe(6);
  },
};

export const SlotNaming: Story = {
  render: () => ({
    components: { InputOTP, SixDigitSlots },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <InputOTP aria-label="One-time password">
          <SixDigitSlots />
        </InputOTP>
        <span id="otp-invalid-label">Recovery code</span>
        <InputOTP aria-labelledby="otp-invalid-label" aria-invalid="true">
          <SixDigitSlots />
        </InputOTP>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [named, labelled] = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="input-otp"]')
    ).map(slotsIn);

    await expect(named![0]).toHaveAccessibleName(
      'One-time password, character 1'
    );
    await expect(named![1]).toHaveAccessibleName(
      'One-time password, character 2'
    );
    await expect(named![0]).not.toHaveAttribute('aria-invalid');

    await expect(labelled![0]).toHaveAccessibleName('Recovery code');
    await expect(labelled![0]).toHaveAttribute(
      'aria-labelledby',
      'otp-invalid-label'
    );
    await expect(labelled![0]).toHaveAttribute('aria-invalid', 'true');
    await expect(labelled![5]).toHaveAttribute('aria-invalid', 'true');
  },
};

export const VModel: Story = {
  render: () => ({
    components: { InputOTP, SixDigitSlots },
    setup: () => ({ code: ref('42') }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <InputOTP v-model="code" aria-label="One-time password">
          <SixDigitSlots />
        </InputOTP>
        <output data-testid="code">{{ code }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const slots = slotsIn(canvasElement);
    const code = canvasElement.querySelector('[data-testid="code"]');

    await expect(slots[0]).toHaveValue('4');
    await expect(slots[1]).toHaveValue('2');
    await userEvent.click(slots[2]!);
    await userEvent.keyboard('7');
    await expect(code).toHaveTextContent('427');

    await userEvent.click(slots[1]!);
    await userEvent.keyboard('{Delete}');
    await expect(code).toHaveTextContent('47');
    await expect(slots[1]).toHaveValue('7');
    await expect(slots[2]).toHaveValue('');
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: {
      InputOTP,
      InputOTPGroup,
      InputOTPSeparator,
      InputOTPSlot,
      SixDigitSlots,
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <InputOTP aria-label="One-time password">
          <SixDigitSlots />
        </InputOTP>
        <InputOTP aria-label="One-time password, split">
          <InputOTPGroup>
            <InputOTPSlot :index="0" />
            <InputOTPSlot :index="1" />
            <InputOTPSlot :index="2" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot :index="3" />
            <InputOTPSlot :index="4" />
            <InputOTPSlot :index="5" />
          </InputOTPGroup>
        </InputOTP>
        <InputOTP disabled aria-label="One-time password, disabled">
          <SixDigitSlots />
        </InputOTP>
      </div>
    `,
  }),
};
