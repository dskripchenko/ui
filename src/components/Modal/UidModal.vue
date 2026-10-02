<script setup lang="ts">
import './UidModal.css'
import { onBeforeUnmount, ref, watch, nextTick, useId } from 'vue'
import { X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useFocusTrap } from '../../composables/useFocusTrap.js'
import { useScrollLock } from '../../composables/useScrollLock.js'
import { useOverlayStack } from '../../composables/useOverlayStack.js'
import { useLocale } from '../../composables/useLocale.js'

const locale = useLocale()

export interface UidModalProps {
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlay?: boolean
  /** Close on the Escape key (default). Turn off for a dialog that must be answered. */
  closeOnEsc?: boolean
  hideClose?: boolean
}

const model = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<UidModalProps>(), {
  title: undefined,
  size: 'md',
  closeOnOverlay: true,
  closeOnEsc: true,
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
const layer = useOverlayStack()
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
    layer.push()
    lock()
    await nextTick()
    activate()
    document.addEventListener('keydown', onEscape)
  } else {
    layer.pop()
    unlock()
    deactivate()
    document.removeEventListener('keydown', onEscape)
  }
})

onBeforeUnmount(() => {
  if (!model.value) return
  layer.pop()
  unlock()
  deactivate()
  document.removeEventListener('keydown', onEscape)
})

function onEscape(event: KeyboardEvent): void {
  // Only the top layer answers, and not to an Escape a picker, a menu or a
  // nested layer inside it has already handled.
  if (event.key !== 'Escape' || event.defaultPrevented || !layer.isTop()) return
  if (props.closeOnEsc) {
    event.preventDefault()
    close()
  }
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
              :aria-label="locale.modal.close"
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
