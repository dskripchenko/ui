<script setup lang="ts">
import './UidPagination.css'
import UidSpinner from '../Spinner/UidSpinner.vue'
import { useLocale } from '../../composables/useLocale.js'


export interface UidLoadMoreProps {
  loading?: boolean
  disabled?: boolean
  label?: string
}

withDefaults(defineProps<UidLoadMoreProps>(), {
  loading: false,
  disabled: false,
  label: undefined,
})

const uidLocale = useLocale()

const emit = defineEmits<{
  load: []
}>()
</script>

<template>
  <div class="uid-load-more">
    <button
      type="button"
      class="uid-load-more__btn"
      :disabled="disabled || loading"
      @click="emit('load')"
    >
      <UidSpinner
        v-if="loading"
        :size="'sm'"
      />
      <span>{{ label ?? uidLocale.pagination.loadMore }}</span>
    </button>
  </div>
</template>
