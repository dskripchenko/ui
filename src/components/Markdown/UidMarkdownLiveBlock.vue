<script setup lang="ts">
/**
 * A live fenced block of UidMarkdown: the renderer's widget mounted into a
 * plain element. A new source goes to the widget's `update`; without one, the
 * widget is mounted again.
 */
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import type { UidMarkdownBlockMountHandle, UidMarkdownBlockResult } from './blockRenderers.js'

const props = defineProps<{
  code: string
  language: string
  mount: NonNullable<UidMarkdownBlockResult['mount']>
}>()

const el = shallowRef<HTMLElement | null>(null)
let handle: UidMarkdownBlockMountHandle | null = null

function mountWidget(): void {
  if (!el.value) return
  el.value.replaceChildren()
  const out = props.mount(el.value, {
    code: props.code,
    language: props.language,
    editable: false,
    setCode: () => {},
  })
  handle = typeof out === 'function' ? { destroy: out } : (out ?? {})
}

function unmountWidget(): void {
  handle?.destroy?.()
  handle = null
}

onMounted(mountWidget)
onBeforeUnmount(unmountWidget)

watch(
  () => props.code,
  (code) => {
    if (handle?.update) {
      handle.update(code)
      return
    }
    unmountWidget()
    mountWidget()
  },
)

watch(
  () => props.mount,
  () => {
    unmountWidget()
    mountWidget()
  },
)
</script>

<template>
  <div ref="el" />
</template>
