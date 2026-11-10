import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidObjectCard from './UidObjectCard.vue'

const base = { code: 'KB-12', title: 'Политика возвратов', status: { label: 'черновик', tone: 'info' as const } }

describe('UidObjectCard', () => {
  it('код, статус в тоне, заголовок и ссылка', () => {
    const w = mount(UidObjectCard, { props: { ...base, href: 'https://kb.example/KB-12', hrefLabel: 'Открыть' } })
    expect(w.find('.uid-object-card__code').text()).toBe('KB-12')
    expect(w.find('.uid-object-card__status').classes()).toContain('uid-object-card__status--info')
    expect(w.find('.uid-object-card__title').text()).toBe('Политика возвратов')
    expect(w.find('a').attributes('href')).toBe('https://kb.example/KB-12')
    expect(w.find('button').exists()).toBe(false)
  })

  it('статус-кнопка отдаёт себя как якорь меню', async () => {
    const w = mount(UidObjectCard, { props: { ...base, statusAction: true, statusActionLabel: 'Сменить состояние' } })
    const button = w.find('button.uid-object-card__status')
    expect(button.attributes('aria-label')).toBe('Сменить состояние: черновик')
    expect(button.attributes('aria-haspopup')).toBe('menu')
    await button.trigger('click')
    expect(w.emitted('status')?.[0]?.[0]).toBeInstanceOf(HTMLElement)
  })

  it('пока идёт изменение — подпись со спиннером, действия неактивны', async () => {
    const w = mount(UidObjectCard, {
      props: { ...base, statusAction: true, busy: true, busyLabel: 'Отправляется…' },
      slots: { actions: '<button class="act">Статус</button>' },
    })
    expect(w.find('[role=status]').text()).toBe('Отправляется…')
    expect(w.find('button.uid-object-card__status').exists()).toBe(false)
    expect(w.find('.uid-object-card__actions').attributes('inert')).toBeDefined()
    expect(w.attributes('aria-busy')).toBe('true')
  })

  it('ошибка — красная рамка и слот уведомления', () => {
    const w = mount(UidObjectCard, { props: { ...base, invalid: true }, slots: { notice: '<p class="why">Не опубликовано</p>', meta: '<span>Анна</span>' } })
    expect(w.classes()).toContain('uid-object-card--invalid')
    expect(w.find('.uid-object-card__notice .why').exists()).toBe(true)
    expect(w.find('.uid-object-card__meta').text()).toBe('Анна')
  })
})
