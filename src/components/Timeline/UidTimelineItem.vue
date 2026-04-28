<script setup lang="ts">
import UidIcon from '../../icons/UidIcon.vue'

export type TimelineTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'

export interface UidTimelineItemProps {
  title?: string
  description?: string
  time?: string
  tone?: TimelineTone
  icon?: unknown
}

withDefaults(defineProps<UidTimelineItemProps>(), {
  tone: 'neutral',
})

defineSlots<{
  default?(): unknown
  time?(): unknown
  icon?(): unknown
}>()
</script>

<template>
  <li
    class="uid-timeline-item"
    :class="[
      tone !== 'neutral' && `uid-timeline-item--${tone}`,
      (icon || $slots.icon) && 'uid-timeline-item--with-icon',
    ]"
  >
    <div class="uid-timeline-item__rail">
      <div class="uid-timeline-item__marker">
        <slot name="icon">
          <UidIcon
            v-if="icon"
            :icon="icon"
            :size="14"
          />
        </slot>
      </div>
      <div
        class="uid-timeline-item__line"
        aria-hidden="true"
      />
    </div>

    <div class="uid-timeline-item__content">
      <p
        v-if="time || $slots.time"
        class="uid-timeline-item__time"
      >
        <slot name="time">{{ time }}</slot>
      </p>
      <h4
        v-if="title"
        class="uid-timeline-item__title"
      >{{ title }}</h4>
      <p
        v-if="description && !$slots.default"
        class="uid-timeline-item__description"
      >{{ description }}</p>
      <div
        v-if="$slots.default"
        class="uid-timeline-item__description"
      >
        <slot />
      </div>
    </div>
  </li>
</template>
