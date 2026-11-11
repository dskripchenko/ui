<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import { descriptionListKey, type DescriptionListContext } from './context.js'

const locale = useLocale()

export interface UidDescriptionItemProps {
  label?: string
  /** Columns it takes; `full` — the whole row (in tiles too). */
  span?: number | 'full'
  copyable?: boolean
  copyValue?: string
}

const props = withDefaults(defineProps<UidDescriptionItemProps>(), {
  span: 1,
  copyable: false,
})

defineSlots<{
  default?(): unknown
  label?(): unknown
}>()

const ctx = inject(descriptionListKey, null) as DescriptionListContext | null
void ctx // ensure provider exists; visual styles are class-based

const itemRef = ref<HTMLElement | null>(null)
const copied = ref(false)

const itemStyle = computed(() => (props.span === 'full' ? {} : { '--uid-desc-span': props.span }))

async function onCopy(): Promise<void> {
  const text = props.copyValue ?? itemRef.value?.querySelector('.uid-description-item__value')?.textContent?.trim() ?? ''
  if (!text || !navigator?.clipboard) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    /* ignored */
  }
}
</script>

<template>
  <div
    ref="itemRef"
    class="uid-description-item"
    :class="{ 'uid-description-item--full': span === 'full' }"
    :style="itemStyle"
  >
    <dt class="uid-description-item__label">
      <slot name="label">{{ label }}</slot>
    </dt>
    <dd class="uid-description-item__value">
      <slot />
      <button
        v-if="copyable"
        type="button"
        class="uid-description-item__copy"
        :class="{ 'uid-description-item__copy--copied': copied }"
        :aria-label="copied ? locale.copy.copied : locale.copy.copy"
        @click="onCopy"
      >
        <UidIcon
          :icon="copied ? Check : Copy"
          :size="12"
        />
      </button>
    </dd>
  </div>
</template>
