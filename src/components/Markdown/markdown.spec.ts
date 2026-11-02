import { describe, it, expect } from 'vitest'
import {
  createSlugger,
  renderMarkdown,
  resolveAgainst,
  splitMarkdown,
  type MarkdownHeading,
} from './markdown.js'

describe('renderMarkdown — documentation features', () => {
  it('gives headings unique anchor ids and reports them', () => {
    const headings: MarkdownHeading[] = []
    const html = renderMarkdown('## Getting started\n\n## Getting started\n\n### Поля `Input`', {
      slugger: createSlugger(),
      onHeading: (h) => headings.push(h),
    })
    expect(html).toContain('<h2 id="getting-started">Getting started</h2>')
    expect(html).toContain('<h2 id="getting-started-1">')
    expect(html).toContain('<h3 id="поля-input">')
    expect(headings.map((h) => [h.level, h.id, h.text])).toEqual([
      [2, 'getting-started', 'Getting started'],
      [2, 'getting-started-1', 'Getting started'],
      [3, 'поля-input', 'Поля Input'],
    ])
  })

  it('leaves headings without ids by default', () => {
    expect(renderMarkdown('# Title')).toBe('<h1>Title</h1>')
  })

  it('renders tables with alignment and inline markup', () => {
    const html = renderMarkdown('| Class | Use |\n|:---|---:|\n| `Rows` | **stack** |\n| A \\| B | x |')
    expect(html).toContain('<table>')
    expect(html).toContain('<th style="text-align:left">Class</th>')
    expect(html).toContain('<th style="text-align:right">Use</th>')
    expect(html).toContain('<td style="text-align:left"><code>Rows</code></td>')
    expect(html).toContain('<strong>stack</strong>')
    expect(html).toContain('A | B')
  })

  it('does not take a paragraph followed by a rule for a table', () => {
    const html = renderMarkdown('a | b\n---')
    expect(html).not.toContain('<table>')
  })

  it('renders callouts in both styles', () => {
    const bold = renderMarkdown('> **Note** Data resets every hour.')
    expect(bold).toContain('class="uid-markdown__callout uid-markdown__callout--note"')
    expect(bold).toContain('<strong>Note</strong>')

    const github = renderMarkdown('> [!WARNING]\n> Careful.')
    expect(github).toContain('uid-markdown__callout--warning')
    expect(github).toContain('uid-markdown__callout-title')
    expect(github).not.toContain('[!WARNING]')

    expect(renderMarkdown('> just a quote')).toBe('<blockquote><p>just a quote</p></blockquote>')
  })

  it('resolves relative links and images against their bases', () => {
    const html = renderMarkdown(
      '[Menu](concepts/menu.md#items) [Up](../intro.md) [Abs](/x) [Ext](https://e.com) [Top](#a) ![s](img/s.png)',
      {
        linkBase: '/admin/screens/docs/en/',
        stripMdExtension: true,
        imageBase: '/docs-assets/',
        internalLinksInPlace: true,
      },
    )
    expect(html).toContain('<a href="/admin/screens/docs/en/concepts/menu#items">Menu</a>')
    expect(html).toContain('<a href="/admin/screens/docs/intro">Up</a>')
    expect(html).toContain('<a href="/x">Abs</a>')
    expect(html).toContain('<a href="https://e.com" target="_blank" rel="noopener noreferrer">Ext</a>')
    expect(html).toContain('<a href="#a">Top</a>')
    expect(html).toContain('<img src="/docs-assets/img/s.png" alt="s" loading="lazy">')
  })

  it('resolves against an absolute base', () => {
    expect(resolveAgainst('b.md', 'https://site.test/docs/', true)).toBe('https://site.test/docs/b')
  })

  it('still escapes raw HTML and refuses script URLs', () => {
    const html = renderMarkdown('<script>x</script> [x](javascript:alert(1))', { linkBase: '/d/' })
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('href="javascript')
  })
})

