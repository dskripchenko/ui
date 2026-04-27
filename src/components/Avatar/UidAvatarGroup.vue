<script setup lang="ts">
import { computed, useSlots, type VNode } from 'vue'

export interface UidAvatarGroupProps {
  max?: number
}

const props = withDefaults(defineProps<UidAvatarGroupProps>(), {
  max: undefined,
})

const slots = useSlots()

const allChildren = computed<VNode[]>(() =>
  slots.default?.()?.flatMap(vnode =>
    vnode.type === Symbol.for('v-fgt') ? (vnode.children as VNode[]) : [vnode],
  ) ?? [],
)

const visible = computed<VNode[]>(() =>
  props.max !== undefined ? allChildren.value.slice(0, props.max) : allChildren.value,
)

const overflow = computed<number>(() =>
  props.max !== undefined ? Math.max(0, allChildren.value.length - props.max) : 0,
)
</script>

<template>
  <div class="uid-avatar-group">
    <component
      :is="vnode"
      v-for="(vnode, idx) in visible"
      :key="idx"
    />
    <span
      v-if="overflow > 0"
      class="uid-avatar uid-avatar--md uid-avatar--circle uid-avatar-group__overflow"
      :aria-label="`Ещё ${overflow}`"
      role="img"
    >
      +{{ overflow }}
    </span>
  </div>
</template>
