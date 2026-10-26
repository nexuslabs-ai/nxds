import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  staticDirs: ['../../react/.storybook/public'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const tailwindcss = (await import('@tailwindcss/vite')).default;

    // The package's type bundle reads dist, which a Storybook build never writes.
    const plugins = config.plugins?.filter(
      (plugin) =>
        !(plugin && 'name' in plugin && plugin.name === 'unplugin-dts')
    );

    return mergeConfig(
      { ...config, plugins },
      {
        plugins: [tailwindcss()],
      }
    );
  },
};

export default config;
