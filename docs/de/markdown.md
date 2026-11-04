# Markdown

`UidMarkdown` rendert ein Markdown-Dokument ohne Abhängigkeiten: Überschriften mit Ankern, Hervorhebungen, Links, Bilder, (verschachtelte) Listen, Tabellen mit Ausrichtung, Zitate, Hinweisboxen, TeX-Formeln, Hervorhebungen, interne Links und Code. Codeblöcke der obersten Ebene zeichnet `UidCode` (Hervorhebung von rund 35 Sprachen und Formaten durch `@dskripchenko/syntax`, Kopier-Button).

```vue
<UidMarkdown :source="text" toc link-base="/docs/de/" />
```

| Prop | Typ | Standard | |
|---|---|---|---|
| `source` | `string` | `''` | Der Markdown-Text |
| `toc` | `boolean` | `false` | Inhaltsverzeichnis aus den Überschriften (rechts, auf schmalen Bildschirmen oben) |
| `tocDepth` | `2`–`6` | `3` | Tiefste Überschriftenebene im Inhaltsverzeichnis |
| `linkBase` | `string` | — | Relative Links werden dagegen aufgelöst |
| `tocLabel` | `string` | Locale | Titel des Inhaltsverzeichnisses |
| `stripMdExtension` | `boolean` | `true` mit `linkBase` | `.md` am Ende relativer Links entfernen |
| `imageBase` | `string` | — | Relative Bildpfade werden dagegen aufgelöst |
| `internalLinksInPlace` | `boolean` | `true` | Relative Links öffnen im selben Tab; aus — in einem neuen (etwa eine Vorschau neben einem Formular) |
| `calloutTitles` | `Partial<Record<kind, string>>` | Locale | Titel der Hinweisboxen (`note`, `tip`, `important`, `warning`, `caution`) |
| `blockRenderers` | `Record<string, UidMarkdownBlockRenderer>` | — | Renderer für Codeblöcke nach Sprache |

## Sicherheit

Der Quelltext wird **vor** jeder Auszeichnung HTML-maskiert: rohes HTML erscheint als Text und wird nie ausgeführt. Links und Bilder akzeptieren nur `http(s)`, `mailto`, relative Adressen und Anker — `javascript:`, `data:` und andere Schemata bleiben Text.

## Hinweisboxen

```md
> [!NOTE]
> GitHub-Stil: die Markierungszeile wird zum Titel aus der Locale.

> **Warning** Fett-Stil: der Text bleibt wie geschrieben.
```

Arten: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`. Titel und die Beschriftung des Inhaltsverzeichnisses kommen aus der Locale (`markdown.*`, siehe [i18n](./i18n.md)).

## Formeln, Hervorhebungen, interne Links

```md
Inline: $e^{i\pi} + 1 = 0$ or \(a^2 + b^2\). A price stays text: $5 and $10.

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

