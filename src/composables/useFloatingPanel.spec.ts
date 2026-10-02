import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useFloatingPanel } from './useFloatingPanel.js'
import UidDatePicker from '../components/DatePicker/UidDatePicker.vue'
import UidModal from '../components/Modal/UidModal.vue'
import UidDrawer from '../components/Drawer/UidDrawer.vue'

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

/** A host with an anchor and a panel whose geometry the test controls. */
function makeHost(anchor: { r: DOMRect }, panelRect: DOMRect) {
  return defineComponent({
    setup(_, { expose }) {
      const anchorRef = ref<HTMLElement | null>(null)
      const panelRef = ref<HTMLElement | null>(null)
      const isOpen = ref(false)
      const floating = useFloatingPanel(anchorRef, panelRef, isOpen)
      expose({ isOpen, ...floating })
      return () => h('div', [
        h('button', { ref: (el) => {
          anchorRef.value = el as HTMLElement | null
          if (el) (el as HTMLElement).getBoundingClientRect = () => anchor.r
        } }),
        isOpen.value
          ? h('div', { ref: (el) => {
            panelRef.value = el as HTMLElement | null
            if (el) (el as HTMLElement).getBoundingClientRect = () => panelRect
          }, class: 'panel', style: floating.panelStyle.value })
          : null,
      ])
    },
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useFloatingPanel', () => {
  it('positions the panel fixed under the anchor once measured', async () => {
    const anchor = { r: rect(100, 50, 200, 32) }
    const wrapper = mount(makeHost(anchor, rect(0, 0, 200, 150)))
    ;(wrapper.vm as unknown as { isOpen: boolean }).isOpen = true
    await nextTick(); await nextTick(); await nextTick()
    const style = (wrapper.find('.panel').element as HTMLElement).style
    expect(style.position).toBe('fixed')
    expect(style.top).toBe('136px')
    expect(style.left).toBe('50px')
    expect(style.opacity).toBe('')
  })

  it('flips above the anchor when there is no room below', async () => {
    const anchor = { r: rect(window.innerHeight - 40, 50, 200, 32) }
    const wrapper = mount(makeHost(anchor, rect(0, 0, 200, 300)))
    const vm = wrapper.vm as unknown as { isOpen: boolean; actualPlacement: string }
    vm.isOpen = true
    await nextTick(); await nextTick(); await nextTick()
    expect(vm.actualPlacement).toBe('top-start')
    const top = parseFloat((wrapper.find('.panel').element as HTMLElement).style.top)
    expect(top).toBeLessThan(window.innerHeight - 40)
  })

  it('follows the anchor when an ancestor scrolls', async () => {
    const anchor = { r: rect(100, 50, 200, 32) }
    const wrapper = mount(makeHost(anchor, rect(0, 0, 200, 150)))
    ;(wrapper.vm as unknown as { isOpen: boolean }).isOpen = true
    await nextTick(); await nextTick(); await nextTick()
    anchor.r = rect(60, 50, 200, 32)
    document.body.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect((wrapper.find('.panel').element as HTMLElement).style.top).toBe('96px')
  })
})

describe('floating panels inside overlays', () => {
  it('the date picker panel is teleported to the body and a click inside it keeps it open', async () => {
    const wrapper = mount(UidDatePicker, { attachTo: document.body })
    await wrapper.find('.uid-datepicker__trigger').trigger('click')
    await nextTick()
    const panel = document.body.querySelector('.uid-datepicker__panel') as HTMLElement
    expect(panel).not.toBeNull()
    expect(wrapper.element.contains(panel)).toBe(false)
    expect(panel.style.position).toBe('fixed')
    panel.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(document.body.querySelector('.uid-datepicker__panel')).not.toBeNull()
    wrapper.unmount()
  })

  it('Escape in a picker inside a modal closes the picker, not the modal', async () => {
    const Host = defineComponent({
      setup() {
        const open = ref(true)
        return () => h(UidModal, { modelValue: open.value, 'onUpdate:modelValue': (v: boolean) => { open.value = v } }, {
          default: () => h(UidDatePicker),
        })
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    // The modal starts listening when it opens.
    const modal = wrapper.findComponent(UidModal)
    await modal.setValue(false)
    await modal.setValue(true)
    await nextTick(); await nextTick()
    const trigger = document.body.querySelector('.uid-datepicker__trigger') as HTMLElement
    trigger.click()
    await nextTick(); await nextTick()
    const grid = document.body.querySelector('.uid-datepicker__grid') as HTMLElement
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(document.body.querySelector('.uid-datepicker__panel')).toBeNull()
    expect(document.body.querySelector('.uid-modal')).not.toBeNull()
    wrapper.unmount()
  })

  it('Escape closes only the top layer: a drawer opened from a modal', async () => {
    const modalOpen = ref(false)
    const drawerOpen = ref(false)
    const Host = defineComponent({
      setup() {
        return () => h(UidModal, { modelValue: modalOpen.value, 'onUpdate:modelValue': (v: boolean) => { modalOpen.value = v } }, {
          default: () => h(UidDrawer, { modelValue: drawerOpen.value, 'onUpdate:modelValue': (v: boolean) => { drawerOpen.value = v } }, {
            default: () => 'drawer body',
          }),
        })
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    modalOpen.value = true
    await nextTick(); await nextTick()
    drawerOpen.value = true
    await nextTick(); await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(drawerOpen.value).toBe(false)
    expect(modalOpen.value).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(modalOpen.value).toBe(false)
    wrapper.unmount()
  })
})
