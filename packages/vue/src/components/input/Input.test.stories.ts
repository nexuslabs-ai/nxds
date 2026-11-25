import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';

import inputMeta, {
  BorderlessStates,
  GhostStates,
  WithDataAttributes,
} from './Input.stories';

const meta = {
  ...inputMeta,
  title: 'Tests/Input',
};

export default meta;
type Story = StoryObj<typeof inputMeta>;

// Play functions can't put an element in a real `:hover` state, so this reads
// the border colours that `:hover` rules would apply to the element if it were
// hovered. Nested rules resolve `&` against their parent selector.
function hoverBorderColors(element: Element) {
  const unescapedHover = /(?<!\\):hover/g;
  const colors: string[] = [];

  function visit(rules: CSSRuleList, parent: string) {
    for (const rule of rules) {
      const selector =
        rule instanceof CSSStyleRule
          ? rule.selectorText.replace(/(?<!\\)&/g, `:is(${parent})`)
          : parent;
      const color =
        (rule instanceof CSSStyleRule ||
          rule instanceof CSSNestedDeclarations) &&
        rule.style.getPropertyValue('border-color');
      const unhovered = selector.replace(unescapedHover, '');
      if (color && unhovered !== selector && element.matches(unhovered)) {
        colors.push(color);
      }
      if (rule instanceof CSSGroupingRule || rule instanceof CSSStyleRule) {
        visit(rule.cssRules, selector);
      }
    }
  }

  for (const sheet of document.styleSheets) visit(sheet.cssRules, '');
  return colors;
}

export const BorderlessStatesStyle: Story = {
  ...BorderlessStates,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('input-borderless-empty');
    const invalid = canvas.getByTestId('input-borderless-invalid');
    const disabled = canvas.getByTestId('input-borderless-disabled');

    await expect(empty).toHaveClass('nx:border-transparent');
    await expect(empty).toHaveClass('nx:bg-control-background');
    await expect(empty).toHaveClass(
      'nx:enabled:hover:bg-control-background-hover'
    );

    await expect(invalid).toHaveClass('nx:aria-invalid:border-error-border');
    // A borderless field keeps a transparent border, and the invalid state
    // recolours it in place.
    const restStyles = window.getComputedStyle(empty);
    await expect(Number.parseFloat(restStyles.borderTopWidth)).toBeGreaterThan(
      0
    );
    await expect(restStyles.borderTopColor).toBe('rgba(0, 0, 0, 0)');

    const invalidStyles = window.getComputedStyle(invalid);
    await expect(
      Number.parseFloat(invalidStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(invalidStyles.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(invalidStyles.boxShadow).toBe('none');

    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:disabled:border-border-disabled'
    );
  },
};

export const GhostStatesStyle: Story = {
  ...GhostStates,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const filled = canvas.getByTestId('input-ghost-filled');
    const invalid = canvas.getByTestId('input-ghost-invalid');

    const rest = window.getComputedStyle(filled);
    await expect(rest.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    await expect(rest.backgroundColor).toBe('rgba(0, 0, 0, 0)');

    await expect(hoverBorderColors(filled)).toEqual([
      'var(--nx-color-border-default)',
    ]);

    await expect(window.getComputedStyle(invalid).borderTopColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expect(hoverBorderColors(invalid)).toHaveLength(0);

    filled.focus();
    await expect(hoverBorderColors(filled)).toHaveLength(0);
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveClass('nx:bg-container');
    await expect(input).toHaveClass('nx:enabled:hover:bg-container-hover');
    await expectAutofillPaired(input);
  },
};
