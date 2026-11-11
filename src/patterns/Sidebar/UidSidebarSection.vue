<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { usePopover } from '../../composables/usePopover.js'
import { SIDEBAR_COLLAPSED } from './context.js'

export interface UidSidebarSectionProps {
  /** The section's name, upper case in the head. */
  title: string
  /** A short summary after the title, e.g. "4 new". */
  summary?: string
  /** A collapsed sidebar: the number on the section's icon. */
  count?: number
  /** A collapsed sidebar: mentions — the number turns danger. */
  mentions?: number
  /** The head folds the section. */
  collapsible?: boolean
}

const props = withDefaults(defineProps<UidSidebarSectionProps>(), {
  summary: undefined,
  count: 0,
  mentions: 0,
  collapsible: true,
})

/** Open or folded; the app may keep it. */
const open = defineModel<boolean>('open', { default: true })

defineSlots<{
  default(): unknown
  /** Buttons on the right of the head: add, settings. */
  actions?(): unknown
  /** A collapsed sidebar: the section's icon. */
  icon?(): unknown
}>()

const collapsed = inject(SIDEBAR_COLLAPSED, computed(() => false))
const bodyId = useId()

// A collapsed sidebar: the section is an icon, and opens as a flyout on its right.
const flyout = ref(false)
const anchor = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const { floatingStyle, update } = usePopover(anchor, panel, { placement: 'right', offset: 8 })
const badge = computed(() => (props.mentions > 0 ? props.mentions : props.count))

async function toggleFlyout(): Promise<void> {
  flyout.value = !flyout.value
  if (flyout.value) {
    await nextTick()
    update()
  }
}

function outside(event: MouseEvent): void {
  const target = event.target as Node
  if (!flyout.value || anchor.value?.contains(target) || panel.value?.contains(target)) return
  flyout.value = false
}

function escape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && flyout.value) {
    flyout.value = false
    anchor.value?.focus()
  }
}

// A choice inside the flyout closes it.
function chose(event: MouseEvent): void {
  if ((event.target as HTMLElement).closest('a, button')) flyout.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', outside)
  document.addEventListener('keydown', escape)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', outside)
  document.removeEventListener('keydown', escape)
})
</script>

<template>
  <div
    v-if="collapsed"
    class="uid-sidebar-section uid-sidebar-section--rail"
  >
    <button
      ref="anchor"
      type="button"
      class="uid-sidebar-section__rail"
      :class="{ 'uid-sidebar-section__rail--open': flyout }"
      :aria-label="summary ? `${title}, ${summary}` : title"
      :title="title"
      :aria-expanded="flyout"
      aria-haspopup="dialog"
      @click="toggleFlyout"
    >
      <slot name="icon" />
      <span
        v-if="badge > 0"
        class="uid-sidebar-section__rail-count"
        :class="{ 'uid-sidebar-section__rail-count--mention': mentions > 0 }"
        aria-hidden="true"
      >{{ badge > 99 ? '99+' : badge }}</span>
    </button>
    <Teleport to="body">
      <div
        v-if="flyout"
        ref="panel"
        class="uid-sidebar-section__flyout uid-pattern-sidebar"
        role="dialog"
        :aria-label="title"
        :style="floatingStyle"
        @click="chose"
      >
        <div class="uid-sidebar-section__head">
          <span class="uid-sidebar-section__title">{{ title }}</span>
          <span
            v-if="summary"
            class="uid-sidebar-section__summary"
          >{{ summary }}</span>
          <span
            v-if="$slots.actions"
            class="uid-sidebar-section__actions"
          ><slot name="actions" /></span>
        </div>
        <slot />
      </div>
    </Teleport>
  </div>
  <section
    v-else
    class="uid-sidebar-section"
    :class="{ 'uid-sidebar-section--folded': !open }"
    :aria-label="title"
  >
    <div class="uid-sidebar-section__head">
      <button
        v-if="collapsible"
        type="button"
        class="uid-sidebar-section__toggle"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="open = !open"
      >
        <ChevronDown
          :size="12"
          class="uid-sidebar-section__chevron"
          aria-hidden="true"
        />
        <span class="uid-sidebar-section__title">{{ title }}</span>
        <span
          v-if="summary"
          class="uid-sidebar-section__summary"
        >{{ summary }}</span>
      </button>
      <span
        v-else
        class="uid-sidebar-section__toggle"
      >
        <span class="uid-sidebar-section__title">{{ title }}</span>
        <span
          v-if="summary"
          class="uid-sidebar-section__summary"
        >{{ summary }}</span>
      </span>
      <span
        v-if="$slots.actions"
        class="uid-sidebar-section__actions"
      ><slot name="actions" /></span>
    </div>
    <div
      v-show="open"
      :id="bodyId"
      class="uid-sidebar-section__body"
    >
      <slot />
    </div>
  </section>
</template>
