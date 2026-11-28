import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  // The same split as packages/react's: a story that ships carries no title,
  // so its folder names it.
  stories: [
    {
      directory: '../src/components',
      files: '*/!(*.test).stories.ts',
      titlePrefix: 'Components',
    },
    '../src/**/*.test.stories.ts',
    '../src/stories/**/*.stories.ts',
  ],
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

    // Storybook loads vite.config.ts. Remove vite-plugin-dts (plugin name
    // `unplugin-dts`): only the library build writes the types in dist.
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
