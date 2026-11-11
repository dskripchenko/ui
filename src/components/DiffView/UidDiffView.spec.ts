import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UidDiffView from './UidDiffView.vue'
import { diffCounts, diffPairs, diffRows } from './diff'

const patch = [
  '@@ -39,12 +39,15 @@ class RetryPolicy',
  ' a',
  ' b',
  ' c',
  ' d',
  ' e',
  ' f',
  ' g',
  ' h',
  '-old',
  '+new',
  '+more',
  ' i',
  ' j',
  '@@ -60,2 +63,2 @@',
  '-x',
  '+y',
  ' z',
].join('\n')

describe('diffRows', () => {
  it('нумерует строки старой и новой версии и сворачивает длинные неизменённые участки', () => {
    const rows = diffRows(patch, 3)
    expect(rows[0]).toEqual({ kind: 'fold', count: 38, rows: [] })
    expect(rows[1]).toMatchObject({ kind: 'fold', count: 5 })
    expect(rows[2]).toEqual({ kind: 'context', old: 44, new: 44, text: 'f' })
    expect(rows.find((r) => r.kind === 'del')).toEqual({ kind: 'del', old: 47, text: 'old' })
    expect(rows.filter((r) => r.kind === 'add').map((r) => r.kind === 'add' && r.new)).toEqual([47, 48, 63])
    const gap = rows.find((r, i) => i > 3 && r.kind === 'fold')
    expect(gap).toEqual({ kind: 'fold', count: 10, rows: [] })
  })

  it('считает добавленное и удалённое, если источник не сказал', () => {
    expect(diffCounts({ path: 'a', patch })).toEqual({ additions: 3, deletions: 2 })
    expect(diffCounts({ path: 'a', patch, additions: 9, deletions: 1 })).toEqual({ additions: 9, deletions: 1 })
  })

  it('ставит удалённое рядом с добавленным в режиме рядом', () => {
    const pairs = diffPairs(diffRows('@@ -1,2 +1,3 @@\n-a\n+b\n+c\n d', 3))
    expect(pairs[0]).toMatchObject({ left: { kind: 'del', line: 1, text: 'a' }, right: { kind: 'add', line: 1, text: 'b' } })
    expect(pairs[1]).toMatchObject({ left: { kind: 'empty' }, right: { kind: 'add', line: 2 } })
    expect(pairs[2]).toMatchObject({ left: { kind: 'context', line: 2 }, right: { kind: 'context', line: 3 } })
  })
})

describe('UidDiffView', () => {
  const files = [
    { path: 'app/RetryPolicy.php', patch },
    { path: 'tests/RetryPolicyTest.php', oldPath: 'tests/OldTest.php', status: 'renamed' as const, patch: '@@ -0,0 +1 @@\n+test' },
  ]

  it('показывает итог, открывает первый файл и сворачивает остальные', async () => {
    const wrapper = mount(UidDiffView, { props: { files, title: 'Retries' } })
    expect(wrapper.find('.uid-diff__title').text()).toBe('Retries')
    expect(wrapper.find('.uid-diff__head .uid-diff__add').text()).toBe('+4')
    expect(wrapper.findAll('.uid-diff__body')).toHaveLength(1)
    expect(wrapper.findAll('.uid-diff__path')[1].text()).toBe('tests/OldTest.php → tests/RetryPolicyTest.php')
    await wrapper.findAll('.uid-diff__file-head')[1].trigger('click')
    expect(wrapper.findAll('.uid-diff__body')).toHaveLength(2)
    expect(wrapper.findAll('.uid-diff__file-head')[1].attributes('aria-expanded')).toBe('true')
  })

  it('пишет, сколько строк свёрнуто, и раскрывает свёрнутое по клику', async () => {
    const wrapper = mount(UidDiffView, { props: { files: [files[0]] } })
    const fold = wrapper.find('.uid-diff__fold-button')
    expect(fold.text()).toContain('5 строк без изменений')
    const before = wrapper.findAll('.uid-diff__row').length
    await fold.trigger('click')
    expect(wrapper.findAll('.uid-diff__row').length).toBe(before + 5)
  })

  it('рисует рядом старое и новое', () => {
    const wrapper = mount(UidDiffView, { props: { files: [files[0]], mode: 'split' } })
    expect(wrapper.find('.uid-diff__table--split').exists()).toBe(true)
    expect(wrapper.find('.uid-diff__cell--del').text()).toBe('old')
  })
})
