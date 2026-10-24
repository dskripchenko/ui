# Markdown

`UidMarkdown` rendert ein Markdown-Dokument ohne Abhängigkeiten: Überschriften mit Ankern, Hervorhebungen, Links, Bilder, (verschachtelte) Listen, Tabellen mit Ausrichtung, Zitate, Hinweisboxen und Code. Codeblöcke der obersten Ebene zeichnet `UidCode` (Hervorhebung, Kopier-Button).

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

## Der Renderer als Funktion

Auch `renderMarkdown(source, options)` und `splitMarkdown(source)` werden exportiert — für eine Vorschau außerhalb einer Komponente oder serverseitig. Optionen: `slugger`, `onHeading`, `linkBase`, `stripMdExtension`, `imageBase`, `internalLinksInPlace`, `calloutTitles`.

## Theming

`--uid-markdown-color`, `--uid-markdown-muted`, `--uid-markdown-link`, `--uid-markdown-border`, `--uid-markdown-sunken`, `--uid-markdown-font-size`, `--uid-markdown-line-height`, `--uid-markdown-toc-width` — alle an Theme-Tokens gebunden, das dunkle Theme braucht nichts zusätzlich.
