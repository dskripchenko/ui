/**
 * The open modal-like layers (modal, drawer, command palette), in opening
 * order. Escape closes only the top one: a drawer opened from a modal closes
 * alone, and the modal under it stays.
 */
const stack: symbol[] = []

export function useOverlayStack() {
  const id = Symbol('uid-overlay')

  function push(): void {
    if (!stack.includes(id)) stack.push(id)
  }

  function pop(): void {
    const i = stack.indexOf(id)
    if (i >= 0) stack.splice(i, 1)
  }

  function isTop(): boolean {
    return stack[stack.length - 1] === id
  }

  return { push, pop, isTop }
}
