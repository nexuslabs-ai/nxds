import type { StorybookConfig } from '@storybook/angular-vite';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  staticDirs: ['../../react/.storybook/public'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
      compodoc: false,
    },
  },
  features: { experimentalDocgenServer: false },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const tailwindcss = (await import('@tailwindcss/vite')).default;

    return mergeConfig(config, { plugins: [tailwindcss()] });
  },
};

export default config;
