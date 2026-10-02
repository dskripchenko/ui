<script setup lang="ts">
import './UidDrawer.css'
import { onBeforeUnmount, ref, watch, nextTick, useId } from 'vue'
import { X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useFocusTrap } from '../../composables/useFocusTrap.js'
import { useScrollLock } from '../../composables/useScrollLock.js'
import { useOverlayStack } from '../../composables/useOverlayStack.js'
import { useLocale } from '../../composables/useLocale.js'

const locale = useLocale()

export interface UidDrawerProps {
  title?: string
  side?: 'right' | 'left' | 'top' | 'bottom'
  closeOnOverlay?: boolean
  /** Close on the Escape key (default). */
  closeOnEsc?: boolean
  hideClose?: boolean
  width?: string
  height?: string
}

const model = defineModel<boolean>({ default: false })
const props = withDefaults(defineProps<UidDrawerProps>(), {
  title: undefined,
  side: 'right',
  closeOnOverlay: true,
  closeOnEsc: true,
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
const layer = useOverlayStack()
const { lock, unlock } = useScrollLock()

function close(): void {
  model.value = false
  emit('close')
}

function onOverlayClick(): void {
  if (props.closeOnOverlay) close()
}

function onEscape(event: KeyboardEvent): void {
  // Only the top layer answers, and not to an Escape a picker, a menu or a
  // nested layer inside it has already handled.
  if (event.key !== 'Escape' || event.defaultPrevented || !layer.isTop()) return
  if (props.closeOnEsc) {
    event.preventDefault()
    close()
  }
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
            width: side === 'left' || side === 'right' ? width : undefined,
            height: side === 'top' || side === 'bottom' ? height : undefined,
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
              :aria-label="locale.drawer.close"
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
