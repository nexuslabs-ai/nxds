import { ICON_LIBRARY_OPTIONS } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { Button } from '../components/button';
import { ICON_SETS, type IconName } from '../lib/icon-libraries';

const ICON_NAMES = Object.keys(ICON_SETS.phosphor).sort() as IconName[];

const meta = {
  title: 'Internal/Icon Libraries',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every internal icon in every library nxds can install, at the 16px size
 * components draw most of them.
 */
export const AllIcons: Story = {
  render: () => ({
    setup: () => ({
      libraries: ICON_LIBRARY_OPTIONS,
      names: ICON_NAMES,
      sets: ICON_SETS,
    }),
    template: `
      <table class="nx:border-collapse nx:text-foreground">
        <thead>
          <tr>
            <th scope="col" class="nx:p-2 nx:text-left">Icon</th>
            <th
              v-for="library in libraries"
              :key="library.value"
              scope="col"
              class="nx:p-2 nx:typography-label-default"
            >
              {{ library.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="name in names" :key="name">
            <th
              scope="row"
              class="nx:p-2 nx:text-left nx:font-mono nx:typography-label-small"
            >
              {{ name }}
            </th>
            <td
              v-for="library in libraries"
              :key="library.value"
              class="nx:p-2 nx:text-center"
            >
              <component
                :is="sets[library.value][name]"
                aria-hidden="true"
                class="nx:size-4"
              />
            </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('row').slice(1);

    await expect(rows).toHaveLength(ICON_NAMES.length);
    for (const row of rows) {
      const icons = row.querySelectorAll('svg');
      await expect(icons).toHaveLength(ICON_LIBRARY_OPTIONS.length);
      for (const icon of icons) {
        const { width, height } = icon.getBoundingClientRect();
        await expect({ width, height }).toEqual({ width: 16, height: 16 });
      }
    }
  },
};

/**
 * Icon-only buttons in each library. The icon follows the button size, so
 * every library sits at the same size in the same control.
 */
export const IconOnlyButtons: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ libraries: ICON_LIBRARY_OPTIONS, sets: ICON_SETS }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <div
          v-for="library in libraries"
          :key="library.value"
          role="group"
          :aria-label="library.label"
          class="nx:flex nx:items-center nx:gap-2"
        >
          <Button size="icon-sm" variant="outline" aria-label="Search">
            <component :is="sets[library.value].IconSearch" aria-hidden="true" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Add">
            <component :is="sets[library.value].IconPlus" aria-hidden="true" />
          </Button>
          <Button size="icon-lg" variant="outline" aria-label="Close">
            <component :is="sets[library.value].IconX" aria-hidden="true" />
          </Button>
          <Button variant="outline">
            <component :is="sets[library.value].IconPlus" aria-hidden="true" />
            New item
          </Button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sizes = ICON_LIBRARY_OPTIONS.map((library) => {
      const group = canvas.getByRole('group', { name: library.label });
      return [...group.querySelectorAll('svg')].map(
        (icon) => icon.getBoundingClientRect().width
      );
    });

    for (const librarySizes of sizes) {
      await expect(librarySizes).toEqual(sizes[0]);
    }
  },
};
