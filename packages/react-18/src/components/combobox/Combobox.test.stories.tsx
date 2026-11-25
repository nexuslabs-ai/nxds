import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { expectImmediateItemMotion } from '../../stories/support/motion-test-utils';

import type { Combobox } from './combobox';
import comboboxMeta, { WithDataAttributes } from './Combobox.stories';

const meta: Meta<typeof Combobox> = {
  ...comboboxMeta,
  title: 'Tests/Combobox',
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const WithDataAttributesMotion: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Select framework' });

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    const items = Array.from(
      listbox.querySelectorAll('[data-slot="combobox-item"]')
    );
    await expectImmediateItemMotion(items);
  },
};
