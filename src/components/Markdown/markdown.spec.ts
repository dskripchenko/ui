import { describe, it, expect } from 'vitest'
import {
  createSlugger,
  readFrontMatter,
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

  it('takes a destination in angle brackets, spaces and all (CommonMark)', () => {
    const html = renderMarkdown(
      '[a](<req/b.md>) [b](<my notes/plan.md> "T") ![p](<img/a b.png>) [c](req/c.md)\n\n| x |\n|---|\n| [d](<req/d.md>) |',
      { linkBase: 'folio://app/r/1/', imageBase: '/m/' },
    )
    expect(html).toContain('href="folio://app/r/1/req/b.md"')
    expect(html).toContain('href="folio://app/r/1/my%20notes/plan.md" title="T"')
    expect(html).toContain('src="/m/img/a%20b.png"')
    expect(html).toContain('href="folio://app/r/1/req/c.md"')
    expect(html).toContain('href="folio://app/r/1/req/d.md"')
    expect(html).not.toMatch(/%3C|%3E|&lt;req/)
    expect(renderMarkdown('[x](<javascript:alert(1)>)')).not.toContain('href="javascript')
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
    expect(renderMarkdown('![[img/cat.png]]')).toBe('<p><img src="img/cat.png" alt="img/cat.png" loading="lazy" class="uid-markdown__embed-image" data-embed="img/cat.png"></p>')
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

  describe('URLs are judged on their final value', () => {
    const optionSets = [{}, { internalLinksInPlace: true }, { linkBase: '/docs/', imageBase: '/media/' }]
    // Every attribute that can carry a URL, read from the parsed HTML.
    const urls = (html: string): string[] => {
      const dom = new DOMParser().parseFromString(html, 'text/html')
      return [...dom.querySelectorAll('[href], [src]')].map((el) => el.getAttribute('href') ?? el.getAttribute('src') ?? '')
    }
    const unsafe = (value: string): boolean =>
      /^(javascript|vbscript|data|file):/i.test(value.replace(/[\u0000- \u007f- ]+/g, ''))

    const attacks = [
      // A backslash escape used to hide the colon (or a letter) until after the check.
      '[x](javascript\\:alert%28document.domain%29)',
      '[x](j\\avascript:alert(1))',
      '[x](javascript\\&#58;alert(1))',
      '![x](javascript\\:alert(1))',
      '![x](data\\:image/svg+xml,x)',
      '[x](vbscript\\:msgbox(1))',
      '[x](data\\:text/html,x)',
      '[x](JaVaScRiPt\\:alert(1))',
      // Character references, mixed case, whitespace and control characters around the scheme.
      '[x](&#106;avascript:alert(1))',
      '[x](&#x6A;avascript\\:alert(1))',
      '[x](&#0000106;avascript:alert(1))',
      '[x](java&#9;script:alert(1))',
      '[x](java&Tab;script:alert(1))',
      '[x](\u0001javascript:alert(1))',
      '[x]( javascript:alert(1))',
      '[x](JAVASCRIPT:alert(1))',
      '[x](vbscript:msgbox(1))',
      '[x](data:text/html;base64,PHNjcmlwdD4=)',
      '![x](data:image/png;base64,AAAA)',
      // Internal links: the guessed address is a URL like any other.
      '[[javascript:alert(document.domain)//x.y]]',
      '[[javascript:alert(1)]]',
      '[[JavaScript:alert(1)//a.md|click]]',
      '[[javascript\\:alert(1)//x.y]]',
      '[[vbscript:msgbox(1)//x.y]]',
      '[[data:text/html,x//x.y]]',
      '![[javascript:alert(1)//x.y]]',
      '![[javascript:alert(1)//a.png]]',
      '![[data:image/svg+xml,x//a.svg]]',
    ]

    for (const opts of optionSets) {
      it(`refuses hidden schemes with ${JSON.stringify(opts)}`, () => {
        for (const source of attacks) {
          const html = renderMarkdown(source, opts)
          expect(urls(html).filter(unsafe), `${source} → ${html}`).toEqual([])
          expect(html, source).not.toMatch(/(href|src)="\s*(javascript|vbscript|data):/i)
        }
      })
    }

    it('leaves a refused link as its text', () => {
      expect(renderMarkdown('[x](javascript\\:alert%28document.domain%29)', { internalLinksInPlace: true })).toBe(
        '<p>[x](javascript:alert%28document.domain%29)</p>',
      )
      expect(renderMarkdown('[[javascript:alert(document.domain)//x.y]]')).toBe('<p>[[javascript:alert(document.domain)//x.y]]</p>')
    })

    it('does not let a stashed piece (code, math) into a URL or an attribute', () => {
      const html = renderMarkdown('[a](`x`) [b]($y$) [c](/p "$z$") ![`d`](e.png)')
      const dom = new DOMParser().parseFromString(html, 'text/html')
      expect(urls(html).some((u) => u.includes('<'))).toBe(false)
      for (const el of dom.querySelectorAll('a, img')) {
        expect([...el.attributes].map((a) => a.name).every((n) => ['href', 'src', 'alt', 'title', 'target', 'rel', 'loading'].includes(n))).toBe(true)
      }
    })

    it('still renders ordinary links, images and internal links', () => {
      expect(renderMarkdown('[a](https://example.com/a\\_b)')).toBe(
        '<p><a href="https://example.com/a_b" target="_blank" rel="noopener noreferrer">a</a></p>',
      )
      expect(renderMarkdown('[a](guide.md#setup)', { internalLinksInPlace: true })).toBe('<p><a href="guide.md#setup">a</a></p>')
      expect(renderMarkdown('[a](/x?a=1&b=2)', { internalLinksInPlace: true })).toBe('<p><a href="/x?a=1&amp;b=2">a</a></p>')
      expect(renderMarkdown('[mail](mailto:a@example.com)')).toContain('href="mailto:a@example.com"')
      expect(renderMarkdown('![p](img/cat.png "A cat")')).toBe('<p><img src="img/cat.png" alt="p" title="A cat" loading="lazy"></p>')
      for (const opts of optionSets.slice(0, 2)) {
        expect(renderMarkdown('See [[Plans]].', opts)).toBe(
          '<p>See <a href="Plans.md" class="uid-markdown__wikilink" data-wikilink="Plans">Plans</a>.</p>',
        )
        expect(renderMarkdown('[[Road map#Next steps|what is next]]', opts)).toContain('href="Road%20map.md#next-steps"')
        expect(renderMarkdown('![[img/cat.png]]', opts)).toContain('<img src="img/cat.png"')
      }
      expect(renderMarkdown('[[Plans]]', { linkBase: '/docs/' })).toContain('href="/docs/Plans.md"')
    })
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

describe('renderMarkdown: tags and properties', () => {
  it('#tags at the start of a word, with a letter in them; not C#, #123, an anchor or a heading', () => {
    expect(renderMarkdown('Work on #todo and #work/urgent, #задача.')).toBe(
      '<p>Work on <span class="uid-markdown__tag" data-tag="todo">#todo</span> and <span class="uid-markdown__tag" data-tag="work/urgent">#work/urgent</span>, <span class="uid-markdown__tag" data-tag="задача">#задача</span>.</p>',
    )
    expect(renderMarkdown('C# and #123, see [here](#intro) or https://e.com/#x')).not.toContain('uid-markdown__tag')
    expect(renderMarkdown('# Heading')).toContain('<h1')
    expect(renderMarkdown('`#code`')).toBe('<p><code>#code</code></p>')
    expect(renderMarkdown('#todo', { tags: false })).toBe('<p>#todo</p>')
  })

  it('front matter: only when asked, read as properties; tags among them as tags', () => {
    const src = '---\ntitle: "The plan"\ntags: [work, q4]\naliases:\n  - Plan\n  - Roadmap\n---\n\n# Body'
    expect(renderMarkdown(src)).toContain('<hr>')
    const html = renderMarkdown(src, { frontMatter: true })
    expect(html).toMatch(/^<table class="uid-markdown__props"><tbody><tr><th scope="row">title<\/th><td><span class="uid-markdown__prop-value">The plan<\/span><\/td><\/tr>/)
    expect(html).toContain('<td><span class="uid-markdown__tag" data-tag="work">#work</span> <span class="uid-markdown__tag" data-tag="q4">#q4</span></td>')
    expect(html).toContain('<span class="uid-markdown__prop-value">Plan</span><span class="uid-markdown__prop-value">Roadmap</span>')
    expect(html).toContain('<h1>Body</h1>')
    expect(html).not.toContain('<hr>')
  })

  it('readFrontMatter: simple YAML; none without the opening line; values escaped when drawn', () => {
    expect(readFrontMatter('---\na: 1\nb: [x, "y"]\nc: \'z\'\n---\nrest')).toEqual({ data: { a: '1', b: ['x', 'y'], c: 'z' }, length: 32 })
    expect(readFrontMatter('text\n---\na: 1\n---')).toBeNull()
    expect(renderMarkdown('---\nx: <b>y</b>\n---\n', { frontMatter: true })).toContain('&lt;b&gt;y&lt;/b&gt;')
  })
})

describe('renderMarkdown: embeds', () => {
  it('![[note]] and ![[note#heading]] are embeds around their link; a picture stays a picture', () => {
    expect(renderMarkdown('![[Plan#Goals]]')).toBe(
      '<p><span class="uid-markdown__embed" data-embed="Plan#Goals"><a href="Plan.md#goals" class="uid-markdown__wikilink" data-wikilink="Plan#Goals">Plan › Goals</a></span></p>',
    )
    expect(renderMarkdown('![[map.png]]')).toContain('<img src="map.png"')
  })

  it('an embed sized as in Obsidian: ![[a.png|300]], |300x200; the host told the name to find it by', () => {
    expect(renderMarkdown('![[cat.png|300]]')).toBe(
      '<p><img src="cat.png" alt="cat.png" width="300" loading="lazy" class="uid-markdown__embed-image" data-embed="cat.png" data-size="300"></p>',
    )
    expect(renderMarkdown('![[cat.png|300x200]]')).toContain('width="300" height="200"')
    // A text that is not a size stays the picture's text.
    expect(renderMarkdown('![[cat.png|A cat]]')).toContain('alt="A cat"')
    expect(renderMarkdown('![[clip.mp4|400]]')).toContain('<span class="uid-markdown__embed" data-embed="clip.mp4" data-size="400">')
  })

  describe('block ids', () => {
    it('hides ^id at the end of a block and anchors the block', () => {
      expect(renderMarkdown('Pay by the fifth. ^pay-rule')).toBe('<p id="^pay-rule" data-block-id="pay-rule">Pay by the fifth.</p>')
      expect(renderMarkdown('Line one\nline two ^Two')).toBe('<p id="^two" data-block-id="two">Line one\nline two</p>')
      expect(renderMarkdown('- first ^li-1\n- second')).toBe('<ul><li id="^li-1" data-block-id="li-1">first</li><li>second</li></ul>')
      expect(renderMarkdown('- [ ] do it ^t1')).toContain('<li class="uid-markdown__task" id="^t1" data-block-id="t1"><input')
      expect(renderMarkdown('> Quoted ^q1')).toBe('<blockquote><p id="^q1" data-block-id="q1">Quoted</p></blockquote>')
      expect(renderMarkdown('## Goals ^goals')).toBe('<h2 id="^goals" data-block-id="goals">Goals</h2>')
    })

    it('gives a heading with a slug id an anchor of its own', () => {
      expect(renderMarkdown('## Goals ^g1', { slugger: createSlugger() })).toBe(
        '<h2 id="goals" data-block-id="g1"><a class="uid-markdown__block-anchor" id="^g1" aria-hidden="true"></a>Goals</h2>',
      )
    })

    it('leaves text that only looks like an id', () => {
      expect(renderMarkdown('x ^2')).toBe('<p>x ^2</p>')
      expect(renderMarkdown('a ^b in the middle')).toBe('<p>a ^b in the middle</p>')
      expect(renderMarkdown('no space^id')).toBe('<p>no space^id</p>')
      expect(renderMarkdown('```\ncode ^id\n```')).toBe('<pre><code>code ^id</code></pre>')
      expect(renderMarkdown('Kept ^id', { blockIds: false })).toBe('<p>Kept ^id</p>')
    })

    it('links [[note#^id]] to the block', () => {
      expect(renderMarkdown('[[Plan#^Pay-Rule|the rule]]')).toBe(
        '<p><a href="Plan.md#%5Epay-rule" class="uid-markdown__wikilink" data-wikilink="Plan#^Pay-Rule">the rule</a></p>',
      )
      expect(renderMarkdown('[[#^q1]]')).toContain('href="#%5Eq1"')
      expect(renderMarkdown('[[Plan#Goals]]')).toContain('href="Plan.md#goals"')
    })
  })
})

