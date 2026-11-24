import plugin from './index.js';

export const componentRuleSet = {
  '@nxds/nx-class-conventions': 'error',
  '@nxds/no-render-prop-types': 'error',
  '@nxds/no-multi-statement-jsx-handler': 'error',
};

export function nxdsComponentConfig(options = {}) {
  const { files } = options;

  return {
    ...(files ? { files } : {}),
    plugins: {
      '@nxds': plugin,
    },
    rules: componentRuleSet,
  };
}

export default {
  plugin,
  componentRuleSet,
  nxdsComponentConfig,
};
