<script setup lang="ts">
import './UidPagination.css'
import UidSpinner from '../Spinner/UidSpinner.vue'

export interface UidLoadMoreProps {
  loading?: boolean
  disabled?: boolean
  label?: string
}

withDefaults(defineProps<UidLoadMoreProps>(), {
  loading: false,
  disabled: false,
  label: 'Показать ещё',
})

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
      <span>{{ label }}</span>
    </button>
  </div>
</template>
