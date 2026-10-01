<script setup lang="ts">
import './UidImage.css'
import { computed, ref, watch } from 'vue'
import { ImageOff } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidModal from '../Modal/UidModal.vue'
import { useLocale } from '../../composables/useLocale.js'

export type UidImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'

export interface UidImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  fit?: UidImageFit
  /** Native lazy loading (`loading="lazy"`). */
  lazy?: boolean
  /** Shown when `src` fails to load. */
  fallbackSrc?: string
  /** Corner radius: a CSS value or a token name (`sm`, `md`, `lg`, `full`). */
  radius?: string
  /** Click opens the image in a full-size dialog. */
  preview?: boolean
  /** Larger image for the preview dialog; defaults to `src`. */
  previewSrc?: string
}

const props = withDefaults(defineProps<UidImageProps>(), {
  width: undefined,
  height: undefined,
  fit: 'cover',
  lazy: true,
  fallbackSrc: undefined,
  radius: undefined,
  preview: false,
  previewSrc: undefined,
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

defineSlots<{
  fallback?(): unknown
  placeholder?(): unknown
}>()

const locale = useLocale()

type Status = 'loading' | 'loaded' | 'error'

const status = ref<Status>('loading')
const usingFallback = ref(false)
const previewOpen = ref(false)

watch(
  () => props.src,
  () => {
    status.value = 'loading'
    usingFallback.value = false
  },
)

const currentSrc = computed(() =>
  usingFallback.value && props.fallbackSrc ? props.fallbackSrc : props.src,
)

const canPreview = computed(() => props.preview && status.value !== 'error')

const RADIUS_TOKENS = ['none', 'sm', 'md', 'lg', 'full']

function toSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const rootStyle = computed(() => {
  const radius = props.radius
  return {
    width: toSize(props.width),
    height: toSize(props.height),
    '--uid-image-radius': radius
      ? RADIUS_TOKENS.includes(radius) ? `var(--uid-radius-${radius})` : radius
      : undefined,
    '--uid-image-fit': props.fit,
  }
})

function onLoad(event: Event): void {
  status.value = 'loaded'
  emit('load', event)
}

function onError(event: Event): void {
  if (props.fallbackSrc && !usingFallback.value) {
    usingFallback.value = true
    emit('error', event)
    return
  }
  status.value = 'error'
  if (!usingFallback.value) emit('error', event)
}

function openPreview(): void {
  if (canPreview.value) previewOpen.value = true
}
</script>

<template>
  <div
    class="uid-image"
    :class="{
      'uid-image--preview': canPreview,
    }"
    :data-status="status"
    :style="rootStyle"
  >
    <div
      v-if="status === 'error'"
      class="uid-image__fallback"
      role="img"
      :aria-label="alt || (locale.image?.error ?? 'Image failed to load')"
    >
      <slot name="fallback">
        <UidIcon
          :icon="ImageOff"
          :size="24"
        />
      </slot>
    </div>
    <template v-else>
      <div
        v-if="status === 'loading'"
        class="uid-image__placeholder"
        aria-hidden="true"
      >
        <slot name="placeholder" />
      </div>
      <button
        v-if="canPreview"
        type="button"
        class="uid-image__trigger"
        :aria-label="`${locale.image?.preview ?? 'Open preview'}: ${alt}`"
        aria-haspopup="dialog"
        @click="openPreview"
      >
        <img
          class="uid-image__img"
          :src="currentSrc"
          :alt="alt"
          :loading="lazy ? 'lazy' : 'eager'"
          decoding="async"
          @load="onLoad"
          @error="onError"
        >
      </button>
      <img
        v-else
        class="uid-image__img"
        :src="currentSrc"
        :alt="alt"
        :loading="lazy ? 'lazy' : 'eager'"
        decoding="async"
        @load="onLoad"
        @error="onError"
      >
    </template>

    <UidModal
      v-if="preview"
      v-model="previewOpen"
      size="full"
      :title="alt"
    >
      <div class="uid-image__preview">
        <img
          class="uid-image__preview-img"
          :src="previewSrc || currentSrc"
          :alt="alt"
        >
      </div>
    </UidModal>
  </div>
</template>
