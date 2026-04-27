<script setup lang="ts">
import './UidPagination.css'
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UidPaginationProps {
  total: number
  perPage?: number
  siblingCount?: number
  showEdges?: boolean
}

const model = defineModel<number>({ default: 1 })

const props = withDefaults(defineProps<UidPaginationProps>(), {
  perPage: 10,
  siblingCount: 1,
  showEdges: true,
})

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))

type PageItem = number | '...'

function buildRange(current: number, total: number, siblings: number): PageItem[] {
  if (total <= 1) return [1]
  if (total <= 5 + siblings * 2) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const left = Math.max(2, current - siblings)
  const right = Math.min(total - 1, current + siblings)

  const pages: PageItem[] = [1]
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < total - 1) pages.push('...')
  pages.push(total)

  return pages
}

const pages = computed<PageItem[]>(() =>
  buildRange(model.value, totalPages.value, props.siblingCount),
)

function goTo(page: number): void {
  if (page < 1 || page > totalPages.value || page === model.value) return
  model.value = page
}
</script>

<template>
  <nav
    class="uid-pagination"
    aria-label="Пагинация"
  >
    <button
      type="button"
      class="uid-pagination__btn uid-pagination__btn--nav"
      :disabled="model <= 1"
      aria-label="Предыдущая страница"
      @click="goTo(model - 1)"
    >
      <UidIcon
        :icon="ChevronLeft"
        :size="16"
      />
    </button>

    <template
      v-for="(page, idx) in pages"
      :key="`${idx}-${page}`"
    >
      <span
        v-if="page === '...'"
        class="uid-pagination__ellipsis"
        aria-hidden="true"
      >
        …
      </span>
      <button
        v-else
        type="button"
        class="uid-pagination__btn"
        :class="{ 'uid-pagination__btn--active': page === model }"
        :aria-label="`Страница ${page}`"
        :aria-current="page === model ? 'page' : undefined"
        @click="goTo(page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      type="button"
      class="uid-pagination__btn uid-pagination__btn--nav"
      :disabled="model >= totalPages"
      aria-label="Следующая страница"
      @click="goTo(model + 1)"
    >
      <UidIcon
        :icon="ChevronRight"
        :size="16"
      />
    </button>
  </nav>
</template>
