import type { StoryObj } from '@storybook/vue3-vite';
import { expect, type Mock, userEvent, waitFor } from 'storybook/test';

import inputOtpMeta, { Disabled, WithDataAttributes } from './InputOtp.stories';

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

function slotLefts(slots: HTMLElement[]) {
  return slots.map((slot) => slot.getBoundingClientRect().left);
}

async function expectCollapsedWithinGroups(slots: HTMLElement[]) {
  for (const slot of slots) {
    const previous = slot.previousElementSibling;
    if (!previous) continue;

    await expect(slot.getBoundingClientRect().left).toBeCloseTo(
      previous.getBoundingClientRect().right -
        Number.parseFloat(getComputedStyle(previous).borderRightWidth),
      1
    );
  }
}

async function expectActiveSlotRing({
  slots,
  index,
  restLefts,
  restBorderColor,
}: {
  slots: HTMLElement[];
  index: number;
  restLefts: number[];
  restBorderColor: string;
}) {
  await waitFor(() =>
    expect(slots.findIndex((slot) => slot.dataset.active === 'true')).toBe(
      index
    )
  );

  const styles = getComputedStyle(slots[index]!);

  await expect(styles.borderLeftColor).not.toBe(restBorderColor);
  await expect(styles.borderLeftColor).toBe(styles.borderTopColor);
  await expect(styles.outlineStyle).toBe('solid');

  await expect(slotLefts(slots)).toEqual(restLefts);
}

const meta = {
  ...inputOtpMeta,
  title: 'Tests/InputOTP',
};

export default meta;
type Story = StoryObj<InputOTPArgs>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    // A disabled OTP field dims its slots via the root's has-[:disabled] hook,
    // using a semantic boundary token at full opacity (not a fade).
    const slot = slotsIn(canvasElement)[0]!;
    // border-disabled derives the same value as border-default, so only the
    // class can prove the disabled token is wired.
    await expect(slot).toHaveClass(
      'nx:group-has-[:disabled]/input-otp:border-border-disabled'
    );
    await expect(
      Number.parseFloat(getComputedStyle(slot).borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(getComputedStyle(slot).boxShadow).toBe('none');
    await expect(getComputedStyle(slot).opacity).toBe('1');
  },
};

export const ActiveSlotRing: Story = {
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
        <div data-testid="joined">
          <InputOTP aria-label="One-time password">
            <SixDigitSlots />
          </InputOTP>
        </div>
        <div data-testid="split">
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
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const testId of ['joined', 'split']) {
      const scene = canvasElement.querySelector<HTMLElement>(
        `[data-testid="${testId}"]`
      )!;
      const input = scene.querySelector<HTMLInputElement>(
        'input[data-slot="input-otp-slot"]'
      )!;
      const slots = slotsIn(scene);
      const restLefts = slotLefts(slots);
      const restBorderColor = getComputedStyle(slots[0]!).borderLeftColor;

      await expectCollapsedWithinGroups(slots);

      await userEvent.click(input);
      await userEvent.keyboard('123');
      await expectActiveSlotRing({
        slots,
        index: 3,
        restLefts,
        restBorderColor,
      });

      await userEvent.keyboard('456');
      await expectActiveSlotRing({
        slots,
        index: 5,
        restLefts,
        restBorderColor,
      });
    }

    const split = slotsIn(
      canvasElement.querySelector<HTMLElement>('[data-testid="split"]')!
    );

    await expect(split[3]!.getBoundingClientRect().left).toBeGreaterThan(
      split[2]!.getBoundingClientRect().right
    );
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const slots = canvasElement.querySelectorAll(
      '[data-slot="input-otp-slot"]'
    );
    await expect(slots[0]).toHaveClass('nx:bg-container');
  },
};
