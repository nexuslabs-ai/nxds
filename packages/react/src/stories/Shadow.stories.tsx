import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import {
  tokenValue,
  useRuntimeTokenValues,
} from './support/runtime-token-values';

const RUNTIME_SHADOW_TIERS = [
  { name: '2xs', className: 'nx:shadow-2xs' },
  { name: 'xs', className: 'nx:shadow-xs' },
  { name: 'sm', className: 'nx:shadow-sm' },
  { name: 'base', className: 'nx:shadow-base' },
  { name: 'md', className: 'nx:shadow-md' },
  { name: 'lg', className: 'nx:shadow-lg' },
  { name: 'xl', className: 'nx:shadow-xl' },
  { name: '2xl', className: 'nx:shadow-2xl' },
] as const;

const SHADOW_TOKEN_NAMES = RUNTIME_SHADOW_TIERS.map(
  (tier) => `--nx-shadow-${tier.name}`
);

function RuntimeUtilityCard({
  tier,
  className,
  shadowValue,
}: {
  tier: string;
  className: string;
  shadowValue: string;
}) {
  return (
    <article
      className={`nx:flex nx:min-h-36 nx:flex-col nx:justify-between nx:gap-4 nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-4 ${className}`}
      data-testid={`shadow-${tier}`}
    >
      <div className="nx:flex nx:flex-col nx:gap-1">
        <span className="nx:text-foreground nx:typography-label-default">
          {tier}
        </span>
        <span className="nx:text-muted-foreground nx:typography-label-small">
          nx:shadow-{tier}
        </span>
      </div>
      <code className="nx:block nx:max-w-64 nx:overflow-hidden nx:text-ellipsis nx:whitespace-nowrap nx:text-muted-foreground nx:typography-code-inline">
        {shadowValue}
      </code>
    </article>
  );
}

function RuntimeUtilitiesStory() {
  const values = useRuntimeTokenValues(SHADOW_TOKEN_NAMES);

  return (
    <div className="nx:flex nx:min-w-fit nx:flex-col nx:gap-8 nx:bg-background nx:p-10">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Runtime shadows
        </h2>
        <p className="nx:max-w-2xl nx:text-muted-foreground nx:typography-body-default">
          Real `nx:shadow-*` utilities rendered from the active nxds Appearance
          provider. Use the Mode and Elevation toolbars to inspect the runtime
          CSS variables a consumer receives.
        </p>
      </div>
      <div className="nx:grid nx:grid-cols-2 nx:gap-4 nx:lg:grid-cols-4">
        {RUNTIME_SHADOW_TIERS.map((tier) => (
          <RuntimeUtilityCard
            key={tier.name}
            tier={tier.name}
            className={tier.className}
            shadowValue={tokenValue(values, `--nx-shadow-${tier.name}`)}
          />
        ))}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Tokens/Shadow',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Shadow styles rendered through the public runtime utilities. Elevation is controlled by the Storybook toolbar; token-only modes such as flat and soft are intentionally not exposed as public Appearance options.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const RuntimeUtilities: Story = {
  render: () => <RuntimeUtilitiesStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('shadow-lg');

    await expect(card).toBeVisible();
    expect(getComputedStyle(card).boxShadow).not.toBe('none');
  },
};
