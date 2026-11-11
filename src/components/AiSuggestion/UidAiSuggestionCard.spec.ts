import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidAiModelTag from './UidAiModelTag.vue'
import UidAiSuggestionCard from './UidAiSuggestionCard.vue'

describe('UidAiSuggestionCard', () => {
  it('показывает текст, метку «видно только вам», мету с моделью и кнопки из слота', () => {
    const w = mount(UidAiSuggestionCard, {
      props: { title: 'Summary', text: '- **Decided:** retry', meta: '9 messages', model: 'qwen2.5:7b' },
      slots: { actions: '<button class="publish">Publish</button>' },
    })
    expect(w.find('strong').text()).toBe('Decided:')
    expect(w.find('.uid-ai-suggestion__private').text()).toBe('видно только вам')
    expect(w.find('.uid-ai-suggestion__meta').text()).toBe('9 messages · qwen2.5:7b')
    expect(w.find('.publish').exists()).toBe(true)
  })

  it('ожидание — скелетон, строка с моделью и «Отмена»', async () => {
    const w = mount(UidAiSuggestionCard, { props: { title: 'Summary', state: 'pending', pendingText: 'Reading 9 messages', model: 'm' } })
    expect(w.find('.uid-skeleton').exists()).toBe(true)
    expect(w.find('.uid-ai-suggestion__pending').text()).toBe('Reading 9 messages · m')
    expect(w.attributes('aria-busy')).toBe('true')
    await w.find('.uid-ai-suggestion__actions button').trigger('click')
    expect(w.emitted('cancel')).toHaveLength(1)
  })

  it('правка: поле, «текст поправлен вами» и «Вернуть как было» к исходному', async () => {
    const w = mount(UidAiSuggestionCard, { props: { title: 'Summary', text: 'a', original: 'a', editing: true } })
    expect(w.find('textarea').element.value).toBe('a')
    expect(w.text()).not.toContain('поправлен')
    await w.find('textarea').setValue('b')
    expect(w.emitted('update:text')?.[0]).toEqual(['b'])
    await w.setProps({ text: 'b' })
    expect(w.find('.uid-ai-suggestion__meta').text()).toBe('текст поправлен вами')
    await w.find('.uid-ai-suggestion__actions button').trigger('click')
    expect(w.emitted('update:text')?.[1]).toEqual(['a'])
  })

  it('ошибка: иконка по виду, код, «Повторить» — только когда стоит повторить', async () => {
    const w = mount(UidAiSuggestionCard, { props: { title: 'Summary', state: 'error', error: { title: 'No answer', message: 'Try again', code: 'ai_unavailable', kind: 'failed' } } })
    expect(w.find('[role="alert"]').text()).toContain('No answer')
    expect(w.find('.uid-ai-suggestion__error--failed').exists()).toBe(true)
    expect(w.find('.uid-ai-suggestion__meta').text()).toBe('код: ai_unavailable')
    expect(w.find('.uid-ai-suggestion__actions').exists()).toBe(false)
    await w.setProps({ retryable: true })
    await w.find('.uid-ai-suggestion__actions button').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })

  it('закрывается крестиком; метку можно убрать', async () => {
    const w = mount(UidAiSuggestionCard, { props: { title: 'Summary', privateLabel: false } })
    expect(w.find('.uid-ai-suggestion__private').exists()).toBe(false)
    await w.find('.uid-ai-suggestion__close').trigger('click')
    expect(w.emitted('close')).toHaveLength(1)
  })
})

describe('UidAiModelTag', () => {
  it('пишет, что сделано и какой моделью', () => {
    expect(mount(UidAiModelTag, { props: { model: 'qwen2.5:7b', label: 'summary' } }).text()).toBe('summary · qwen2.5:7b')
    expect(mount(UidAiModelTag, { props: { model: 'qwen2.5:7b' } }).text()).toBe('qwen2.5:7b')
  })
})
