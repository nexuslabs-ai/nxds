import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { Decorator, Preview } from '@storybook/react-vite';

import { nxdsPreview } from '../src/storybook';

// Storybook needs the full token set to render. The shipped component CSS
// (src/index.css) is utilities-only by design — tokens come from the consumer's
// @nxds/tailwind — so Storybook loads them via preview.css (a CSS @import, so
// the production build can resolve @nxds/tailwind's .css package entry).
import './preview.css';

const nxds = nxdsPreview(DEFAULT_NXDS_APPEARANCE);

// Our stories sit in the middle of a full-height canvas. The wiring an app
// gets leaves layout to the app.
const CenteredCanvas: Decorator = (Story, context) => (
  <div
    className={`nx:flex nx:items-center nx:justify-center ${context.viewMode === 'docs' ? 'nx:py-12' : 'nx:min-h-svh'}`}
  >
    <Story />
  </div>
);

const preview: Preview = {
  // Enable autodocs for all stories globally
  tags: ['autodocs'],
  parameters: {
    options: {
      storySort: {
        order: [
          'Components',
          'Appearance',
          'Blocks',
          'Patterns',
          'Primitives',
          'Tokens',
        ],
      },
    },
    // Enable Table of Contents for docs pages
    docs: {
      toc: {
        headingSelector: 'h2, h3',
        title: 'On this page',
      },
    },
    // A11y violations fail tests. The contrast rules nxds turns off come from
    // the shared wiring; contrast is APCA-gated via `pnpm audit:contrast`
    // (see `packages/core/src/lib/apca-pairs.ts`).
    a11y: { ...nxds.parameters.a11y, test: 'error' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Disable Storybook's built-in background selector: the wiring paints the
    // canvas from the theme.
    backgrounds: { disable: true },
    // Use fullscreen layout so the centered canvas fills the whole canvas
    layout: 'fullscreen',
    viewport: {
      options: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
  },
  initialGlobals: nxds.initialGlobals,
  globalTypes: nxds.globalTypes,
  // The first decorator is the innermost: the appearance provider wraps the
  // centered canvas.
  decorators: [CenteredCanvas, ...nxds.decorators],
};

export default preview;
