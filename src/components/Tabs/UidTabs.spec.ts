import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidTabs from './UidTabs.vue'
import UidTab from './UidTab.vue'
import UidTabPanel from './UidTabPanel.vue'

const buildTabs = (initialValue = 'one') => mount(UidTabs, {
  props: { modelValue: initialValue },
  slots: {
    list: `
      <UidTab value="one">Первая</UidTab>
      <UidTab value="two">Вторая</UidTab>
      <UidTab value="three" :disabled="true">Третья</UidTab>
    `,
    default: `
      <UidTabPanel value="one">Содержимое 1</UidTabPanel>
      <UidTabPanel value="two">Содержимое 2</UidTabPanel>
      <UidTabPanel value="three">Содержимое 3</UidTabPanel>
    `,
  },
  global: { components: { UidTab, UidTabPanel } },
  attachTo: document.body,
})

describe('UidTabs', () => {
  it('рендерит активную панель', () => {
    const wrapper = buildTabs('one')
    expect(wrapper.find('.uid-tab-panel').text()).toBe('Содержимое 1')
    wrapper.unmount()
  })

  it('активный таб получает класс uid-tab--active', () => {
    const wrapper = buildTabs('one')
    const tabs = wrapper.findAll('.uid-tab')
    expect(tabs[0].classes()).toContain('uid-tab--active')
    expect(tabs[1].classes()).not.toContain('uid-tab--active')
    wrapper.unmount()
  })

  it('клик по табу переключает панель', async () => {
    const wrapper = buildTabs('one')
    await wrapper.findAll('.uid-tab')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['two'])
    wrapper.unmount()
  })

  it('роли tablist, tab, tabpanel присутствуют', () => {
    const wrapper = buildTabs('one')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="tab"]').length).toBe(3)
    expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('aria-selected на активном табе', () => {
    const wrapper = buildTabs('two')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    wrapper.unmount()
  })

  it('отключённый таб имеет disabled атрибут', () => {
    const wrapper = buildTabs('one')
    const disabledTab = wrapper.findAll('.uid-tab')[2]
    expect(disabledTab.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('aria-controls указывает на панель', () => {
    const wrapper = buildTabs('one')
    const tab = wrapper.findAll('[role="tab"]')[0]
    const panel = wrapper.find('[role="tabpanel"]')
    expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
    wrapper.unmount()
  })

  it('применяет orientation класс', () => {
    const wrapper = mount(UidTabs, {
      props: { modelValue: 'a', orientation: 'vertical' },
      slots: { list: '', default: '' },
    })
    expect(wrapper.find('.uid-tabs').classes()).toContain('uid-tabs--vertical')
    wrapper.unmount()
  })
})
