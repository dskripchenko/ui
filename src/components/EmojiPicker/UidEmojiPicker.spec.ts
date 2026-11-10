import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidEmojiPicker from './UidEmojiPicker.vue'
import { loadEmoji, searchEmoji, withTone } from './emojiData'

describe('emoji data', () => {
  it('ищет по началу слов названия и ключевых слов', async () => {
    const groups = await loadEmoji('ru-RU')
    expect(searchEmoji(groups, 'огон').map((e) => e.emoji)).toContain('🔥')
    expect(searchEmoji(groups, 'хлопуш')[0]?.emoji).toBe('🎉')
    expect(searchEmoji(groups, 'zzzz')).toEqual([])
    const en = await loadEmoji('en-US')
    expect(searchEmoji(en, 'fire').map((e) => e.emoji)).toContain('🔥')
  })

  it('ставит оттенок кожи только тем, кто его принимает', () => {
    expect(withTone({ emoji: '👍', skin: true }, 3)).toBe('👍🏽')
    expect(withTone({ emoji: '👍', skin: true }, 0)).toBe('👍')
    expect(withTone({ emoji: '🔥', skin: false }, 3)).toBe('🔥')
    expect(withTone({ emoji: '✌️', skin: true }, 1)).toBe('✌🏻')
  })
})

describe('UidEmojiPicker', () => {
  it('диалог с подписью, поиск — combobox, недавние первыми', async () => {
    const wrapper = mount(UidEmojiPicker, { props: { recent: ['🎉', '👍'], autofocus: false } })
    await flushPromises()
    expect(wrapper.attributes('role')).toBe('dialog')
    expect(wrapper.attributes('aria-label')).toBe('Выбор реакции')
    expect(wrapper.find('input').attributes('role')).toBe('combobox')
    const first = wrapper.find('[data-section]')
    expect(first.attributes('data-section')).toBe('recent')
    expect(first.findAll('.uid-emoji-picker__cell').map((c) => c.text())).toEqual(['🎉', '👍'])
  })

  it('стрелки двигают активную ячейку, ↵ выбирает с оттенком', async () => {
    const wrapper = mount(UidEmojiPicker, { props: { recent: ['🎉', '👍'], skinTone: 2, autofocus: false } })
    await flushPromises()
    const input = wrapper.find('input')
    await input.trigger('keydown', { key: 'ArrowRight' })
    expect(input.attributes('aria-activedescendant')).toMatch(/-e1$/)
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')?.[0]).toEqual(['👍🏼'])
  })

  it('поиск прячет вкладки, пусто — сообщение, Esc — close', async () => {
    const wrapper = mount(UidEmojiPicker, { props: { autofocus: false } })
    await flushPromises()
    expect(wrapper.find('[role=tablist]').exists()).toBe(true)
    await wrapper.find('input').setValue('qqqqqq')
    expect(wrapper.find('[role=tablist]').exists()).toBe(false)
    expect(wrapper.find('[role=status]').text()).toBe('Ничего не нашлось')
    await wrapper.find('input').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('оттенок кожи — radiogroup из шести', async () => {
    const wrapper = mount(UidEmojiPicker, { props: { autofocus: false } })
    await flushPromises()
    await wrapper.find('.uid-emoji-picker__tone-button').trigger('click')
    const options = wrapper.findAll('[role=radio]')
    expect(options).toHaveLength(6)
    await options[4].trigger('click')
    expect(wrapper.emitted('update:skinTone')?.[0]).toEqual([4])
  })
})
