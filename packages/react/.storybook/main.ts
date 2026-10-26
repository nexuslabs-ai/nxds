import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const tailwindcss = (await import('@tailwindcss/vite')).default;

    // Storybook loads vite.config.ts, but its type bundling needs a library
    // build in dist.
    config.plugins = config.plugins?.filter(
      (plugin) =>
        !(plugin && 'name' in plugin && plugin.name === 'unplugin-dts')
    );

    return mergeConfig(config, {
      plugins: [tailwindcss()],
    });
  },
};

export default config;
