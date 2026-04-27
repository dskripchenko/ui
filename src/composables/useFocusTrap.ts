import { ref, type Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  const previouslyFocused = ref<HTMLElement | null>(null)

  function getFocusable(): HTMLElement[] {
    if (!containerRef.value) return []
    return Array.from(
      containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter(el => !el.closest('[aria-hidden="true"]'))
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return
    const focusable = getFocusable()
    if (!focusable.length) { event.preventDefault(); return }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  function activate(initialFocusRef?: Ref<HTMLElement | null>): void {
    previouslyFocused.value = document.activeElement as HTMLElement
    document.addEventListener('keydown', handleKeydown)
    const target = initialFocusRef?.value ?? getFocusable()[0] ?? containerRef.value
    target?.focus()
  }

  function deactivate(): void {
    document.removeEventListener('keydown', handleKeydown)
    previouslyFocused.value?.focus()
    previouslyFocused.value = null
  }

  return { activate, deactivate }
}
