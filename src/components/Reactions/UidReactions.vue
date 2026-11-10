<script setup lang="ts">
import './UidReactions.css'
import { computed } from 'vue'
import { SmilePlus } from 'lucide-vue-next'
import { useLocale } from '../../composables/useLocale.js'
import UidTooltip from '../Tooltip/UidTooltip.vue'

export interface UidReaction {
  emoji: string
  count: number
  /** The viewer's own: shown pressed; pressing takes it back. */
  mine: boolean
  /** Who put it, as the tooltip and the spoken name say: "you, Bob and Ilya". */
  who: string
}

export interface UidReactionsProps {
  reactions: UidReaction[]
  /** Different emoji a message takes; at the limit «+» is off with a tooltip. */
  max?: number
  /** Nothing can be pressed: a reader who may not react. */
  readonly?: boolean
  /** Rows of 44 px for touch (pills of 32). */
  touch?: boolean
}

const props = withDefaults(defineProps<UidReactionsProps>(), {
  max: 20,
  readonly: false,
  touch: false,
})

const emit = defineEmits<{
  /** Press on a pill: put the emoji, or take one's own back. */
  toggle: [emoji: string]
  /** «+»: open the emoji picker by this button. */
  add: [anchor: HTMLElement]
}>()

const uidLocale = useLocale()
const full = computed(() => props.reactions.length >= props.max)

function spoken(r: UidReaction): string {
  return uidLocale.value.reactions.pill(r.emoji, r.count, r.who)
}

function onAdd(event: MouseEvent): void {
  if (full.value) return
  emit('add', event.currentTarget as HTMLElement)
}
</script>

<template>
  <div
    v-if="reactions.length > 0"
    class="uid-reactions"
    :class="{ 'uid-reactions--touch': touch }"
    role="group"
    :aria-label="uidLocale.reactions.label"
  >
    <UidTooltip
      v-for="r in reactions"
      :key="r.emoji"
      :content="`${r.emoji} ${r.who}`"
    >
      <button
        type="button"
        class="uid-reactions__pill"
        :class="{ 'uid-reactions__pill--mine': r.mine }"
        :aria-pressed="r.mine"
        :aria-label="spoken(r)"
        :disabled="readonly"
        @click="emit('toggle', r.emoji)"
      >
        <span
          class="uid-reactions__emoji"
          aria-hidden="true"
        >{{ r.emoji }}</span>
        <span
          class="uid-reactions__count"
          aria-hidden="true"
        >{{ r.count }}</span>
      </button>
    </UidTooltip>
    <UidTooltip
      v-if="!readonly"
      :content="full ? uidLocale.reactions.limit(max) : uidLocale.reactions.add"
    >
      <button
        type="button"
        class="uid-reactions__add"
        :aria-label="full ? uidLocale.reactions.limit(max) : uidLocale.reactions.add"
        :aria-disabled="full || undefined"
        :aria-haspopup="full ? undefined : 'dialog'"
        @click="onAdd"
      >
        <SmilePlus
          :size="14"
          aria-hidden="true"
        />
      </button>
    </UidTooltip>
  </div>
</template>
