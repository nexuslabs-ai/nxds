import type { CSSProperties } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { within } from 'storybook/test';

import { Button } from '../components/button/button';
import { ButtonGroup } from '../components/button-group/button-group';
import { Input } from '../components/input/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
} from '../components/select/select';

import { expectCorners } from './support/corner-test-utils';

type RadiusStyle = CSSProperties & { '--nx-radius-base': string };

const pillRadius: RadiusStyle = { '--nx-radius-base': '9999px' };
const nestedRadius: RadiusStyle = { '--nx-radius-base': '24px' };

const meta = {
  title: 'Tokens/Radius overrides',
  parameters: {
    docs: {
      description: {
        component:
          'Scoped --nx-radius-base overrides currently affect Button. Input and SelectTrigger use --nx-radius-md. A nested data-radius preset replaces inherited values; an inline override wins over a preset on the same element. See theming/overrides in nxds docs.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScopeAndPrecedence: Story = {
  render: () => (
    <div data-radius="12" className="nx:grid nx:gap-4">
      <div style={pillRadius} className="nx:grid nx:gap-4">
        <Button variant="outline">Pill button</Button>
        <Input aria-label="Unchanged input" placeholder="Still 12px" />
        <Select>
          <SelectTrigger aria-label="Unchanged select">
            <SelectValue placeholder="Still 12px" />
          </SelectTrigger>
        </Select>
        <div>
          <Button variant="outline">Inherited pill</Button>
        </div>
        <div style={nestedRadius}>
          <Button variant="outline">Nested override</Button>
        </div>
        <div data-radius="8">
          <Button variant="outline">Nested preset</Button>
        </div>
        <div data-radius="12" style={pillRadius}>
          <Button variant="outline">Inline beats preset</Button>
          <Input aria-label="Preset medium" placeholder="Still 12px" />
        </div>
        <Button variant="outline" asChild>
          <a href="#radius-example">Composed pill link</a>
        </Button>
        <ButtonGroup aria-label="Horizontal joined buttons">
          <Button variant="outline">Horizontal first</Button>
          <Button variant="outline">Horizontal middle</Button>
          <Button variant="outline">Horizontal last</Button>
        </ButtonGroup>
        <ButtonGroup
          orientation="vertical"
          aria-label="Vertical joined buttons"
        >
          <Button variant="outline">Vertical first</Button>
          <Button variant="outline">Vertical middle</Button>
          <Button variant="outline">Vertical last</Button>
        </ButtonGroup>
      </div>
      <Button variant="outline">Outside override</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const uniform = (radius: string) => [radius, radius, radius, radius];

    await expectCorners(
      canvas.getByRole('button', { name: 'Outside override' }),
      uniform('12px')
    );
    for (const name of [
      'Pill button',
      'Inherited pill',
      'Inline beats preset',
    ]) {
      await expectCorners(
        canvas.getByRole('button', { name }),
        uniform('9999px')
      );
    }
    for (const name of ['Unchanged input', 'Preset medium']) {
      await expectCorners(
        canvas.getByRole('textbox', { name }),
        uniform('12px')
      );
    }
    await expectCorners(canvas.getByRole('combobox'), uniform('12px'));
    await expectCorners(canvas.getByRole('link'), uniform('9999px'));
    await expectCorners(
      canvas.getByRole('button', { name: 'Nested override' }),
      uniform('24px')
    );
    await expectCorners(
      canvas.getByRole('button', { name: 'Nested preset' }),
      uniform('8px')
    );

    const expectedEdges = [
      ['Horizontal first', ['9999px', '0px', '0px', '9999px']],
      ['Horizontal middle', ['0px', '0px', '0px', '0px']],
      ['Horizontal last', ['0px', '9999px', '9999px', '0px']],
      ['Vertical first', ['9999px', '9999px', '0px', '0px']],
      ['Vertical middle', ['0px', '0px', '0px', '0px']],
      ['Vertical last', ['0px', '0px', '9999px', '9999px']],
    ] as const;
    for (const [name, expected] of expectedEdges) {
      await expectCorners(canvas.getByRole('button', { name }), expected);
    }
  },
};

const mediumOverride: CSSProperties & { '--nx-radius-md': string } = {
  '--nx-radius-md': '20px',
};

export const OverrideReachesNestedCorners: Story = {
  render: () => (
    <div data-radius="12" style={mediumOverride}>
      <div className="nx:flex nx:w-fit nx:gap-1 nx:rounded-md nx:border-default nx:border-border-default nx:p-1 nx:nest-outer-md nx:nest-border-default nx:nest-padding-1">
        <div
          data-testid="override-first"
          className="nx:h-8 nx:w-12 nx:bg-muted nx:rounded-nest nx:rounded-s-nest-corner"
        />
        <div
          data-testid="override-middle"
          className="nx:h-8 nx:w-12 nx:bg-muted nx:rounded-nest"
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCorners(canvas.getByTestId('override-first'), [
      '15px',
      '10px',
      '10px',
      '15px',
    ]);
    await expectCorners(canvas.getByTestId('override-middle'), [
      '10px',
      '10px',
      '10px',
      '10px',
    ]);
  },
};