describe('splitMarkdown', () => {
  it('splits a document at its top-level fences', () => {
    const segments = splitMarkdown('# A\n\n```php\necho 1;\n```\n\ntext\n\n> ```\n> quoted\n> ```')
    expect(segments).toEqual([
      { kind: 'text', source: '# A\n' },
      { kind: 'code', code: 'echo 1;', language: 'php' },
      { kind: 'text', source: '\ntext\n\n> ```\n> quoted\n> ```' },
    ])
  })

  it('handles an unterminated fence and an empty source', () => {
    expect(splitMarkdown('```bash\nls')).toEqual([{ kind: 'code', code: 'ls', language: 'bash' }])
    expect(splitMarkdown('')).toEqual([])
  })
})

describe('renderMarkdown — lists', () => {
  it('nests a list indented under an item', () => {
    const html = renderMarkdown('- One\n  - One.a\n  - One.b\n- Two')
    expect(html).toBe('<ul><li>One<ul><li>One.a</li><li>One.b</li></ul></li><li>Two</li></ul>')
  })

  it('nests ordered in unordered, three levels deep', () => {
    const html = renderMarkdown('- A\n  1. A1\n     - A1x\n  2. A2\n- B')
    expect(html).toBe('<ul><li>A<ol><li>A1<ul><li>A1x</li></ul></li><li>A2</li></ol></li><li>B</li></ul>')
  })

  it('keeps one list across blank lines and a continuation paragraph', () => {
    const html = renderMarkdown('1. First\n\n   More about the first.\n\n2. Second')
    expect(html).toBe('<ol><li>First<p>More about the first.</p></li><li>Second</li></ol>')
  })

  it('joins a lazy continuation line to the item', () => {
    expect(renderMarkdown('- one\ntwo\n- three')).toBe('<ul><li>one\ntwo</li><li>three</li></ul>')
  })

  it('joins an indented continuation line to the item: the same paragraph, not a new one', () => {
    // A long item wrapped in the source, as editors and formatters wrap it.
    expect(renderMarkdown('- **No installer.** A zip on Windows and macOS, an\n  AppImage on Linux.\n- Next\n  `code` too.')).toBe(
      '<ul><li><strong>No installer.</strong> A zip on Windows and macOS, an\nAppImage on Linux.</li><li>Next\n<code>code</code> too.</li></ul>',
    )
    // After a blank line, an indented line is a paragraph of the item; a nested list stays nested.
    expect(renderMarkdown('- a\n  b\n\n  c\n  - d')).toBe('<ul><li>a\nb<p>c</p>\n<ul><li>d</li></ul></li></ul>')
    expect(renderMarkdown('1. x\n   y\n   ```js\n   z\n   ```')).toContain('<li>x\ny')
  })

  it('reads internal links: [[note]], a heading, a text of its own; ![[picture]] is the picture', () => {
    expect(renderMarkdown('See [[Plans]].')).toBe('<p>See <a href="Plans.md" class="uid-markdown__wikilink" data-wikilink="Plans">Plans</a>.</p>')
    expect(renderMarkdown('[[Road map#Next steps|what is next]]')).toBe('<p><a href="Road%20map.md#next-steps" class="uid-markdown__wikilink" data-wikilink="Road map#Next steps">what is next</a></p>')
    expect(renderMarkdown('[[#Intro]] and [[notes/a.md]]')).toContain('<a href="#intro" class="uid-markdown__wikilink" data-wikilink="#Intro">Intro</a>')
    expect(renderMarkdown('[[notes/a.md]]')).toContain('href="notes/a.md"')
    expect(renderMarkdown('![[img/cat.png]]')).toBe('<p><img src="img/cat.png" alt="img/cat.png" loading="lazy"></p>')
    expect(renderMarkdown('`[[not a link]]`')).toBe('<p><code>[[not a link]]</code></p>')
    expect(renderMarkdown('[[x]]', { wikiLinks: false })).toBe('<p>[[x]]</p>')
  })

  it('starts an ordered list at its first number', () => {
    expect(renderMarkdown('3. c\n4. d')).toBe('<ol start="3"><li>c</li><li>d</li></ol>')
  })

  it('ends the list at a heading or a paragraph after a blank line', () => {
    expect(renderMarkdown('- a\n\nText')).toBe('<ul><li>a</li></ul>\n<p>Text</p>')
    expect(renderMarkdown('- a\n# H')).toBe('<ul><li>a</li></ul>\n<h1>H</h1>')
  })

  it('keeps code nested in an item', () => {
    const html = renderMarkdown('- Run:\n\n  ```\n  php artisan\n  ```\n- Done')
    expect(html).toBe('<ul><li>Run:<pre><code>php artisan</code></pre></li><li>Done</li></ul>')
  })
})

