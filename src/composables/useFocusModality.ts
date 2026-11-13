/**
 * Keyboard focus rings only for the keyboard. A browser shows `:focus-visible`
 * on an element clicked earlier as soon as any key is pressed — Shift for a
 * selection, Cmd for a shortcut — and the ring flashes on what was just
 * clicked. While the last input was a pointer, the root carries
 * `data-uid-modality="pointer"` and the kit's ring colour is transparent;
 * a key that moves or acts (not a modifier alone) brings it back.
 *
 * Call once when the app starts; calling again does nothing.
 */
const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn', 'FnLock', 'Hyper', 'Super', 'OS', 'AltGraph'])

let installed = false

export function trackFocusModality(root: HTMLElement | undefined = typeof document === 'undefined' ? undefined : document.documentElement): () => void {
  if (installed || root === undefined) return () => {}
  installed = true
  const pointer = (): void => {
    root.dataset.uidModality = 'pointer'
  }
  const key = (event: KeyboardEvent): void => {
    if (MODIFIERS.has(event.key) || event.metaKey || event.ctrlKey) return
    delete root.dataset.uidModality
  }
  window.addEventListener('pointerdown', pointer, true)
  window.addEventListener('keydown', key, true)
  return () => {
    window.removeEventListener('pointerdown', pointer, true)
    window.removeEventListener('keydown', key, true)
    delete root.dataset.uidModality
    installed = false
  }
}
