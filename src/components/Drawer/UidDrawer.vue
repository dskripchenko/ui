<script setup lang="ts">
import './UidDrawer.css'
import { ref, watch, nextTick, useId } from 'vue'
import { X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useFocusTrap } from '../../composables/useFocusTrap.js'
import { useScrollLock } from '../../composables/useScrollLock.js'

export interface UidDrawerProps {
  title?: string
  side?: 'right' | 'left' | 'bottom'
  closeOnOverlay?: boolean
  hideClose?: boolean
  width?: string
  height?: string
}

const model = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<UidDrawerProps>(), {
  title: undefined,
  side: 'right',
  closeOnOverlay: true,
  hideClose: false,
  width: undefined,
  height: undefined,
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
const panelRef = ref<HTMLElement | null>(null)
const { activate, deactivate } = useFocusTrap(panelRef)
const { lock, unlock } = useScrollLock()

function close(): void {
  model.value = false
  emit('close')
}

function onOverlayClick(): void {
  if (props.closeOnOverlay) close()
}

function onEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
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
</script>

<template>
  <Teleport to="body">
    <Transition :name="`uid-drawer-${side}`">
      <div
        v-if="model"
        class="uid-drawer-overlay"
        @click.self="onOverlayClick"
      >
        <div
          ref="panelRef"
          class="uid-drawer"
          :class="`uid-drawer--${side}`"
          :style="{
            width: side !== 'bottom' ? width : undefined,
            height: side === 'bottom' ? height : undefined,
          }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          tabindex="-1"
        >
          <div class="uid-drawer__header">
            <slot name="header">
              <p
                v-if="title"
                :id="titleId"
                class="uid-drawer__title"
              >
                {{ title }}
              </p>
            </slot>
            <button
              v-if="!hideClose"
              type="button"
              class="uid-drawer__close"
              aria-label="Закрыть"
              @click="close"
            >
              <UidIcon
                :icon="X"
                :size="18"
              />
            </button>
          </div>

          <div class="uid-drawer__body">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="uid-drawer__footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
