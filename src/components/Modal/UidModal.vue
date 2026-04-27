<script setup lang="ts">
import './UidModal.css'
import { ref, watch, nextTick, useId } from 'vue'
import { X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useFocusTrap } from '../../composables/useFocusTrap.js'
import { useScrollLock } from '../../composables/useScrollLock.js'

export interface UidModalProps {
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
  hideClose?: boolean
}

const model = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<UidModalProps>(), {
  title: undefined,
  size: 'md',
  closeOnOverlay: true,
  hideClose: false,
})

const emit = defineEmits<{
  close: []
}>()

defineSlots<{
  default(): unknown
  header?(): unknown
  footer?(): unknown
}>()

const titleId = useId()
const dialogRef = ref<HTMLElement | null>(null)
const { activate, deactivate } = useFocusTrap(dialogRef)
const { lock, unlock } = useScrollLock()

function close(): void {
  model.value = false
  emit('close')
}

function onOverlayClick(): void {
  if (props.closeOnOverlay) close()
}

watch(model, async (open) => {
  if (open) {
    lock()
    await nextTick()
    activate()
    document.addEventListener('keydown', onEscape)
  } else {
    unlock()
    deactivate()
    document.removeEventListener('keydown', onEscape)
  }
})

function onEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="uid-modal">
      <div
        v-if="model"
        class="uid-modal-overlay"
        @click.self="onOverlayClick"
      >
        <div
          ref="dialogRef"
          class="uid-modal"
          :class="`uid-modal--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          tabindex="-1"
        >
          <div class="uid-modal__header">
            <slot name="header">
              <p
                v-if="title"
                :id="titleId"
                class="uid-modal__title"
              >
                {{ title }}
              </p>
            </slot>
            <button
              v-if="!hideClose"
              type="button"
              class="uid-modal__close"
              aria-label="Закрыть"
              @click="close"
            >
              <UidIcon
                :icon="X"
                :size="18"
              />
            </button>
          </div>

          <div class="uid-modal__body">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="uid-modal__footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
