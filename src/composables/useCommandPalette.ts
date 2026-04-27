import { ref } from 'vue'

const _open = ref(false)

export function useCommandPalette() {
  return {
    open: _open,
    show: () => { _open.value = true },
    hide: () => { _open.value = false },
    toggle: () => { _open.value = !_open.value },
  }
}
