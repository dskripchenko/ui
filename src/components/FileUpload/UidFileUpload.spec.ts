import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidFileUpload from './UidFileUpload.vue'

function makeFile(name: string, size = 100, type = 'text/plain'): File {
  return new File(['x'.repeat(size)], name, { type })
}

describe('UidFileUpload', () => {
  it('рендерит dropzone', () => {
    const wrapper = mount(UidFileUpload)
    expect(wrapper.find('.uid-file-upload__dropzone').exists()).toBe(true)
  })

  it('рендерит label', () => {
    const wrapper = mount(UidFileUpload, { props: { label: 'Файлы' } })
    expect(wrapper.find('.uid-file-upload__label').text()).toContain('Файлы')
  })

  it('добавляет файл через input', async () => {
    const wrapper = mount(UidFileUpload)
    const file = makeFile('a.txt')
    const input = wrapper.find('input[type=file]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [file], writable: false })
    await wrapper.find('input[type=file]').trigger('change')
    expect(wrapper.emitted('add')?.[0]?.[0]).toEqual([file])
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('rejects файлы по accept', async () => {
    const wrapper = mount(UidFileUpload, { props: { accept: '.png' } })
    const file = makeFile('a.txt')
    const input = wrapper.find('input[type=file]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [file], writable: false })
    await wrapper.find('input[type=file]').trigger('change')
    expect(wrapper.emitted('reject')?.[0]).toEqual([file, 'type'])
    expect(wrapper.emitted('add')).toBeUndefined()
  })

  it('rejects файлы больше maxSize', async () => {
    const wrapper = mount(UidFileUpload, { props: { maxSize: 50 } })
    const file = makeFile('big.txt', 100)
    const input = wrapper.find('input[type=file]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [file], writable: false })
    await wrapper.find('input[type=file]').trigger('change')
    expect(wrapper.emitted('reject')?.[0]?.[1]).toBe('size')
  })

  it('замещает файл при multiple=false', async () => {
    const wrapper = mount(UidFileUpload, { props: { multiple: false } })
    const f1 = makeFile('a.txt')
    const f2 = makeFile('b.txt')
    const inputEl = wrapper.find('input[type=file]').element as HTMLInputElement
    Object.defineProperty(inputEl, 'files', { value: [f1], configurable: true })
    await wrapper.find('input[type=file]').trigger('change')
    Object.defineProperty(inputEl, 'files', { value: [f2], configurable: true })
    await wrapper.find('input[type=file]').trigger('change')
    const last = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Array<{ file: File }>
    expect(last).toHaveLength(1)
    expect(last[0].file.name).toBe('b.txt')
  })

  it('накапливает файлы при multiple=true', async () => {
    const wrapper = mount(UidFileUpload, { props: { multiple: true } })
    const f1 = makeFile('a.txt')
    const f2 = makeFile('b.txt')
    const inputEl = wrapper.find('input[type=file]').element as HTMLInputElement
    Object.defineProperty(inputEl, 'files', { value: [f1], configurable: true })
    await wrapper.find('input[type=file]').trigger('change')
    const updateAfterFirst = wrapper.emitted('update:modelValue')?.[0]?.[0] as Array<{ file: File }>
    await wrapper.setProps({ modelValue: updateAfterFirst })
    Object.defineProperty(inputEl, 'files', { value: [f2], configurable: true })
    await wrapper.find('input[type=file]').trigger('change')
    const last = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Array<{ file: File }>
    expect(last).toHaveLength(2)
  })

  it('удаляет файл из списка', async () => {
    const item = { file: makeFile('a.txt'), id: 'x' }
    const wrapper = mount(UidFileUpload, { props: { modelValue: [item] } })
    await wrapper.find('.uid-file-upload__remove').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
    expect(wrapper.emitted('remove')?.[0]).toEqual([item.file])
  })

  it('блокируется при disabled', async () => {
    const wrapper = mount(UidFileUpload, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('uid-file-upload--disabled')
    expect(wrapper.find('input[type=file]').attributes('disabled')).toBeDefined()
  })

  it('применяет dragover класс', async () => {
    const wrapper = mount(UidFileUpload)
    await wrapper.find('.uid-file-upload__dropzone').trigger('dragover')
    expect(wrapper.find('.uid-file-upload__dropzone').classes()).toContain('uid-file-upload__dropzone--active')
  })

  it('показывает error', () => {
    const wrapper = mount(UidFileUpload, { props: { error: 'Ошибка' } })
    expect(wrapper.find('.uid-file-upload__hint--error').text()).toBe('Ошибка')
  })

  it('rejects когда достигнут maxFiles', async () => {
    const item = { file: makeFile('a.txt'), id: 'x' }
    const wrapper = mount(UidFileUpload, { props: { modelValue: [item], maxFiles: 1, multiple: true } })
    const f2 = makeFile('b.txt')
    const inputEl = wrapper.find('input[type=file]').element as HTMLInputElement
    Object.defineProperty(inputEl, 'files', { value: [f2], configurable: true })
    await wrapper.find('input[type=file]').trigger('change')
    expect(wrapper.emitted('reject')?.[0]?.[1]).toBe('limit')
  })
})
