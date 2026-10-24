<script setup lang="ts">
import './UidMarkdown.css'
import { computed, nextTick, onMounted, shallowRef, watch } from 'vue'
import UidCode from '../Code/UidCode.vue'
import { useLocale } from '../../composables/useLocale.js'
import {
  createSlugger,
  renderMarkdown,
  splitMarkdown,
  type MarkdownHeading,
  type UidMarkdownCalloutKind,
} from './markdown.js'
import {
  useMarkdownBlockRenderers,
  type UidMarkdownBlockRenderer,
  type UidMarkdownBlockResult,
} from './blockRenderers.js'

export interface UidMarkdownProps {
  /** The markdown text. */
  source?: string
  /** Shows a table of contents built from the headings. */
  toc?: boolean
  /** Deepest heading level in the table of contents, 2 to 6. */
  tocDepth?: number
  /** Title of the table of contents; the locale's by default. */
  tocLabel?: string
  /** The base relative links resolve against. */
  linkBase?: string
  /** Drops a trailing `.md` from relative links; on by default when `linkBase` is set. */
  stripMdExtension?: boolean
  /** The base relative image paths resolve against. */
  imageBase?: string
  /**
   * Opens relative and anchor links in the same tab (the default). Off, every
   * link but an anchor opens in a new tab — for a preview next to a form,
   * where leaving the page would lose the input.
   */
  internalLinksInPlace?: boolean
  /** Callout titles; override the locale's, kind by kind. */
  calloutTitles?: Partial<Record<UidMarkdownCalloutKind, string>>
  /** Renderers for fenced blocks by language; override the provided ones. */
  blockRenderers?: Record<string, UidMarkdownBlockRenderer>
}

const props = withDefaults(defineProps<UidMarkdownProps>(), {
  source: '',
  toc: false,
  tocDepth: 3,
  tocLabel: undefined,
  linkBase: undefined,
  stripMdExtension: undefined,
  imageBase: undefined,
  internalLinksInPlace: true,
  calloutTitles: undefined,
  blockRenderers: undefined,
})

const locale = useLocale()
const injected = useMarkdownBlockRenderers()

// Fence languages UidCode knows under another name.
const LANGUAGE_ALIASES: Record<string, string> = {
  blade: 'html',
  console: 'bash',
  env: 'bash',
  dotenv: 'bash',
  terminal: 'bash',
  ps1: 'bash',
  jsonc: 'json',
  json5: 'json',
}

type Block =
  | { kind: 'html'; html: string }
  | { kind: 'code'; code: string; language: string }
  | {
      kind: 'custom'
      code: string
      language: string
      state: 'pending' | 'done' | 'error'
      html?: string
      error?: string
    }

const blocks = shallowRef<Block[]>([])
const headings = shallowRef<MarkdownHeading[]>([])
// Bumped on every re-render: results of an outdated render are dropped.
let generation = 0

