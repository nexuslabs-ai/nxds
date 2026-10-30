import type { NxdsDensity } from '@nxds/core';
import { CommandIcon, StarIcon, TrayIcon } from '@phosphor-icons/react/ssr';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Checkbox } from '../components/checkbox/checkbox';
import { EmptyStateMedia } from '../components/empty-state/empty-state';
import { Kbd } from '../components/kbd/kbd';
import {
  RadioGroup,
  RadioGroupItem,
} from '../components/radio-group/radio-group';
import { Spinner } from '../components/spinner/spinner';
import { Toggle } from '../components/toggle/toggle';

import {
  tokenValue,
  useRuntimeTokenValues,
} from './support/runtime-token-values';

const NUMERIC_SPACING_KEYS = [
  '0',
  '0_5',
  '1',
  '1_5',
  '2',
  '2_5',
  '3',
  '3_5',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '20',
  '24',
  '28',
  '32',
  '36',
  '40',
  '44',
  '48',
  '52',
  '56',
  '60',
  '64',
  '72',
  '80',
  '96',
] as const;

const ROLE_TOKENS = [
  { name: '--nx-container-p', utility: 'nx:p-container' },
  { name: '--nx-container-gap', utility: 'nx:gap-container' },
  { name: '--nx-layout-section-gap', utility: 'nx:gap-layout-section' },
  { name: '--nx-layout-stack-gap', utility: 'nx:gap-layout-stack' },
] as const;

const NUMERIC_TOKEN_NAMES = NUMERIC_SPACING_KEYS.map(
  (key) => `--nx-spacing-${key}`
);
const ROLE_TOKEN_NAMES = ROLE_TOKENS.map((token) => token.name);

function RuntimeRow({
  name,
  value,
  width,
}: {
  name: string;
  value: string;
  width: string;
}) {
  return (
    <div className="nx:flex nx:items-center nx:gap-4">
      <span className="nx:w-56 nx:shrink-0 nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </span>
      <span className="nx:w-20 nx:shrink-0 nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {value}
      </span>
      <div
        className="nx:h-3 nx:shrink-0 nx:rounded-sm nx:bg-primary-background"
        style={{ width }}
      />
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/Spacing',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Spacing tokens rendered from the active nxds Appearance provider. Use the Density toolbar to switch modes; the rows below read the live runtime CSS variables that a package consumer receives.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function NumericStory() {
  const values = useRuntimeTokenValues(NUMERIC_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Numeric Spacing Scale
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Live `--nx-spacing-*` variables consumed through Tailwind utilities
          like `nx:p-4` or `nx:gap-2`. Steps 0–2 (up to 8px) stay fixed. From
          step 2.5 the offset grows until step 6 (24px). There it is −4, −2, 0,
          +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset.
          The Density toolbar changes the active runtime values.
        </p>
      </div>
      <section className="nx:flex nx:flex-col nx:gap-1">
        {NUMERIC_TOKEN_NAMES.map((name) => (
          <RuntimeRow
            key={name}
            name={name}
            value={tokenValue(values, name)}
            width={`var(${name})`}
          />
        ))}
      </section>
    </div>
  );
}

function RolesStory() {
  const values = useRuntimeTokenValues(ROLE_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Role Tokens
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Role tokens express semantic rhythm for cards, dialogs, sections, and
          stacks. Each has one step&rsquo;s value at every density:
          `container-p` is step 6, `container-gap` step 4, `layout-section-gap`
          step 8 and `layout-stack-gap` step 2, which stays 8px.
        </p>
      </div>
      <section className="nx:flex nx:flex-col nx:gap-1">
        {ROLE_TOKENS.map(({ name, utility }) => (
          <RuntimeRow
            key={name}
            name={`${name} (${utility})`}
            value={tokenValue(values, name)}
            width={`var(${name})`}
          />
        ))}
      </section>
    </div>
  );
}

export const Numeric: Story = {
  render: () => <NumericStory />,
};

export const Roles: Story = {
  render: () => <RolesStory />,
};

export const ActiveMode: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Live render of role-named utilities under the active Density toolbar. Switching density resizes the boxes below through provider-emitted CSS variables.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Active Density
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
          Switch the Density toolbar. These examples use role utilities, so they
          resize through the same runtime variables consumers receive.
        </p>
      </div>

      <section className="nx:flex nx:flex-col nx:gap-3">
        <h3 className="nx:text-foreground nx:typography-heading-xsmall nx:font-mono">
          nx:p-container / nx:gap-container
        </h3>
        <div className="nx:p-container nx:bg-container nx:border-default nx:border-border-default nx:rounded-md nx:flex nx:flex-col nx:gap-container nx:max-w-md">
          <div className="nx:bg-muted nx:rounded-sm nx:h-8" />
          <div className="nx:bg-muted nx:rounded-sm nx:h-8" />
        </div>
      </section>

      <section className="nx:flex nx:flex-col nx:gap-3">
        <h3 className="nx:text-foreground nx:typography-heading-xsmall nx:font-mono">
          nx:gap-layout-section / nx:gap-layout-stack
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-layout-section nx:max-w-md">
          <div className="nx:flex nx:flex-col nx:gap-layout-stack">
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
          </div>
          <div className="nx:flex nx:flex-col nx:gap-layout-stack">
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
            <div className="nx:bg-muted nx:rounded-sm nx:h-6" />
          </div>
        </div>
      </section>
    </div>
  ),
};

const GLYPH_DENSITIES = [
  'tight',
  'spacious',
] as const satisfies readonly NxdsDensity[];

export const GlyphsIgnoreDensity: Story = {
  tags: ['!autodocs'],
  parameters: {
    docs: {
      description: {
        story:
          'Icons keep their glyph size while the spacing around them follows density. Each icon renders the same in Tight and Spacious.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6 nx:p-10 nx:bg-background">
      {GLYPH_DENSITIES.map((density) => (
        <div
          key={density}
          data-density={density}
          data-testid={`glyphs-${density}`}
          className="nx:flex nx:items-center nx:gap-4"
        >
          <Kbd>
            <CommandIcon />K
          </Kbd>
          <Checkbox defaultChecked aria-label={`${density} checkbox`} />
          <RadioGroup defaultValue="on" aria-label={`${density} radio`}>
            <RadioGroupItem value="on" aria-label={`${density} radio item`} />
          </RadioGroup>
          <Spinner />
          <Toggle aria-label={`${density} toggle`}>
            <StarIcon />
          </Toggle>
          <EmptyStateMedia variant="icon">
            <TrayIcon />
          </EmptyStateMedia>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [tight, spacious] = GLYPH_DENSITIES.map((density) =>
      within(canvasElement).getByTestId(`glyphs-${density}`)
    );
    const spacing = (root: HTMLElement) =>
      parseFloat(getComputedStyle(root).getPropertyValue('--nx-spacing-4'));
    await expect(spacing(spacious!)).toBeGreaterThan(spacing(tight!));

    const glyphs = (root: HTMLElement) =>
      [...root.querySelectorAll('svg')].map((svg) => {
        const { width, height } = svg.getBoundingClientRect();
        return { width, height };
      });
    const tightGlyphs = glyphs(tight!);
    await expect(tightGlyphs.length).toBeGreaterThan(0);
    await expect(glyphs(spacious!)).toEqual(tightGlyphs);
  },
};
