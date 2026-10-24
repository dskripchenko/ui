import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, nextTick } from 'vue'
import UidMarkdown from './UidMarkdown.vue'
import { provideMarkdownBlockRenderers, type UidMarkdownBlockRenderer } from './blockRenderers.js'
import { provideLocale } from '../../composables/useLocale.js'
import { en } from '../../locales/en.js'

const doc = `# Title

## First

Text with [a link](guide/start.md) and [top](#first).

\`\`\`ts
const x = 1
\`\`\`

### Deeper

#### Deepest

## Second
`

describe('UidMarkdown', () => {
  it('renders text and draws fenced code with UidCode', () => {
    const wrapper = mount(UidMarkdown, { props: { source: doc } })
    expect(wrapper.find('.uid-markdown__html h2#first').text()).toBe('First')
    expect(wrapper.find('.uid-code').exists()).toBe(true)
    expect(wrapper.find('.uid-code pre').text()).toContain('const x = 1')
  })

  it('builds a table of contents down to tocDepth', () => {
    const wrapper = mount(UidMarkdown, { props: { source: doc, toc: true } })
    const items = wrapper.findAll('.uid-markdown__toc-item').map((li) => li.text())
    expect(items).toEqual(['First', 'Deeper', 'Second'])
    expect(wrapper.find('.uid-markdown__toc').attributes('aria-label')).toBe('На этой странице')

    const deep = mount(UidMarkdown, { props: { source: doc, toc: true, tocDepth: 4 } })
    expect(deep.findAll('.uid-markdown__toc-item')).toHaveLength(4)
    expect(mount(UidMarkdown, { props: { source: doc } }).find('.uid-markdown__toc').exists()).toBe(false)
  })

  it('resolves relative links against linkBase', () => {
    const wrapper = mount(UidMarkdown, { props: { source: doc, linkBase: '/docs/en/' } })
    expect(wrapper.find('a[href="/docs/en/guide/start"]').exists()).toBe(true)
    expect(wrapper.find('a[href="#first"]').exists()).toBe(true)
  })

  it('escapes raw HTML in the source', () => {
    const wrapper = mount(UidMarkdown, { props: { source: '<script>alert(1)</script> [x](javascript:alert(1))' } })
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('<script>alert(1)</script>')
  })

  it('takes callout titles and captions from the locale', () => {
    const wrapper = mount(defineComponent({
      setup() {
        provideLocale(computed(() => en))
        return () => h(UidMarkdown, { source: '> [!WARNING]\n> Careful.\n\n## A', toc: true })
      },
    }))
    expect(wrapper.find('.uid-markdown__callout-title').text()).toBe('Warning')
    expect(wrapper.find('.uid-markdown__toc-title').text()).toBe('On this page')
  })

  describe('block renderers', () => {
    const fence = (lang: string, body = 'graph') => `Before\n\n\`\`\`${lang}\n${body}\n\`\`\`\n\nAfter`

    it('renders a block synchronously', () => {
      const calls: unknown[] = []
      const render: UidMarkdownBlockRenderer = (code, ctx) => {
        calls.push([code, ctx])
        return { html: '<svg class="test-svg"></svg>' }
      }
      const wrapper = mount(UidMarkdown, { props: { source: fence('mermaid'), blockRenderers: { mermaid: render } } })
      expect(wrapper.find('.uid-markdown__block svg.test-svg').exists()).toBe(true)
      expect(wrapper.find('.uid-code').exists()).toBe(false)
      expect(calls).toEqual([['graph', { language: 'mermaid', index: 0 }]])
    })

    it('shows a placeholder while an async renderer works', async () => {
      let resolve!: (v: { html: string }) => void
      const render: UidMarkdownBlockRenderer = () => new Promise((r) => (resolve = r))
      const wrapper = mount(UidMarkdown, { props: { source: fence('mermaid'), blockRenderers: { mermaid: render } } })
      expect(wrapper.find('.uid-markdown__block--pending').attributes('aria-busy')).toBe('true')
      resolve({ html: '<b class="done">ok</b>' })
      await flushPromises()
      expect(wrapper.find('.uid-markdown__block--pending').exists()).toBe(false)
      expect(wrapper.find('.uid-markdown__block b.done').exists()).toBe(true)
    })

    it('falls back to the code with an alert on error, throw and rejection', async () => {
      const cases: UidMarkdownBlockRenderer[] = [
        () => ({ error: 'Bad arrow on line 2' }),
        () => {
          throw new Error('Bad arrow on line 2')
        },
        () => Promise.reject(new Error('Bad arrow on line 2')),
      ]
      for (const render of cases) {
        const wrapper = mount(UidMarkdown, { props: { source: fence('mermaid', 'A -> '), blockRenderers: { mermaid: render } } })
        await flushPromises()
        const alert = wrapper.find('[role="alert"]')
        expect(alert.text()).toBe('Не удалось отрисовать блок: Bad arrow on line 2')
        expect(wrapper.find('.uid-markdown__block-error .uid-code pre').text()).toContain('A ->')
      }
    })

    it('shows the error message as text, not markup', () => {
      const wrapper = mount(UidMarkdown, {
        props: { source: fence('x'), blockRenderers: { x: () => ({ error: '<img src=x onerror=alert(1)>' }) } },
      })
      expect(wrapper.find('.uid-markdown__block-error img').exists()).toBe(false)
      expect(wrapper.find('[role="alert"]').text()).toContain('<img src=x')
    })

    it('ignores the result of an outdated render', async () => {
      const resolvers: ((v: { html: string }) => void)[] = []
      const render: UidMarkdownBlockRenderer = () => new Promise((r) => resolvers.push(r))
      const wrapper = mount(UidMarkdown, { props: { source: fence('m', 'one'), blockRenderers: { m: render } } })
      await wrapper.setProps({ source: fence('m', 'two') })
      resolvers[1]!({ html: '<i class="new">new</i>' })
      await flushPromises()
      resolvers[0]!({ html: '<i class="old">old</i>' })
      await flushPromises()
      expect(wrapper.find('i.new').exists()).toBe(true)
      expect(wrapper.find('i.old').exists()).toBe(false)
    })

    it('re-renders when the source changes', async () => {
      const wrapper = mount(UidMarkdown, {
        props: { source: fence('m', 'a'), blockRenderers: { m: (code) => ({ html: `<span class="r">${code}</span>` }) } },
      })
      await wrapper.setProps({ source: fence('m', 'b') })
      await nextTick()
      expect(wrapper.find('span.r').text()).toBe('b')
    })

    it('uses provided renderers, the prop winning language by language', () => {
      const wrapper = mount(defineComponent({
        setup() {
          provideMarkdownBlockRenderers({
            a: () => ({ html: '<span class="from-provide-a"></span>' }),
            b: () => ({ html: '<span class="from-provide-b"></span>' }),
          })
          return () =>
            h(UidMarkdown, {
              source: '```a\n1\n```\n\n```b\n2\n```',
              blockRenderers: { b: () => ({ html: '<span class="from-prop-b"></span>' }) },
            })
        },
      }))
      expect(wrapper.find('.from-provide-a').exists()).toBe(true)
      expect(wrapper.find('.from-prop-b').exists()).toBe(true)
      expect(wrapper.find('.from-provide-b').exists()).toBe(false)
    })

    it('counts the index among code blocks', () => {
      const seen: number[] = []
      mount(UidMarkdown, {
        props: {
          source: '```ts\nx\n```\n\ntext\n\n```m\ny\n```\n\n```m\nz\n```',
          blockRenderers: { m: (_c, ctx) => (seen.push(ctx.index), { html: '' }) },
        },
      })
      expect(seen).toEqual([1, 2])
    })
  })
})
