import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { useRouterLink } from './useRouterLink.js'

function run(source: { href?: string, to?: string | Record<string, unknown> }, withRouter: boolean) {
  const RouterLink = defineComponent({ name: 'RouterLink', render: () => h('a') })
  let result!: ReturnType<typeof useRouterLink>
  mount(defineComponent({
    setup() {
      result = useRouterLink(source)
      return () => h('div')
    },
  }), { global: { components: withRouter ? { RouterLink } : {} } })
  return result
}

describe('useRouterLink', () => {
  it('без to не возвращает RouterLink', () => {
    expect(run({ href: '/a' }, true).routerLink.value).toBeNull()
  })

  it('без зарегистрированного RouterLink откатывается на href / строковый to', () => {
    expect(run({ to: '/a' }, false).routerLink.value).toBeNull()
    expect(run({ to: '/a' }, false).fallbackHref.value).toBe('/a')
    expect(run({ to: { name: 'a' }, href: '/h' }, false).fallbackHref.value).toBe('/h')
    expect(run({ to: { name: 'a' } }, false).fallbackHref.value).toBeUndefined()
  })

  it('с RouterLink возвращает его', () => {
    expect(run({ to: '/a' }, true).routerLink.value).not.toBeNull()
  })
})
