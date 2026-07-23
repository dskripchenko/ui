import { describe, it, expect, afterEach } from 'vitest'
import { ref } from 'vue'
import { useFocusTrap } from './useFocusTrap'

function mountContainer(html: string): HTMLElement {
  const el = document.createElement('div')
  el.innerHTML = html
  document.body.appendChild(el)
  return el
}

describe('useFocusTrap', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('activate фокусирует первый focusable по умолчанию', () => {
    const el = mountContainer('<button id="close">×</button><input id="q" />')
    const { activate, deactivate } = useFocusTrap(ref(el))
    activate()
    expect(document.activeElement?.id).toBe('close')
    deactivate()
  })

  it('activate предпочитает [autofocus]-элемент первому focusable', () => {
    const el = mountContainer('<button id="close">×</button><input id="q" autofocus />')
    const { activate, deactivate } = useFocusTrap(ref(el))
    activate()
    expect(document.activeElement?.id).toBe('q')
    deactivate()
  })

  it('явный initialFocusRef важнее [autofocus]', () => {
    const el = mountContainer('<button id="close">×</button><input id="q" autofocus /><input id="other" />')
    const other = el.querySelector<HTMLElement>('#other')
    const { activate, deactivate } = useFocusTrap(ref(el))
    activate(ref(other))
    expect(document.activeElement?.id).toBe('other')
    deactivate()
  })
})
