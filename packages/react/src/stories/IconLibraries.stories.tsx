import { ICON_LIBRARY_OPTIONS } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Button } from '../components/button/button';
import { ICON_SETS, type IconName } from '../lib/icon-libraries';

const ICON_NAMES = Object.keys(ICON_SETS.phosphor).sort() as IconName[];

const meta: Meta = {
  title: 'Internal/Icon Libraries',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every internal icon in every library nxds can install, at the 16px size
 * components draw most of them.
 */
export const AllIcons: Story = {
  render: () => (
    <table className="nx:border-collapse nx:text-foreground">
      <thead>
        <tr>
          <th scope="col" className="nx:p-2 nx:text-left">
            Icon
          </th>
          {ICON_LIBRARY_OPTIONS.map((library) => (
            <th
              key={library.value}
              scope="col"
              className="nx:p-2 nx:typography-label-default"
            >
              {library.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ICON_NAMES.map((name) => (
          <tr key={name}>
            <th
              scope="row"
              className="nx:p-2 nx:text-left nx:font-mono nx:typography-label-small"
            >
              {name}
            </th>
            {ICON_LIBRARY_OPTIONS.map((library) => {
              const Icon = ICON_SETS[library.value][name];
              return (
                <td key={library.value} className="nx:p-2 nx:text-center">
                  <Icon
                    aria-hidden="true"
                    className="nx:size-icon-glyph-default"
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  ),
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
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      {ICON_LIBRARY_OPTIONS.map((library) => {
        const { IconSearch, IconPlus, IconX } = ICON_SETS[library.value];
        return (
          <div
            key={library.value}
            role="group"
            aria-label={library.label}
            className="nx:flex nx:items-center nx:gap-2"
          >
            <Button
              size="sm"
              variant="outline"
              iconOnly
              startIcon={<IconSearch />}
            >
              Search
            </Button>
            <Button variant="outline" iconOnly startIcon={<IconPlus />}>
              Add
            </Button>
            <Button size="lg" variant="outline" iconOnly startIcon={<IconX />}>
              Close
            </Button>
            <Button variant="outline">
              <IconPlus aria-hidden="true" />
              New item
            </Button>
          </div>
        );
      })}
    </div>
  ),
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
