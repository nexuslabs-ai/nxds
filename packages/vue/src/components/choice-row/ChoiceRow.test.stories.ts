import type { StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';

import choiceRowMeta, {
  EdgeCases,
  WithDataAttributes,
} from './ChoiceRow.stories';

const meta = {
  ...choiceRowMeta,
  title: 'Tests/ChoiceRow',
};

export default meta;
type Story = StoryObj<typeof choiceRowMeta>;

function getRequiredElement<T extends HTMLElement>(
  root: ParentNode,
  selector: string
) {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element for selector: ${selector}`);
  return element;
}

export const WithDataAttributesSize: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const row = getRequiredElement<HTMLLabelElement>(
      canvasElement,
      '[data-slot="choice-row"]'
    );

    await expect(
      Math.round(row.getBoundingClientRect().height)
    ).toBeGreaterThanOrEqual(32);
  },
};

export const EdgeCasesGeometry: Story = {
  ...EdgeCases,
  play: async ({ canvasElement }) => {
    const longTitle = getRequiredElement<HTMLElement>(
      canvasElement,
      '#choice-edge-long-title'
    );

    await expect(longTitle.scrollWidth).toBeGreaterThan(longTitle.clientWidth);
  },
};
