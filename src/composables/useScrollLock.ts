let lockCount = 0

export function useScrollLock() {
  let locked = false

  function lock(): void {
    if (locked) return
    locked = true
    lockCount++
    if (lockCount === 1) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    }
  }

  function unlock(): void {
    if (!locked) return
    locked = false
    lockCount--
    if (lockCount === 0) {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }

  return { lock, unlock }
}
