import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { ChoiceCard } from './choice-card';
import choiceCardMeta, {
  AllVariants,
  Default,
  Disabled,
  EdgeCases,
  Indeterminate,
  Invalid,
  TrailingControl,
  WithDataAttributes,
  WithRadioGroup,
} from './ChoiceCard.stories';

const meta: Meta<typeof ChoiceCard> = {
  ...choiceCardMeta,
  title: 'Tests/ChoiceCard',
};

export default meta;
type Story = StoryObj<typeof ChoiceCard>;

function getRequiredElement<T extends HTMLElement>(
  root: ParentNode,
  selector: string
) {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element for selector: ${selector}`);
  return element;
}

function getCardFor(root: ParentNode, controlId: string) {
  return getRequiredElement<HTMLLabelElement>(
    root,
    `[data-slot="choice-card"][for="${controlId}"]`
  );
}

function getBorderColor(element: HTMLElement) {
  return getComputedStyle(element).borderTopColor;
}

function getBackgroundColor(element: HTMLElement) {
  return getComputedStyle(element).backgroundColor;
}

export const DefaultStyle: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Product updates',
    });

    await expect(getComputedStyle(checkbox).marginTop).toBe('2px');
  },
};

export const WithRadioGroupStyle: Story = {
  ...WithRadioGroup,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standard = canvas.getByRole('radio', { name: 'Standard' });

    await expect(getComputedStyle(standard).marginTop).toBe('2px');
  },
};

export const TrailingControlStyle: Story = {
  ...TrailingControl,
  play: async ({ canvasElement }) => {
    const checkbox = getRequiredElement<HTMLInputElement>(
      canvasElement,
      '#choice-card-trailing'
    );

    await expect(getComputedStyle(checkbox).marginTop).toBe('2px');
  },
};

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledCard = getCardFor(canvasElement, 'choice-card-disabled');
    const disabledCheckedCard = getCardFor(
      canvasElement,
      'choice-card-disabled-checked'
    );
    const disabledInvalidCard = getCardFor(
      canvasElement,
      'choice-card-disabled-invalid'
    );
    const disabledRadioCard = getCardFor(
      canvasElement,
      'choice-card-disabled-radio'
    );

    await userEvent.click(
      canvas.getByText('This setting is managed by your workspace.')
    );

    await expect(getComputedStyle(disabledCard).cursor).toBe('not-allowed');
    await expect(getComputedStyle(disabledCheckedCard).cursor).toBe(
      'not-allowed'
    );
    await expect(getComputedStyle(disabledInvalidCard).cursor).toBe(
      'not-allowed'
    );
    await expect(getComputedStyle(disabledRadioCard).cursor).toBe(
      'not-allowed'
    );
    await expect(getBorderColor(disabledCheckedCard)).toBe(
      getBorderColor(disabledCard)
    );
    await expect(getBorderColor(disabledInvalidCard)).toBe(
      getBorderColor(disabledCard)
    );
    await expect(getBorderColor(disabledRadioCard)).toBe(
      getBorderColor(disabledCard)
    );
  },
};

export const InvalidStyle: Story = {
  ...Invalid,
  play: async ({ canvasElement }) => {
    const unselectedCard = getCardFor(
      canvasElement,
      'choice-card-invalid-unselected'
    );
    const selectedCard = getCardFor(
      canvasElement,
      'choice-card-invalid-selected'
    );
    const invalidCard = getCardFor(canvasElement, 'choice-card-invalid');
    const invalidRadioCard = getCardFor(
      canvasElement,
      'choice-card-invalid-radio'
    );

    await expect(getBorderColor(selectedCard)).not.toBe(
      getBorderColor(unselectedCard)
    );
    await expect(getBorderColor(invalidCard)).not.toBe(
      getBorderColor(selectedCard)
    );
    await expect(getBorderColor(invalidRadioCard)).toBe(
      getBorderColor(invalidCard)
    );
  },
};

export const IndeterminateStyle: Story = {
  ...Indeterminate,
  play: async ({ canvasElement }) => {
    const unselectedCard = getCardFor(
      canvasElement,
      'choice-card-indeterminate-unselected'
    );
    const checkedCard = getCardFor(
      canvasElement,
      'choice-card-indeterminate-checked'
    );
    const indeterminateCard = getCardFor(
      canvasElement,
      'choice-card-indeterminate'
    );

    await expect(getBorderColor(checkedCard)).not.toBe(
      getBorderColor(unselectedCard)
    );
    await expect(getBorderColor(indeterminateCard)).toBe(
      getBorderColor(checkedCard)
    );
    await expect(getBackgroundColor(indeterminateCard)).toBe(
      getBackgroundColor(checkedCard)
    );
  },
};

export const WithDataAttributesSize: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const card = getCardFor(canvasElement, 'choice-card-data');

    await expect(
      Math.round(card.getBoundingClientRect().height)
    ).toBeGreaterThanOrEqual(44);
  },
};

export const EdgeCasesStyle: Story = {
  ...EdgeCases,
  play: async ({ canvasElement }) => {
    const referenceCard = getCardFor(
      canvasElement,
      'choice-card-edge-reference'
    );
    const decoyCard = getCardFor(canvasElement, 'choice-card-edge-decoy');

    await expect(getBorderColor(decoyCard)).toBe(getBorderColor(referenceCard));
    await expect(getBackgroundColor(decoyCard)).toBe(
      getBackgroundColor(referenceCard)
    );
  },
};

export const EdgeCasesGeometry: Story = {
  ...EdgeCases,
  play: async ({ canvasElement }) => {
    const longTitle = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-edge-long-title'
    );
    const longDescription = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-edge-long-description'
    );

    await expect(longTitle.scrollWidth).toBeLessThanOrEqual(
      longTitle.clientWidth + 1
    );
    await expect(longDescription.scrollWidth).toBeLessThanOrEqual(
      longDescription.clientWidth + 1
    );
  },
};

export const AllVariantsStyle: Story = {
  ...AllVariants,
  play: async ({ canvasElement }) => {
    const checkboxBordered = getCardFor(
      canvasElement,
      'choice-card-checkbox-bordered'
    );
    const checkboxBorderless = getCardFor(
      canvasElement,
      'choice-card-checkbox-borderless'
    );
    const radioBordered = getCardFor(
      canvasElement,
      'choice-card-radio-bordered'
    );
    const radioBorderless = getCardFor(
      canvasElement,
      'choice-card-radio-borderless'
    );
    const trailingRadio = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-card-radio-borderless'
    );

    await expect(getBorderColor(checkboxBorderless)).not.toBe(
      getBorderColor(checkboxBordered)
    );
    await expect(getBorderColor(radioBorderless)).toBe(
      getBorderColor(radioBordered)
    );
    await expect(getComputedStyle(trailingRadio).marginTop).toBe('2px');
  },
};
