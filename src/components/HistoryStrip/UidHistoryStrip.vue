<script setup lang="ts">
import './UidHistoryStrip.css'

/** One cell of the strip: a run, a check, a day. */
export interface HistoryCell {
  key: string | number
  tone: 'success' | 'warning' | 'danger' | 'none'
  /** Shown on hover: what this cell stands for. */
  title?: string
}

export interface UidHistoryStripProps {
  /** Cells, the oldest first. */
  cells: HistoryCell[]
  /** What the strip says as a whole, for screen readers. */
  label: string
  /**
   * `fixed`: narrow cells of one width, aligned to the right (the newest
   * end); `fill`: the cells share the whole width.
   */
  fit?: 'fixed' | 'fill'
  /** Height in pixels. */
  height?: number
}

withDefaults(defineProps<UidHistoryStripProps>(), {
  fit: 'fixed',
  height: 16,
})
</script>

<template>
  <div
    class="uid-history-strip"
    :class="`uid-history-strip--${fit}`"
    :style="{ height: `${height}px` }"
    role="img"
    :aria-label="label"
  >
    <span
      v-for="cell in cells"
      :key="cell.key"
      class="uid-history-strip__cell"
      :class="`uid-history-strip__cell--${cell.tone}`"
      :title="cell.title"
    />
  </div>
</template>
