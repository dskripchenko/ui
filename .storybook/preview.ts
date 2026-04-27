import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/vue3'

import '../src/tokens/index.css'
import '../src/styles/themes.css'
import '../src/styles/reset.css'
import '../src/styles/global.css'

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
  },
}

export default preview
