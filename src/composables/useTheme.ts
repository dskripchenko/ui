import { ref, onUnmounted } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

export function useTheme() {
  let mediaQuery: MediaQueryList | null = null

  function setTheme(value: Theme) {
    theme.value = value
    document.documentElement.dataset.theme = value
  }

  function toggle() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function initFromSystem() {
    const stored = document.documentElement.dataset.theme as Theme | undefined
    if (stored === 'light' || stored === 'dark') {
      theme.value = stored
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }

  function watchSystem() {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', handler)
    onUnmounted(() => mediaQuery?.removeEventListener('change', handler))
  }

  return { theme, setTheme, toggle, initFromSystem, watchSystem }
}
