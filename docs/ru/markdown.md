# Markdown

`UidMarkdown` рисует markdown-документ без зависимостей: заголовки с якорями, выделение, ссылки, картинки, списки (с вложенностью), таблицы с выравниванием, цитаты, врезки и код. Блоки кода верхнего уровня рисует `UidCode` (подсветка, кнопка копирования).

```vue
<UidMarkdown :source="text" toc link-base="/docs/ru/" />
```

| Prop | Тип | По умолчанию | |
|---|---|---|---|
| `source` | `string` | `''` | Текст в markdown |
| `toc` | `boolean` | `false` | Оглавление по заголовкам (справа, на узком экране — сверху) |
| `tocDepth` | `2`–`6` | `3` | Самый глубокий уровень заголовков в оглавлении |
| `linkBase` | `string` | — | Относительные ссылки разрешаются от него |
| `tocLabel` | `string` | из локали | Заголовок оглавления |
| `stripMdExtension` | `boolean` | `true` при `linkBase` | Отбрасывать `.md` в конце относительных ссылок |
| `imageBase` | `string` | — | Относительные пути картинок разрешаются от него |
| `internalLinksInPlace` | `boolean` | `true` | Относительные ссылки открываются в той же вкладке; выключено — в новой (например, превью рядом с формой) |
| `calloutTitles` | `Partial<Record<kind, string>>` | из локали | Заголовки врезок (`note`, `tip`, `important`, `warning`, `caution`) |
| `blockRenderers` | `Record<string, UidMarkdownBlockRenderer>` | — | Рендереры блоков кода по языку |

## Безопасность

Исходник экранируется **до** того, как появляется разметка: HTML в тексте показывается как текст и никогда не выполняется. Ссылки и картинки принимают только `http(s)`, `mailto`, относительные адреса и якоря — `javascript:`, `data:` и прочие схемы остаются текстом.

## Врезки

```md
> [!NOTE]
> Стиль GitHub: строка-маркер заменяется заголовком из локали.

> **Внимание** Жирный стиль: текст остаётся как написан.
```

Виды: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`; русские маркеры (`Примечание`, `Совет`, `Важно`, `Внимание`, `Осторожно`) тоже распознаются. Заголовки врезок и подпись оглавления берутся из локали (`markdown.*`, см. [i18n](./i18n.md)).

## Рендереры блоков

Блок кода, для языка которого есть рендерер, рисуется им вместо `UidCode`. Так подключаются диаграммы, графики, формулы — а кит о них ничего не знает.

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

// В setup корневого компонента — им пользуются все UidMarkdown ниже:
provideMarkdownBlockRenderers({ mermaid })
```

- Рендерер получает код и `{ language, index }` (номер среди блоков кода документа).
- Возвращает `{ html }` или `{ error }` — сразу или промисом. Пока промис не завершился, на месте блока заглушка; результат устаревшей отрисовки (исходник успел поменяться) отбрасывается.
- При `error`, исключении или отклонённом промисе блок показывается как код с сообщением (`role="alert"`).
- **`html` вставляется как есть.** За его безопасность отвечает рендерер: возвращайте только разметку, собранную вами, с экранированным пользовательским текстом.
- Prop `blockRenderers` важнее переданных через provide — по каждому языку отдельно. На всё приложение: `app.provide(markdownBlockRenderersKey, renderers)`.

### Живые блоки

Вместо `html` рендерер может вернуть `mount` — в элемент блока монтируется виджет (консоль API, график с элементами управления):

```ts
const api: UidMarkdownBlockRenderer = () => ({
  mount: (el, { code }) => {
    const widget = createWidget(el, code)
    return { update: (next) => widget.setSource(next), destroy: () => widget.unmount() }
  },
})
```

- `mount(el, { code, language, editable, setCode })` возвращает handle `{ update?, destroy? }` или функцию очистки. Отрисованный markdown только для чтения: `editable` равно `false`, `setCode` ничего не делает.
- Если исходник изменился, а блок остался на месте, виджет продолжает жить и получает новый исходник через `update`; без `update` он монтируется заново. `destroy` вызывается, когда блок исчезает или UidMarkdown размонтируется.
- Контракт тот же, что у живых блоков WYSIWYG-редактора (`@dskripchenko/wysiwyg`): один зарегистрированный рендерер обслуживает оба.

## Рендерер как функция

Экспортированы и `renderMarkdown(source, options)`, `splitMarkdown(source)` — для превью вне компонента или на сервере. Опции: `slugger`, `onHeading`, `linkBase`, `stripMdExtension`, `imageBase`, `internalLinksInPlace`, `calloutTitles`.

## Темизация

`--uid-markdown-color`, `--uid-markdown-muted`, `--uid-markdown-link`, `--uid-markdown-border`, `--uid-markdown-sunken`, `--uid-markdown-font-size`, `--uid-markdown-line-height`, `--uid-markdown-toc-width` — все привязаны к токенам темы, тёмной теме ничего дополнительно не нужно.
