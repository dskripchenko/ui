import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, computed } from 'vue'
import { provideLocale, useLocale } from './useLocale.js'
import { ru } from '../locales/ru.js'
import { en } from '../locales/en.js'

const Consumer = defineComponent({
  setup() {
    const locale = useLocale()
    return { locale }
  },
  template: '<div>{{ locale.common.clear }}|{{ locale.tour.next }}</div>',
})

const Provider = defineComponent({
  props: ['source'],
  components: { Consumer },
  setup(props) {
    provideLocale(computed(() => props.source))
  },
  template: '<Consumer />',
})

describe('useLocale', () => {
  it('возвращает ru по умолчанию без provider', () => {
    const wrapper = mount(Consumer)
    expect(wrapper.text()).toBe(`${ru.common.clear}|${ru.tour.next}`)
  })

  it('переопределяется через provideLocale полным набором', () => {
    const wrapper = mount(Provider, { props: { source: en } })
    expect(wrapper.text()).toBe(`${en.common.clear}|${en.tour.next}`)
  })

  it('частичный локаль мержится поверх дефолтного ru', () => {
    const partial = {
      common: { clear: 'WIPE' },
      tour: { next: 'GO' },
    }
    const wrapper = mount(Provider, { props: { source: partial } })
    expect(wrapper.text()).toBe('WIPE|GO')
  })

  it('частичный локаль не ломает остальные ключи', () => {
    const partial = { common: { clear: 'WIPE' } }
    const Consumer2 = defineComponent({
      setup() {
        return { locale: useLocale() }
      },
      template: '<div>{{ locale.tour.skip }}|{{ locale.common.search }}</div>',
    })
    const Wrapper = defineComponent({
      props: ['source'],
      components: { Consumer2 },
      setup(props) {
        provideLocale(computed(() => props.source))
      },
      template: '<Consumer2 />',
    })
    const wrapper = mount(Wrapper, { props: { source: partial } })
    expect(wrapper.text()).toBe(`${ru.tour.skip}|${ru.common.search}`)
  })
})
