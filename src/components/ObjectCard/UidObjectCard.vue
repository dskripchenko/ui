<script setup lang="ts">
import './UidObjectCard.css'
import { ChevronDown, ExternalLink, Loader2 } from 'lucide-vue-next'
import type { Tone } from '../../types/index.js'

export type UidObjectCardTone = Tone | 'neutral'

export interface UidObjectCardStatus {
  label: string
  tone?: UidObjectCardTone
}

export interface UidObjectCardProps {
  /** The object's code, set in monospace: an article key, a ticket number. */
  code?: string
  title: string
  status?: UidObjectCardStatus
  /** The status is a button (a menu of moves opens from it): emits `status`. */
  statusAction?: boolean
  /** Accessible name of the status button. */
  statusActionLabel?: string
  /** A link to the object in its own system. */
  href?: string
  hrefLabel?: string
  /** A change is under way: the status shows `busyLabel` with a spinner, the actions are dimmed. */
  busy?: boolean
  busyLabel?: string
  /** Something went wrong with the object: a danger border; say what in the `notice` slot. */
  invalid?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<UidObjectCardProps>(), {
  code: undefined,
  status: undefined,
  statusAction: false,
  statusActionLabel: undefined,
  href: undefined,
  hrefLabel: undefined,
  busy: false,
  busyLabel: undefined,
  invalid: false,
  size: 'md',
})

const emit = defineEmits<{
  /** The status button was pressed; the element anchors a menu. */
  status: [anchor: HTMLElement]
}>()

defineSlots<{
  /** Before the code: the object's kind. */
  icon?(): unknown
  /** Under the title: who, where, when. */
  meta?(): unknown
  /** Below a divider: quick actions (buttons). */
  actions?(): unknown
  /** Under everything: a form opened by an action, a refusal with what to do. */
  notice?(): unknown
  /** Anything else, between the title and the meta line. */
  default?(): unknown
}>()

function onStatus(event: MouseEvent): void {
  if (props.busy) return
  emit('status', event.currentTarget as HTMLElement)
}
</script>

<template>
  <article
    class="uid-object-card"
    :class="[`uid-object-card--${size}`, { 'uid-object-card--invalid': invalid, 'uid-object-card--busy': busy }]"
    :aria-busy="busy || undefined"
  >
    <div class="uid-object-card__top">
      <span
        v-if="$slots.icon"
        class="uid-object-card__icon"
      ><slot name="icon" /></span>
      <span
        v-if="code"
        class="uid-object-card__code"
      >{{ code }}</span>
      <span
        v-if="busy"
        class="uid-object-card__status uid-object-card__status--info"
        role="status"
      >
        <Loader2
          :size="12"
          class="uid-object-card__spin"
          aria-hidden="true"
        />{{ busyLabel ?? status?.label }}
      </span>
      <button
        v-else-if="status && statusAction"
        type="button"
        class="uid-object-card__status uid-object-card__status--button"
        :class="`uid-object-card__status--${status.tone ?? 'neutral'}`"
        :aria-label="statusActionLabel ? `${statusActionLabel}: ${status.label}` : undefined"
        aria-haspopup="menu"
        @click="onStatus"
      >
        {{ status.label }}
        <ChevronDown
          :size="12"
          aria-hidden="true"
        />
      </button>
      <span
        v-else-if="status"
        class="uid-object-card__status"
        :class="`uid-object-card__status--${status.tone ?? 'neutral'}`"
      >{{ status.label }}</span>
      <a
        v-if="href"
        class="uid-object-card__link"
        :href="href"
        target="_blank"
        rel="noopener"
      >
        <ExternalLink
          :size="12"
          aria-hidden="true"
        />{{ hrefLabel }}
      </a>
    </div>
    <p class="uid-object-card__title">
      {{ title }}
    </p>
    <slot />
    <div
      v-if="$slots.meta"
      class="uid-object-card__meta"
    >
      <slot name="meta" />
    </div>
    <div
      v-if="$slots.actions"
      class="uid-object-card__actions"
      :inert="busy || undefined"
    >
      <slot name="actions" />
    </div>
    <div
      v-if="$slots.notice"
      class="uid-object-card__notice"
    >
      <slot name="notice" />
    </div>
  </article>
</template>
