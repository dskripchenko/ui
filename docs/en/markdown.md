# Markdown

`UidMarkdown` renders a markdown document with no dependencies: headings with anchors, emphasis, links, images, lists (nested), tables with alignment, block quotes, callouts, TeX math, highlights, internal links and code. Top-level fenced code is drawn by `UidCode` (highlighting of some 35 languages and formats by `@dskripchenko/syntax`, copy button).

```vue
<UidMarkdown :source="text" toc link-base="/docs/en/" />
```

| Prop | Type | Default | |
|---|---|---|---|
| `source` | `string` | `''` | The markdown text |
| `toc` | `boolean` | `false` | Table of contents from the headings (sticky on the right, on top on narrow screens) |
| `tocDepth` | `2`–`6` | `3` | Deepest heading level in the table of contents |
| `linkBase` | `string` | — | Relative links resolve against it |
| `tocLabel` | `string` | locale | Title of the table of contents |
| `stripMdExtension` | `boolean` | `true` with `linkBase` | Drop a trailing `.md` from relative links |
| `imageBase` | `string` | — | Relative image paths resolve against it |
| `internalLinksInPlace` | `boolean` | `true` | Relative links open in the same tab; off — in a new one (e.g. a preview beside a form) |
| `calloutTitles` | `Partial<Record<kind, string>>` | locale | Callout titles (`note`, `tip`, `important`, `warning`, `caution`) |
| `blockRenderers` | `Record<string, UidMarkdownBlockRenderer>` | — | Renderers for fenced blocks by language |

## Safety

The source is HTML-escaped **before** any markup is produced: raw HTML is shown as text, never executed. Links and images accept only `http(s)`, `mailto`, relative and anchor targets — `javascript:`, `data:` and other schemes stay plain text.

## Callouts

```md
> [!NOTE]
> GitHub style: the marker line becomes a title from the locale.

> **Warning** Bold style: the text stays as written.
```

Kinds: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`. Titles and the table of contents caption come from the locale bag (`markdown.*`, see [i18n](./i18n.md)).

## Math, highlights, internal links

```md
Inline: $e^{i\pi} + 1 = 0$ or \(a^2 + b^2\). A price stays text: $5 and $10.

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

A ==highlighted== phrase. A link to a note: [[Plans#Goals|the goals]], a picture: ![[map.png]].
```

TeX math is drawn as MathML by `@dskripchenko/math`: `$…$` and `\(…\)` in a line (no space inside the dollars, no digit after the closing one, as Pandoc reads it), `$$…$$`, `\[…\]` and a ` ```math ` block on lines of their own. TeX that cannot be read is shown as written, marked, with the reason in its title. Fences and roots stretch only in a math font; the kit's styles name STIX Two Math, Cambria Math, Latin Modern Math and Noto Sans Math. `renderMarkdown(source, { math: false })` reads dollars as text.

`==text==` is highlighted (`<mark>`). `[[note]]`, `[[note#heading]]`, `[[note|text]]` are links with `data-wikilink` for the host to resolve; `![[picture.png]]` is the picture.

## Tags and properties

`#todo`, `#work/urgent` are tags: `<span class="uid-markdown__tag" data-tag="…">` for the host to act on (a letter is needed — `#123` is not one; `C#` and a link's `#anchor` are not either). A YAML front matter at the start of the document (`---` lines around `key: value`) is shown as a table of properties — lists as `[a, b]` or `- a` lines, `tags:` as tags. `renderMarkdown` reads it with `{ frontMatter: true }`; `readFrontMatter(source)` gives it as data.

## Block renderers

A fenced block whose language has a renderer is drawn by it instead of `UidCode` — this is how diagrams, charts or formulas plug in without the kit knowing about them.

```ts
import { provideMarkdownBlockRenderers, type UidMarkdownBlockRenderer } from '@dskripchenko/ui'
import { render } from '@dskripchenko/diagrams'

const mermaid: UidMarkdownBlockRenderer = (code) => {
  try {
    return { html: render(code).svg }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// In the root component's setup — every UidMarkdown below uses it:
provideMarkdownBlockRenderers({ mermaid })
```

- The renderer receives the code and `{ language, index }` (index among the document's code blocks).
- It returns `{ html }` or `{ error }`, synchronously or as a promise. While a promise is pending the block shows a placeholder; results of an outdated render (the source changed meanwhile) are ignored.
- On `error`, a thrown exception or a rejected promise the block is shown as code with a notice (`role="alert"`).
- **`html` is inserted as is.** The renderer is responsible for its safety: return only markup you built with every piece of user text escaped.
- The `blockRenderers` prop takes precedence over provided renderers, language by language. App-wide: `app.provide(markdownBlockRenderersKey, renderers)`.

### Live blocks

Instead of `html` a renderer may return `mount` — a widget is mounted into the block's element (an API console, a chart with controls):

```ts
const api: UidMarkdownBlockRenderer = () => ({
  mount: (el, { code }) => {
    const widget = createWidget(el, code)
    return { update: (next) => widget.setSource(next), destroy: () => widget.unmount() }
  },
})
```

- `mount(el, { code, language, editable, setCode })` returns a handle `{ update?, destroy? }` or a cleanup function. Rendered markdown is read-only: `editable` is `false` and `setCode` does nothing.
- When the source changes and the block stays in place, the widget keeps living and gets the new source through `update`; without `update` it is mounted again. `destroy` runs when the block goes away or UidMarkdown unmounts.
- The contract is the one of the WYSIWYG editor's live blocks (`@dskripchenko/wysiwyg`), so a renderer registered once serves both.

## The renderer as a function

`renderMarkdown(source, options)` and `splitMarkdown(source)` are exported too — for a preview outside a component or for server-side use. Options: `slugger`, `onHeading`, `linkBase`, `stripMdExtension`, `imageBase`, `internalLinksInPlace`, `calloutTitles`.

## Theming

`--uid-markdown-color`, `--uid-markdown-muted`, `--uid-markdown-link`, `--uid-markdown-border`, `--uid-markdown-sunken`, `--uid-markdown-font-size`, `--uid-markdown-line-height`, `--uid-markdown-toc-width` — all mapped to theme tokens, so the dark theme needs nothing extra.
