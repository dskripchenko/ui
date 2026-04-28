import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: async (cfg) => {
    if (process.env.STORYBOOK_BASE_PATH) {
      cfg.base = process.env.STORYBOOK_BASE_PATH
    }
    return cfg
  },
}

export default config
