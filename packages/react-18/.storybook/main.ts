import type { StorybookConfig } from '@storybook/react-vite';

// Radix and the other dependencies sit in the root node_modules, where `react`
// is 19. Resolve every `react` import from this package, which has 18.
const REACT_18 = ['react', 'react-dom'];

const config: StorybookConfig = {
  // The same entries as packages/react's: a story that ships carries no
  // title, so its folder names it.
  stories: [
    {
      directory: '../src/components',
      files: '*/!(*.test).stories.tsx',
      titlePrefix: 'Components',
    },
    {
      directory: '../src/blocks',
      files: '**/!(*.test).stories.tsx',
      titlePrefix: 'Blocks',
    },
    '../src/**/*.test.stories.tsx',
    '../src/components/appearance/**/*.stories.tsx',
    '../src/patterns/**/*.stories.tsx',
    '../src/stories/**/*.stories.tsx',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  staticDirs: ['../../react/.storybook/public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const tailwindcss = (await import('@tailwindcss/vite')).default;

    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: { dedupe: REACT_18 },
    });
  },
};

export default config;
