import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COLOR_THEME_STORAGE_KEY, resetColorTheme, useColorTheme } from './useColorTheme.js'
import { shouldSignInSilently, silentSignInUrl } from '../utils/silentSignIn.js'

let systemDark = false
const listeners: ((e: MediaQueryListEvent) => void)[] = []

beforeEach(() => {
  systemDark = false
  listeners.length = 0
  localStorage.clear()
  delete document.documentElement.dataset.theme
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: systemDark,
    media: query,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
    removeEventListener: () => undefined,
  }))
  resetColorTheme()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const html = () => document.documentElement.dataset.theme

describe('useColorTheme', () => {
  it('follows the system without a choice, and keeps following it', () => {
    systemDark = true
    const { init, choice } = useColorTheme()
    init()
    expect(choice.value).toBe('system')
    expect(html()).toBe('dark')

    listeners.forEach((fn) => fn({ matches: false } as MediaQueryListEvent))
    expect(html()).toBe('light')
  })

  it('starts from the remembered choice', () => {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, 'dark')
    resetColorTheme()
    const { init, choice } = useColorTheme()
    init()
    expect(choice.value).toBe('dark')
    expect(html()).toBe('dark')
  })

  it('remembers, applies and saves a choice made here', async () => {
    const save = vi.fn()
    const { choose, choice } = useColorTheme({ save })
    choose('dark')
    expect(choice.value).toBe('dark')
    expect(html()).toBe('dark')
    expect(localStorage.getItem(COLOR_THEME_STORAGE_KEY)).toBe('dark')
    expect(save).toHaveBeenCalledWith('dark')

    choose('system')
    expect(localStorage.getItem(COLOR_THEME_STORAGE_KEY)).toBeNull()
    expect(html()).toBe('light')
    expect(save).toHaveBeenLastCalledWith('system')
  })

  it('does not follow the system once a theme is chosen', () => {
    const { init, choose } = useColorTheme()
    init()
    choose('light')
    listeners.forEach((fn) => fn({ matches: true } as MediaQueryListEvent))
    expect(html()).toBe('light')
  })

  it('toggles from what is shown, as a choice', () => {
    const save = vi.fn()
    const { init, toggle, choice } = useColorTheme({ save })
    init()
    toggle()
    expect(choice.value).toBe('dark')
    expect(save).toHaveBeenCalledWith('dark')
  })

  it('adopts a choice made in another app without saving it back', () => {
    const save = vi.fn()
    const { adopt, choice } = useColorTheme({ save })
    adopt('dark')
    expect(choice.value).toBe('dark')
    expect(html()).toBe('dark')
    expect(localStorage.getItem(COLOR_THEME_STORAGE_KEY)).toBe('dark')
    expect(save).not.toHaveBeenCalled()

    adopt('neon')
    adopt(null)
    expect(choice.value).toBe('dark')
  })

  it('applies a choice even when saving fails', async () => {
    const { choose } = useColorTheme({ save: () => Promise.reject(new Error('offline')) })
    choose('dark')
    await Promise.resolve()
    expect(html()).toBe('dark')
  })

  it('shares one state between calls', () => {
    useColorTheme().choose('dark')
    expect(useColorTheme().choice.value).toBe('dark')
  })
})

describe('silent sign-in', () => {
  it('goes silently only for a guest the server offers it to', () => {
    expect(shouldSignInSilently({ signedIn: false, offered: true })).toBe(true)
    expect(shouldSignInSilently({ signedIn: true, offered: true })).toBe(false)
    expect(shouldSignInSilently({ signedIn: false, offered: false })).toBe(false)
  })

  it('not after signing out, nor back with the reason of a failure', () => {
    expect(shouldSignInSilently({ signedIn: false, offered: true }, { out: '1' })).toBe(false)
    expect(shouldSignInSilently({ signedIn: false, offered: true }, { sso: 'no_role' })).toBe(false)
    expect(shouldSignInSilently({ signedIn: false, offered: true }, { redirect: '/x' })).toBe(true)
  })

  it('builds the address of the app\'s silent sign-in', () => {
    expect(silentSignInUrl('/people?q=a b')).toBe('/auth/oidc/redirect?silent=1&back=%2Fpeople%3Fq%3Da%20b')
    expect(silentSignInUrl()).toBe('/auth/oidc/redirect?silent=1&back=%2F')
    expect(silentSignInUrl('/', '/sso/start')).toBe('/sso/start?silent=1&back=%2F')
  })
})
