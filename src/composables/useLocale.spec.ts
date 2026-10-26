import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp, defineComponent, computed, h, ref, nextTick } from 'vue'
import { localeKey, provideAppLocale, provideLocale, useLocale } from './useLocale.js'
import { getMessage, setValidationLocale } from '../utils/validation/messages.js'
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

// vitest.setup.ts provides ru for every spec; these mount without it.
const noProvider = { global: { provide: { [localeKey as symbol]: undefined } } }

describe('useLocale', () => {
  it('возвращает en по умолчанию без provider', () => {
    const wrapper = mount(Consumer, noProvider)
    expect(wrapper.text()).toBe(`${en.common.clear}|${en.tour.next}`)
  })

  it('переопределяется на ru через provideLocale', () => {
    const wrapper = mount(Provider, { ...noProvider, props: { source: ru } })
    expect(wrapper.text()).toBe(`${ru.common.clear}|${ru.tour.next}`)
  })

  it('переопределяется через provideLocale полным набором', () => {
    const wrapper = mount(Provider, { ...noProvider, props: { source: en } })
    expect(wrapper.text()).toBe(`${en.common.clear}|${en.tour.next}`)
  })

  it('частичный локаль мержится поверх дефолтного en', () => {
    const partial = {
      common: { clear: 'WIPE' },
      tour: { next: 'GO' },
    }
    const wrapper = mount(Provider, { ...noProvider, props: { source: partial } })
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
    const wrapper = mount(Wrapper, { ...noProvider, props: { source: partial } })
    expect(wrapper.text()).toBe(`${en.tour.skip}|${en.common.search}`)
  })
})

describe('provideAppLocale', () => {
  function mountApp(setup: (app: ReturnType<typeof createApp>) => void) {
    const el = document.createElement('div')
    const app = createApp({ render: () => h(Consumer) })
    setup(app)
    app.mount(el)
    return { app, el }
  }

  it('провайдит локаль на уровне приложения', () => {
    const { app, el } = mountApp((a) => provideAppLocale(a, ru))
    expect(el.textContent).toBe(`${ru.common.clear}|${ru.tour.next}`)
    app.unmount()
    setValidationLocale(ru)
  })

  it('реактивно переключает локаль и сообщения валидации', async () => {
    const lang = ref<'ru' | 'en'>('en')
    const { app, el } = mountApp((a) => provideAppLocale(a, () => (lang.value === 'ru' ? ru : en)))
    expect(el.textContent).toBe(`${en.common.clear}|${en.tour.next}`)
    expect(getMessage('email', {} as never)).toBe(en.validation.email)
    lang.value = 'ru'
    await nextTick()
    expect(el.textContent).toBe(`${ru.common.clear}|${ru.tour.next}`)
    expect(getMessage('email', {} as never)).toBe(ru.validation.email)
    app.unmount()
    setValidationLocale(ru)
  })

  it('частичная локаль мержится поверх en, stop останавливает синхронизацию валидации', () => {
    setValidationLocale(en)
    const source = ref<Record<string, unknown>>({ common: { clear: 'WIPE' } })
    let stop = () => {}
    const { app, el } = mountApp((a) => { stop = provideAppLocale(a, source) })
    expect(el.textContent).toBe(`WIPE|${en.tour.next}`)
    stop()
    source.value = ru as never
    expect(getMessage('email', {} as never)).toBe(en.validation.email)
    app.unmount()
    setValidationLocale(ru)
  })
})
