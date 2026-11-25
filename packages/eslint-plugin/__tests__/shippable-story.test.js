import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import plugin from '../src/index.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const rule = plugin.rules['shippable-story'];

const VUE = [
  {
    storybookImports: ['@storybook/vue3-vite', 'storybook/test'],
    iconImports: ['@phosphor-icons/vue'],
  },
];

// What each message names as allowed, by default and with the Vue options.
const REACT_STORYBOOK = '`@storybook/react-vite` and `storybook/test`';
const VUE_STORYBOOK = '`@storybook/vue3-vite` and `storybook/test`';
const REACT_ICONS = '`@phosphor-icons/react/ssr`';

ruleTester.run('shippable-story', rule, {
  valid: [
    // The imports a shipped React story needs.
    `import { DownloadSimpleIcon } from '@phosphor-icons/react/ssr';
     import type { Meta, StoryObj } from '@storybook/react-vite';
     import { expect, fn, userEvent, within } from 'storybook/test';
     import { Button } from './button';
     import { STARTER_AVATARS } from './avatar.story-data';`,
    // Behaviour: roles, names, keyboard, focus, callbacks and ARIA states.
    `await userEvent.tab();
     await expect(canvas.getByRole('button', { name: 'Save' })).toHaveFocus();
     await userEvent.keyboard('{Enter}');
     await expect(args.onClick).toHaveBeenCalledTimes(1);
     await expect(link).toHaveAttribute('aria-disabled', 'true');
     await expect(trigger).toHaveAccessibleName('Close dialog');`,
    // Data attributes are the styling contract, so their checks ship.
    `await expect(button).toHaveAttribute('data-slot', 'button');
     await expect(button).toHaveAttribute('data-variant', 'secondary');`,
    // Finding an element by slot, role or test id needs no class.
    `const content = document.querySelector('[data-slot="dialog-content"]');
     const options = listbox.querySelectorAll('[role="option"]');
     const row = canvas.getByTestId('member-row').closest('tr');`,
    // A dot inside an attribute value is not a class.
    `const link = canvasElement.querySelector('a[href$=".pdf"]');`,
    // A meta with no title.
    `const meta = { component: Button, args: { onClick: fn() } } satisfies Meta<typeof Button>;
     export default meta;`,
    // A story's own `title` arg is not the meta's.
    `const meta: Meta<typeof Alert> = { component: Alert };
     export default meta;
     export const Default = { args: { title: 'Payment received' } };`,
    // Story data carries the picture, and a link is not an asset.
    `<AvatarImage src={STARTER_AVATARS[0].src} alt="Ada Lovelace" />`,
    `<a href="/settings/billing">Billing</a>`,
    `<img src="https://example.com/ada.svg" alt="" />`,
    {
      code: `import { PhDownloadSimple } from '@phosphor-icons/vue';
             import type { Meta, StoryObj } from '@storybook/vue3-vite';
             import { expect, within } from 'storybook/test';`,
      options: VUE,
    },
    {
      code: `export const Default = { render: () => ({ template: '<Button>Save</Button>' }) };`,
      options: VUE,
    },
  ],
  invalid: [
    {
      code: `await expect(button).toHaveClass('nx:underline-offset-4');`,
      errors: [{ messageId: 'classAssertion' }],
    },
    {
      code: `await expect(surface).not.toHaveClass('nx:data-[state=open]:animate-in');`,
      errors: [{ messageId: 'classAssertion' }],
    },
    {
      code: `await expect(label).toHaveClass(/tracking-/);`,
      errors: [{ messageId: 'classAssertion' }],
    },
    {
      code: `const focusStyles = getComputedStyle(button);`,
      errors: [
        { messageId: 'measurement', data: { name: 'getComputedStyle' } },
      ],
    },
    {
      code: `const style = window.getComputedStyle(button);`,
      errors: [
        { messageId: 'measurement', data: { name: 'getComputedStyle' } },
      ],
    },
    {
      code: `const { width, height } = button.getBoundingClientRect();`,
      errors: [
        { messageId: 'measurement', data: { name: 'getBoundingClientRect' } },
      ],
    },
    {
      code: `await expect(thumb).toHaveStyle({ opacity: '0' });`,
      errors: [{ messageId: 'measurement', data: { name: 'toHaveStyle' } }],
    },
    {
      code: `await expect(check.offsetLeft).toBe(8);
             await expect(control.clientHeight).toBeGreaterThan(0);`,
      errors: [
        { messageId: 'measurement', data: { name: 'offsetLeft' } },
        { messageId: 'measurement', data: { name: 'clientHeight' } },
      ],
    },
    {
      code: `const indicator = canvasElement.querySelector('.nx\\\\:animate-spin');`,
      errors: [{ messageId: 'classSelector' }],
    },
    {
      code: `const rows = table.querySelectorAll('tr.selected > td');`,
      errors: [{ messageId: 'classSelector' }],
    },
    {
      code: `import { expectPlacedBelow } from '../../stories/support/overlay-motion-test-utils';`,
      errors: [
        {
          messageId: 'helperImport',
          data: { source: '../../stories/support/overlay-motion-test-utils' },
        },
      ],
    },
    {
      code: `import blockSource from './text-filter.tsx?raw';`,
      errors: [
        {
          messageId: 'bundlerImport',
          data: { source: './text-filter.tsx?raw' },
        },
      ],
    },
    {
      code: `import type { Meta, StoryObj } from '@storybook/react';`,
      errors: [
        {
          messageId: 'storybookImport',
          data: { source: '@storybook/react', allowed: REACT_STORYBOOK },
        },
      ],
    },
    {
      code: `import { Source } from '@storybook/addon-docs/blocks';`,
      errors: [
        {
          messageId: 'storybookImport',
          data: {
            source: '@storybook/addon-docs/blocks',
            allowed: REACT_STORYBOOK,
          },
        },
      ],
    },
    {
      code: `import type { Meta } from '@storybook/react-vite';`,
      options: VUE,
      errors: [
        {
          messageId: 'storybookImport',
          data: { source: '@storybook/react-vite', allowed: VUE_STORYBOOK },
        },
      ],
    },
    {
      code: `import { InfoIcon } from 'lucide-react';`,
      errors: [
        {
          messageId: 'iconImport',
          data: { source: 'lucide-react', allowed: REACT_ICONS },
        },
      ],
    },
    {
      code: `import { StarIcon } from '@phosphor-icons/react';`,
      errors: [
        {
          messageId: 'iconImport',
          data: { source: '@phosphor-icons/react', allowed: REACT_ICONS },
        },
      ],
    },
    {
      code: `<AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace" />`,
      errors: [{ messageId: 'assetPath', data: { value: '/avatars/ada.svg' } }],
    },
    {
      code: `const people = [{ name: 'Grace Hopper', src: '/avatars/grace.svg' }];`,
      errors: [
        { messageId: 'assetPath', data: { value: '/avatars/grace.svg' } },
      ],
    },
    {
      code: `export const Default = { render: () => ({ template: '<AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace" />' }) };`,
      options: VUE,
      errors: [{ messageId: 'assetPath', data: { value: '/avatars/ada.svg' } }],
    },
    {
      code: `const meta: Meta<typeof Dialog> = { title: 'Components/Dialog', component: Dialog };
             export default meta;`,
      errors: [{ messageId: 'title' }],
    },
    {
      code: `const meta = { title: 'Components/Button', component: Button } satisfies Meta<typeof Button>;
             export default meta;`,
      errors: [{ messageId: 'title' }],
    },
    {
      code: `export default { title: 'Blocks/Filtering/TextFilter', component: TextFilter };`,
      errors: [{ messageId: 'title' }],
    },
  ],
});
