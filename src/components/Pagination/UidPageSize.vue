<script setup lang="ts">
import './UidPagination.css'
import { useLocale } from '../../composables/useLocale.js'


export interface UidPageSizeProps {
  options?: number[]
  label?: string
}

const model = defineModel<number>({ default: 10 })

withDefaults(defineProps<UidPageSizeProps>(), {
  options: () => [10, 25, 50, 100],
  label: undefined,
})

const uidLocale = useLocale()
</script>

<template>
  <div class="uid-page-size">
    <span class="uid-page-size__label">{{ label ?? uidLocale.pagination.rowsPerPage }}</span>
    <select
      class="uid-page-size__select"
      :value="model"
      @change="model = Number(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option in options"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>
