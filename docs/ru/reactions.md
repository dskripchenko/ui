# Реакции, эмодзи и присутствие

Три части для экранов вроде чата: реакции под сообщением, выбор эмодзи и метка присутствия на аватаре.

## `UidReactions`

Пилюли «эмодзи · число» и «+» в конце. Своя реакция нажата (`aria-pressed`); её доступное имя — эмодзи, число и кто (`👍 3: вы, Боб и Илья`), тултип — кто поставил.

```vue
<UidReactions
  :reactions="[{ emoji: '👍', count: 3, mine: true, who: 'вы, Боб и Илья' }]"
  :max="20"
  @toggle="(emoji) => react(emoji)"
  @add="(button) => openPicker(button)"
/>
```

Свойства: `reactions` (`emoji`, `count`, `mine`, `who`), `max` (разных эмодзи; на пределе «+» выключен с тултипом), `readonly`, `touch` (пилюли 32 в строках 44). События: `toggle(emoji)`, `add(anchor)`. Без реакций ничего не рисуется.

## `UidEmojiPicker`

Панель-диалог: поиск (фокус остаётся в поле, активная ячейка — его `aria-activedescendant`), вкладки категорий, сетка по 8, «Недавние» первыми, внизу — название эмодзи и оттенок кожи (radiogroup из шести). ↑↓←→ — выбор, ↵ — поставить, Esc — закрыть. Поповер вокруг — ваш (`usePopover`), на телефоне — нижняя шторка с `touch`.

```vue
<UidEmojiPicker v-model:skin-tone="tone" :recent="recent" @select="react" @close="close" />
```

Свойства: `recent`, `label`, `touch`, `autofocus`; `v-model:skinTone` (0 — без оттенка, 1…5). События: `select(emoji)` (с оттенком), `close`.

Данные — эмодзи Unicode 15.1 с названиями и ключевыми словами CLDR по-русски и по-английски — грузятся при первом открытии отдельным чанком (около 40 КБ в gzip); язык берётся из `code` локали. `loadEmoji`, `searchEmoji` и `withTone` экспортируются. Источник — `emoji-test.txt` и аннотации CLDR Unicode по лицензии Unicode v3; пересборка — `scripts/emoji/build.mjs`.

## Присутствие на `UidAvatar`

`presence`: `online` (залитая точка), `away` (кольцо), `dnd` (точка с чертой), `call` (кольцо с точкой), `offline` (серое кольцо) — форма и цвет вместе. В доступное имя добавляется состояние: «Мария Соколова, не беспокоить». Обводка метки — `--uid-avatar-presence-ring` (по умолчанию фон страницы).

```vue
<UidAvatar name="Мария Соколова" presence="dnd" size="sm" />
```
