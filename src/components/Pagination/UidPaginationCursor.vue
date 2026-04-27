<script setup lang="ts">
import './UidPagination.css'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UidPaginationCursorProps {
  hasPrev?: boolean
  hasNext?: boolean
  prevLabel?: string
  nextLabel?: string
}

withDefaults(defineProps<UidPaginationCursorProps>(), {
  hasPrev: false,
  hasNext: false,
  prevLabel: 'Назад',
  nextLabel: 'Вперёд',
})

const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <nav
    class="uid-pagination uid-pagination--cursor"
    aria-label="Навигация по страницам"
  >
    <button
      type="button"
      class="uid-pagination__btn uid-pagination__btn--nav uid-pagination__btn--labeled"
      :disabled="!hasPrev"
      :aria-label="prevLabel"
      @click="emit('prev')"
    >
      <UidIcon
        :icon="ChevronLeft"
        :size="16"
      />
      {{ prevLabel }}
    </button>

    <button
      type="button"
      class="uid-pagination__btn uid-pagination__btn--nav uid-pagination__btn--labeled"
      :disabled="!hasNext"
      :aria-label="nextLabel"
      @click="emit('next')"
    >
      {{ nextLabel }}
      <UidIcon
        :icon="ChevronRight"
        :size="16"
      />
    </button>
  </nav>
</template>
