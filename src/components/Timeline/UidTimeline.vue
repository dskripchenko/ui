<script setup lang="ts">
import './UidTimeline.css'

export interface UidTimelineProps {
  alternate?: boolean
}

withDefaults(defineProps<UidTimelineProps>(), {
  alternate: false,
})

defineSlots<{
  default?(): unknown
}>()
</script>

<template>
  <ol
    class="uid-timeline"
    :class="{ 'uid-timeline--alternate': alternate }"
  >
    <slot />
  </ol>
</template>
