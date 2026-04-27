import { readonly, ref } from 'vue'
import type { Tone } from '../types/index.js'

export interface ToastOptions {
  message: string
  variant?: Tone
  title?: string
  duration?: number
}

export interface ToastItem {
  id: number
  message: string
  variant: Tone
  title?: string
  duration: number
}

type ToastShorthand = string | Omit<ToastOptions, 'variant'>

const toasts = ref<ToastItem[]>([])
let _id = 0

export function useToast() {
  function add(options: ToastOptions | string): number {
    const opts = typeof options === 'string' ? { message: options } : options
    const item: ToastItem = {
      id: ++_id,
      variant: 'info',
      duration: 4000,
      ...opts,
    }
    toasts.value.push(item)
    if (item.duration > 0) {
      setTimeout(() => dismiss(item.id), item.duration)
    }
    return item.id
  }

  function dismiss(id: number): void {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function clear(): void {
    toasts.value = []
  }

  function success(msg: ToastShorthand): number {
    return add(typeof msg === 'string' ? { message: msg, variant: 'success' } : { ...msg, variant: 'success' })
  }

  function error(msg: ToastShorthand): number {
    return add(typeof msg === 'string' ? { message: msg, variant: 'danger' } : { ...msg, variant: 'danger' })
  }

  function warning(msg: ToastShorthand): number {
    return add(typeof msg === 'string' ? { message: msg, variant: 'warning' } : { ...msg, variant: 'warning' })
  }

  function info(msg: ToastShorthand): number {
    return add(typeof msg === 'string' ? { message: msg, variant: 'info' } : { ...msg, variant: 'info' })
  }

  return { toasts: readonly(toasts), add, dismiss, clear, success, error, warning, info }
}
