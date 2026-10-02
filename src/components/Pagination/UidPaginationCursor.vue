<script setup lang="ts">
import './UidPagination.css'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'


export interface UidPaginationCursorProps {
  hasPrev?: boolean
  hasNext?: boolean
  prevLabel?: string
  nextLabel?: string
}

withDefaults(defineProps<UidPaginationCursorProps>(), {
  hasPrev: false,
  hasNext: false,
  prevLabel: undefined,
  nextLabel: undefined,
})

const uidLocale = useLocale()

const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <nav
    class="uid-pagination uid-pagination--cursor"
    :aria-label="uidLocale.pagination.cursorNav"
  >
    <button
      type="button"
      class="uid-pagination__btn uid-pagination__btn--nav uid-pagination__btn--labeled"
      :disabled="!hasPrev"
      :aria-label="prevLabel ?? uidLocale.pagination.back"
      @click="emit('prev')"
    >
      <UidIcon
        :icon="ChevronLeft"
        :size="16"
      />
      {{ prevLabel ?? uidLocale.pagination.back }}
    </button>

    <button
      type="button"
      class="uid-pagination__btn uid-pagination__btn--nav uid-pagination__btn--labeled"
      :disabled="!hasNext"
      :aria-label="nextLabel ?? uidLocale.pagination.forward"
      @click="emit('next')"
    >
      {{ nextLabel ?? uidLocale.pagination.forward }}
      <UidIcon
        :icon="ChevronRight"
        :size="16"
      />
    </button>
  </nav>
</template>