function settle(index: number, gen: number, result: UidMarkdownBlockResult): void {
  if (gen !== generation) return
  const current = blocks.value[index]
  if (!current || current.kind !== 'custom') return
  const next = blocks.value.slice()
  next[index] =
    result.error !== undefined || result.html === undefined
      ? { ...current, state: 'error', error: result.error ?? '' }
      : { ...current, state: 'done', html: result.html }
  blocks.value = next
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function render(): void {
  const gen = ++generation
  const renderers = { ...injected, ...(props.blockRenderers ?? {}) }
  const slugger = createSlugger()
  const found: MarkdownHeading[] = []
  const titles = { ...locale.value.markdown, ...(props.calloutTitles ?? {}) }
  const pending: { index: number; run: () => UidMarkdownBlockResult | Promise<UidMarkdownBlockResult> }[] = []
  let codeIndex = 0

  const out: Block[] = splitMarkdown(props.source).map((segment, index) => {
    if (segment.kind === 'text') {
      return {
        kind: 'html',
        html: renderMarkdown(segment.source, {
          slugger,
          onHeading: (h) => found.push(h),
          linkBase: props.linkBase ?? null,
          stripMdExtension: props.stripMdExtension ?? !!props.linkBase,
          imageBase: props.imageBase ?? null,
          internalLinksInPlace: props.internalLinksInPlace,
          calloutTitles: titles,
        }),
      }
    }
    const renderer = segment.language ? renderers[segment.language] : undefined
    const ctx = { language: segment.language, index: codeIndex++ }
    if (!renderer) {
      return { kind: 'code', code: segment.code, language: LANGUAGE_ALIASES[segment.language] ?? segment.language }
    }
    pending.push({ index, run: () => renderer(segment.code, ctx) })
    return { kind: 'custom', code: segment.code, language: segment.language, state: 'pending' }
  })

  blocks.value = out
  headings.value = found

  for (const { index, run } of pending) {
    let result: UidMarkdownBlockResult | Promise<UidMarkdownBlockResult>
    try {
      result = run()
    } catch (e) {
      settle(index, gen, { error: errorMessage(e) })
      continue
    }
    if (result && typeof (result as Promise<UidMarkdownBlockResult>).then === 'function') {
      ;(result as Promise<UidMarkdownBlockResult>).then(
        (r) => settle(index, gen, r ?? { error: '' }),
        (e: unknown) => settle(index, gen, { error: errorMessage(e) }),
      )
    } else {
      settle(index, gen, (result as UidMarkdownBlockResult) ?? { error: '' })
    }
  }
}

watch(
  () =>
    [
      props.source,
      props.linkBase,
      props.stripMdExtension,
      props.imageBase,
      props.internalLinksInPlace,
      props.calloutTitles,
      props.blockRenderers,
      locale.value,
    ] as const,
  render,
  { immediate: true },
)

const depth = computed(() => Math.min(6, Math.max(2, props.tocDepth)))
const tocTitle = computed(() => props.tocLabel || locale.value.markdown.toc)
const tocItems = computed(() =>
  props.toc ? headings.value.filter((h) => h.level >= 2 && h.level <= depth.value) : [],
)

const root = shallowRef<HTMLElement | null>(null)

function scrollToId(id: string, smooth = true): boolean {
  if (!id || !root.value) return false
  const target = Array.from(root.value.querySelectorAll<HTMLElement>('[id]')).find((el) => el.id === id)
  if (!target) return false
  target.scrollIntoView?.({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  return true
}

function scrollAndRemember(id: string): void {
  if (scrollToId(id) && typeof history !== 'undefined') {
    history.replaceState(history.state, '', `#${encodeURIComponent(id)}`)
  }
}

// Anchors scroll within the document instead of jumping.
function onContentClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  const anchor = (event.target as HTMLElement | null)?.closest?.('a')
  const href = anchor?.getAttribute('href') ?? ''
  if (!href.startsWith('#')) return
  event.preventDefault()
  scrollAndRemember(decodeURIComponent(href.slice(1)))
}

onMounted(() => {
  if (typeof window === 'undefined' || !window.location.hash) return
  void nextTick(() => scrollToId(decodeURIComponent(window.location.hash.slice(1)), false))
})
</script>

<template>
  <div
    ref="root"
    class="uid-markdown"
    :class="{ 'uid-markdown--toc': tocItems.length > 0 }"
  >
    <!-- eslint-disable vue/no-v-html -- renderMarkdown escapes the source before adding markup; block html is the renderer's responsibility (see UidMarkdownBlockResult) -->
    <div
      class="uid-markdown__body"
      @click="onContentClick"
    >
      <template
        v-for="(block, idx) in blocks"
        :key="idx"
      >
        <div
          v-if="block.kind === 'html'"
          class="uid-markdown__html"
          v-html="block.html"
        />
        <UidCode
          v-else-if="block.kind === 'code'"
          class="uid-markdown__code"
          :code="block.code"
          :language="block.language || undefined"
          copy
        />
        <div
          v-else-if="block.state === 'done'"
          class="uid-markdown__block"
          :data-language="block.language"
          v-html="block.html"
        />
        <div
          v-else-if="block.state === 'pending'"
          class="uid-markdown__block uid-markdown__block--pending"
          :data-language="block.language"
          aria-busy="true"
        >
          {{ locale.markdown.blockPending }}
        </div>
        <div
          v-else
          class="uid-markdown__block-error"
          :data-language="block.language"
        >
          <p
            class="uid-markdown__block-error-message"
            role="alert"
          >
            {{ block.error ? `${locale.markdown.blockError}: ${block.error}` : locale.markdown.blockError }}
          </p>
          <UidCode
            class="uid-markdown__code"
            :code="block.code"
            :language="block.language || undefined"
            copy
          />
        </div>
      </template>
    </div>
    <!-- eslint-enable vue/no-v-html -->
    <nav
      v-if="tocItems.length > 0"
      class="uid-markdown__toc"
      :aria-label="tocTitle"
    >
      <div class="uid-markdown__toc-title">
        {{ tocTitle }}
      </div>
      <ul>
        <li
          v-for="item in tocItems"
          :key="item.id"
          class="uid-markdown__toc-item"
          :class="`uid-markdown__toc-item--l${item.level}`"
        >
          <a
            :href="`#${item.id}`"
            @click.prevent="scrollAndRemember(item.id)"
          >{{ item.text }}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>
