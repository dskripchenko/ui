import { afterEach, describe, expect, it } from 'vitest'
import { trackFocusModality } from './useFocusModality'

describe('trackFocusModality', () => {
  let stop: () => void = () => {}
  afterEach(() => stop())

  it('a pointer hides the ring; a modifier alone keeps it hidden; a real key brings it back', () => {
    stop = trackFocusModality()
    const root = document.documentElement
    window.dispatchEvent(new Event('pointerdown'))
    expect(root.dataset.uidModality).toBe('pointer')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true }))
    expect(root.dataset.uidModality).toBe('pointer')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(root.dataset.uidModality).toBeUndefined()
  })

  it('installs once', () => {
    stop = trackFocusModality()
    const again = trackFocusModality()
    again()
    window.dispatchEvent(new Event('pointerdown'))
    expect(document.documentElement.dataset.uidModality).toBe('pointer')
  })
})
