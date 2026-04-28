<script setup lang="ts">
import { computed } from 'vue'
import { provideLocale } from '../../composables/useLocale.js'
import type { UidLocale, UidPartialLocale } from '../../locales/types.js'

export interface UidLocaleProviderProps {
  locale?: UidLocale | UidPartialLocale
}

const props = defineProps<UidLocaleProviderProps>()

defineSlots<{ default(): unknown }>()

provideLocale(computed(() => props.locale))
</script>

<template>
  <slot />
</template>
