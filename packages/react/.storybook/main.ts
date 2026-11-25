import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // A story that ships carries no title, so its folder names it. Each entry
  // matches its own files only, because Storybook also puts `titlePrefix` in
  // front of a title a story sets itself.
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
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
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