A ==highlighted== phrase. A link to a note: [[Plans#Goals|the goals]], a picture: ![[map.png]].
```

TeX-Formeln werden von `@dskripchenko/math` als MathML gezeichnet: `$…$` und `\(…\)` in einer Zeile (kein Leerzeichen innerhalb der Dollarzeichen, keine Ziffer nach dem schließenden — wie Pandoc liest), `$$…$$`, `\[…\]` und ein ` ```math `-Block auf eigenen Zeilen. TeX, das nicht gelesen werden kann, erscheint wie geschrieben, markiert, mit dem Grund im Tooltip. Klammern und Wurzeln strecken sich nur in einer Mathematikschrift; die Stile des Kits nennen STIX Two Math, Cambria Math, Latin Modern Math und Noto Sans Math. `renderMarkdown(source, { math: false })` liest Dollarzeichen als Text.

`==Text==` wird hervorgehoben (`<mark>`). `[[Notiz]]`, `[[Notiz#Überschrift]]`, `[[Notiz|Text]]` sind Links mit `data-wikilink`, die der Host auflöst; `![[bild.png]]` ist das Bild (`class="uid-markdown__embed-image"`, sein Name in `data-embed`, damit der Host die Datei findet; `src` ist eine Vermutung neben dem Dokument), `![[bild.png|300]]` oder `|300x200` in dieser Größe (`width`/`height`, `data-size`) — die Einbettung einer Notiz oder eines Videos erhält `data-size` ebenfalls.

## Tags und Eigenschaften

`#todo`, `#work/urgent` sind Tags: `<span class="uid-markdown__tag" data-tag="…">`, auf die der Host reagiert (ein Buchstabe ist nötig — `#123` ist keiner; `C#` und der `#Anker` eines Links auch nicht). Ein YAML-Front-Matter am Anfang des Dokuments (`---`-Zeilen um `Schlüssel: Wert`) erscheint als Tabelle der Eigenschaften — Listen als `[a, b]` oder `- a`-Zeilen, `tags:` als Tags. `renderMarkdown` liest es mit `{ frontMatter: true }`; `readFrontMatter(source)` liefert es als Daten.

`![[Notiz]]` und `![[Notiz#Überschrift]]` betten eine andere Notiz ein: `<span class="uid-markdown__embed" data-embed="…">` um ihren Link, den der Host mit der Notiz füllt (und mit der Klasse `is-filled` versieht); ohne Host bleibt der Link.

## Block-Renderer

Ein Codeblock, für dessen Sprache ein Renderer existiert, wird von diesem statt von `UidCode` gezeichnet — so lassen sich Diagramme, Charts oder Formeln einbinden, ohne dass das Kit sie kennt.

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

// Im setup der Wurzelkomponente — alle UidMarkdown darunter nutzen ihn:
provideMarkdownBlockRenderers({ mermaid })
```

- Der Renderer erhält den Code und `{ language, index }` (Index unter den Codeblöcken des Dokuments).
- Er liefert `{ html }` oder `{ error }`, synchron oder als Promise. Solange das Promise läuft, zeigt der Block einen Platzhalter; Ergebnisse eines veralteten Renderings werden verworfen.
- Bei `error`, einer Ausnahme oder einem abgelehnten Promise wird der Block als Code mit einem Hinweis (`role="alert"`) gezeigt.
- **`html` wird unverändert eingefügt.** Für die Sicherheit ist der Renderer verantwortlich: nur selbst erzeugtes Markup mit maskiertem Benutzertext zurückgeben.
- Das Prop `blockRenderers` hat Vorrang vor bereitgestellten Renderern, je Sprache. App-weit: `app.provide(markdownBlockRenderersKey, renderers)`.

### Live-Blöcke

Statt `html` kann ein Renderer `mount` liefern — ein Widget wird in das Element des Blocks gemountet (eine API-Konsole, ein Diagramm mit Bedienelementen):

```ts
const api: UidMarkdownBlockRenderer = () => ({
  mount: (el, { code }) => {
    const widget = createWidget(el, code)
    return { update: (next) => widget.setSource(next), destroy: () => widget.unmount() }
  },
})
```

- `mount(el, { code, language, editable, setCode })` gibt ein Handle `{ update?, destroy? }` oder eine Aufräumfunktion zurück. Gerendertes Markdown ist schreibgeschützt: `editable` ist `false`, `setCode` tut nichts.
- Ändert sich die Quelle und der Block bleibt an seiner Stelle, lebt das Widget weiter und erhält die neue Quelle über `update`; ohne `update` wird es neu gemountet. `destroy` läuft, wenn der Block verschwindet oder UidMarkdown ausgehängt wird.
- Der Vertrag ist derselbe wie bei den Live-Blöcken des WYSIWYG-Editors (`@dskripchenko/wysiwyg`): Ein einmal registrierter Renderer bedient beide.

## Der Renderer als Funktion

Auch `renderMarkdown(source, options)` und `splitMarkdown(source)` werden exportiert — für eine Vorschau außerhalb einer Komponente oder serverseitig. Optionen: `slugger`, `onHeading`, `linkBase`, `stripMdExtension`, `imageBase`, `internalLinksInPlace`, `calloutTitles`.

## Theming

`--uid-markdown-color`, `--uid-markdown-muted`, `--uid-markdown-link`, `--uid-markdown-border`, `--uid-markdown-sunken`, `--uid-markdown-font-size`, `--uid-markdown-line-height`, `--uid-markdown-toc-width` — alle an Theme-Tokens gebunden, das dunkle Theme braucht nichts zusätzlich.