describe('renderMarkdown — safety', () => {
  it('shows raw HTML as text', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;script&gt;')
  })

  it('refuses script and data URLs in links and images, in any spelling', () => {
    for (const url of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java&#58;script:x', 'data:text/html,x', 'vbscript:x']) {
      const html = renderMarkdown(`[a](${url}) ![b](${url})`)
      expect(html).not.toMatch(/href="(javascript|data|vbscript)/i)
      expect(html).not.toMatch(/src="(javascript|data|vbscript)/i)
    }
  })

  it('cannot break out of an attribute through alt or title', () => {
    const html = renderMarkdown('![x" onerror="alert(1)](a.png "t\\" onload=\\"x") [y" onclick="z](b.md)')
    const dom = new DOMParser().parseFromString(html, 'text/html')
    const attrs = [...dom.querySelectorAll('*')].flatMap((el) => [...el.attributes].map((a) => a.name))
    expect(attrs.filter((name) => name.startsWith('on'))).toEqual([])
    expect(dom.querySelector('img')?.getAttribute('alt')).toBe('x" onerror="alert(1)')
  })

  it('uses the given callout titles', () => {
    const html = renderMarkdown('> [!TIP]\n> x', { calloutTitles: { tip: 'Hint' } })
    expect(html).toContain('<p class="uid-markdown__callout-title">Hint</p>')
  })

  it('recognises Russian callout markers', () => {
    expect(renderMarkdown('> **Внимание** x')).toContain('uid-markdown__callout--warning')
  })

  describe('CommonMark: экранирование, код, переносы, заголовки ссылок, длинные ограждения', () => {
    it('обратный слеш экранирует пунктуацию и только её', () => {
      expect(renderMarkdown('A \\*not bold\\* and \\_x\\_, \\[y\\], 2 \\< 3.')).toBe('<p>A *not bold* and _x_, [y], 2 &lt; 3.</p>')
      expect(renderMarkdown('C:\\Users\\me')).toBe('<p>C:\\Users\\me</p>')
      expect(renderMarkdown('\\# not a heading')).toBe('<p># not a heading</p>')
    })
    it('код из нескольких бэктиков и отступ пробелом', () => {
      expect(renderMarkdown('Run ``a ` b`` now.')).toBe('<p>Run <code>a ` b</code> now.</p>')
      expect(renderMarkdown('`` `x` ``')).toBe('<p><code>`x`</code></p>')
      expect(renderMarkdown('`\\*`')).toBe('<p><code>\\*</code></p>')
    })
    it('жёсткий перенос: обратный слеш или два пробела в конце строки', () => {
      expect(renderMarkdown('one\\\ntwo')).toBe('<p>one<br>two</p>')
      expect(renderMarkdown('one  \ntwo')).toBe('<p>one<br>two</p>')
    })
    it('заголовок ссылки и картинки', () => {
      expect(renderMarkdown('[a](https://x.example "T")')).toContain('<a href="https://x.example" title="T"')
      expect(renderMarkdown('![p](/i.png "T")')).toContain('<img src="/i.png" alt="p" title="T"')
    })
    it('ограждение длиннее трёх закрывается только таким же или длиннее', () => {
      expect(renderMarkdown('````md\n```js\ncode\n```\n````')).toBe('<pre><code class="language-md">```js\ncode\n```</code></pre>')
    })
  })

  it('ограждение внутри блока кода с отступом не закрывает внешний блок', () => {
    const md = '```html\n<div>\n      ```mermaid\n      a --> b\n      ```\n</div>\n```\n\nafter'
    expect(renderMarkdown(md)).toBe('<pre><code class="language-html">&lt;div&gt;\n      ```mermaid\n      a --&gt; b\n      ```\n&lt;/div&gt;</code></pre>\n<p>after</p>')
  })
})


describe('renderMarkdown — task lists', () => {
  it('renders GitHub task items as disabled checkboxes', () => {
    const html = renderMarkdown('- [ ] write docs\n- [x] ship **it**\n- [X] done too')
    expect(html).toContain('<ul class="uid-markdown__tasks">')
    expect(html).toContain('<li class="uid-markdown__task"><input type="checkbox" disabled aria-label="Not done"> write docs</li>')
    expect(html).toContain('<input type="checkbox" disabled checked aria-label="Done"> ship <strong>it</strong>')
    expect(html.match(/checked/g)).toHaveLength(2)
  })

  it('keeps bullets on a list mixing tasks and plain items, and leaves `[ ]` elsewhere as text', () => {
    const html = renderMarkdown('- [ ] task\n- plain\n\nA [ ] in text.')
    expect(html).toContain('<ul><li class="uid-markdown__task">')
    expect(html).toContain('<li>plain</li>')
    expect(html).toContain('A [ ] in text.')
  })

  it('works in ordered and nested lists', () => {
    const html = renderMarkdown('1. [x] first\n   - [ ] sub')
    expect(html).toContain('<ol class="uid-markdown__tasks"><li class="uid-markdown__task"><input type="checkbox" disabled checked')
    expect(html).toContain('<ul class="uid-markdown__tasks"><li class="uid-markdown__task"><input type="checkbox" disabled aria-label="Not done"> sub</li></ul>')
  })
})

describe('renderMarkdown: math and highlights', () => {
  const tex = (html: string): string[] => [...html.matchAll(/<annotation encoding="application\/x-tex">([^<]*)<\/annotation>/g)].map((m) => m[1]!)

  it('$…$ and \\(…\\) in a line, the TeX unescaped for the formula and escaped again in it', () => {
    const html = renderMarkdown('Euler: $e^{i\\pi} + 1 = 0$ and \\(a < b\\).')
    expect(tex(html)).toEqual(['e^{i\\pi} + 1 = 0', 'a &lt; b'])
    expect(html).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML" class="dsk-math"><semantics>')
    expect(html).toContain('<mo>&lt;</mo>')
  })

  it('prices and spaced dollars stay text', () => {
    expect(renderMarkdown('From $5 to $10, or $ 3 $.')).toBe('<p>From $5 to $10, or $ 3 $.</p>')
    expect(renderMarkdown('An escaped \\$x\\$ too.')).toBe('<p>An escaped $x$ too.</p>')
  })

  it('$$…$$ and \\[…\\] on lines of their own, one line or several; unclosed is text', () => {
    const one = renderMarkdown('Before\n\n$$\\sum_{i=1}^n i$$\n\nAfter')
    expect(one).toMatch(/<p>Before<\/p>\n<div class="uid-markdown__math"><math [^>]*display="block">/)
    expect(tex(one)).toEqual(['\\sum_{i=1}^n i'])
    const many = renderMarkdown('$$\n\\begin{aligned}\na &= b \\\\\nc &= d\n\\end{aligned}\n$$')
    expect(tex(many)).toEqual(['\\begin{aligned}\na &amp;= b \\\\\nc &amp;= d\n\\end{aligned}'])
    expect(tex(renderMarkdown('\\[\nx^2\n\\]'))).toEqual(['x^2'])
    expect(renderMarkdown('$$ not closed')).toBe('<p>$$ not closed</p>')
  })

  it('math inside code is code; TeX that cannot be read is shown as written', () => {
    expect(renderMarkdown('`$x$`')).toBe('<p><code>$x$</code></p>')
    expect(renderMarkdown('$\\nope$')).toContain('<span class="dsk-math-error" title="Unknown command \\nope">\\nope</span>')
  })

  it('math off: dollars are text', () => {
    expect(renderMarkdown('$x$', { math: false })).toBe('<p>$x$</p>')
  })

  it('==highlighted== text; == between words is not', () => {
    expect(renderMarkdown('A ==marked== word')).toBe('<p>A <mark>marked</mark> word</p>')
    expect(renderMarkdown('a == b and a===b')).toBe('<p>a == b and a===b</p>')
    expect(renderMarkdown('==**bold** inside==')).toBe('<p><mark><strong>bold</strong> inside</mark></p>')
  })
})
