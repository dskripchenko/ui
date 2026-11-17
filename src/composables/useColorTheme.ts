import { ref, readonly } from 'vue'
import { useTheme, type Theme } from './useTheme.js'

/** What the person chose: a theme, or following the system. */
export type ThemeChoice = Theme | 'system'

/** The key of the choice in localStorage; the first-paint script of an app reads the same one. */
export const COLOR_THEME_STORAGE_KEY = 'theme'

export interface UseColorThemeOptions {
  /**
   * Saves a choice the person made here where every app of theirs reads it
   * (a user setting on the server). Called by `choose()` and `toggle()`, not
   * by `adopt()`. Errors are the caller's: the choice applies anyway.
   */
  save?: (choice: ThemeChoice) => void | Promise<void>
}

function isChoice(value: unknown): value is ThemeChoice {
  return value === 'light' || value === 'dark' || value === 'system'
}

function stored(): ThemeChoice {
  try {
    const value = typeof localStorage === 'undefined' ? null : localStorage.getItem(COLOR_THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

const choice = ref<ThemeChoice>(stored())
let save: UseColorThemeOptions['save']
let media: MediaQueryList | null = null

function systemDark(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** The `<html>` follows the system while the choice is `system`. */
function onSystemChange(event: MediaQueryListEvent): void {
  if (choice.value === 'system') useTheme().setTheme(event.matches ? 'dark' : 'light')
}

function followSystem(): void {
  if (media !== null || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener?.('change', onSystemChange)
}

function remember(value: ThemeChoice): void {
  choice.value = value
  try {
    if (value === 'system') localStorage.removeItem(COLOR_THEME_STORAGE_KEY)
    else localStorage.setItem(COLOR_THEME_STORAGE_KEY, value)
  } catch {
    // Not kept; the choice still applies to this page.
  }
}

function apply(value: ThemeChoice): void {
  useTheme().setTheme(value === 'system' ? (systemDark() ? 'dark' : 'light') : value)
}

/**
 * The theme the person chose — light, dark or the system's — over
 * `useTheme()`: kept in localStorage for the first paint of the next visit,
 * and, with `save`, where every app of theirs reads it. A choice made in
 * another app comes back through `adopt()` (from the user's settings or
 * token), so the person picks a theme once for all their apps.
 *
 * One state for the page: every call shares it; the last `save` given wins.
 */
export function useColorTheme(options: UseColorThemeOptions = {}) {
  if (options.save) save = options.save
  const { theme } = useTheme()

  /** On start: the remembered choice, following the system when it is `system`. */
  function init(): void {
    followSystem()
    apply(choice.value)
  }

  /** The choice the person made here: applied, remembered, saved. */
  function choose(value: ThemeChoice): void {
    remember(value)
    apply(value)
    void Promise.resolve(save?.(value)).catch(() => undefined)
  }

  /** Light ↔ dark from what is shown now; a choice like `choose()`. */
  function toggle(): void {
    choose(theme.value === 'light' ? 'dark' : 'light')
  }

  /**
   * A choice made elsewhere (the user's settings, a token): applied and
   * remembered, not saved back. Anything but a known choice is passed over.
   */
  function adopt(value: unknown): void {
    if (!isChoice(value) || value === choice.value) return
    remember(value)
    apply(value)
  }

  return { theme, choice: readonly(choice), init, choose, toggle, adopt }
}

/** For tests: forget the choice and the saver. */
export function resetColorTheme(): void {
  media?.removeEventListener?.('change', onSystemChange)
  media = null
  save = undefined
  choice.value = stored()
}
