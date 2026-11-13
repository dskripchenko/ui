<script lang="ts">
/** FNV-1a: close seeds («Ann», «Anna», ids 12 and 21) land far apart. */
export function avatarHash(seed: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
</script>

<script setup lang="ts">
import './UidAvatar.css'
import { computed, ref, type Component } from 'vue'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'
import type { Tone } from '../../types/index.js'

export type UidPresence = 'online' | 'away' | 'dnd' | 'call' | 'offline'

export interface UidAvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  /**
   * Presence mark in the corner, told by shape and colour together: online —
   * a filled dot; away — a ring; do not disturb — a dot with a bar; in a
   * call — a ring with a dot; offline — a grey ring.
   */
  presence?: UidPresence
  /**
   * The fill under the initials, instead of the one picked by the name: a
   * kind of account told apart (a service, a bot). White initials go on it,
   * so it should keep 4.5:1 with white.
   */
  color?: string
  /**
   * What picks the fill when there is no `color`: a stable id of the person
   * (an account id), so that two people with like names differ and one
   * person has one colour everywhere. The name by default.
   */
  seed?: string | number
  /**
   * An icon instead of the initials, white on the fill: an account that is
   * not a person (a bot, a service). The name still labels the avatar.
   */
  icon?: Component
  /**
   * A ring around the avatar, apart from it by a gap of the background: an
   * account told apart at a glance (an outside person, a guest). Not the
   * presence mark — that one sits on the corner dot.
   */
  ring?: Tone
}

const props = withDefaults(defineProps<UidAvatarProps>(), {
  src: undefined,
  alt: undefined,
  name: undefined,
  size: 'md',
  shape: 'circle',
  presence: undefined,
  color: undefined,
  seed: undefined,
  icon: undefined,
  ring: undefined,
})

const uidLocale = useLocale()
const presenceText = computed(() => (props.presence ? uidLocale.value.avatar.presence[props.presence] : null))
const label = computed(() => {
  const base = props.alt ?? props.name
  return presenceText.value === null ? base : [base, presenceText.value].filter(Boolean).join(', ')
})

const imgError = ref(false)

const initials = computed<string>(() => {
  if (!props.name) return '?'
  // A hyphen joins two words of one name: "Anne-Marie" is "AM".
  const words = props.name.trim().split(/[\s-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})

const colorIndex = computed<number>(() => {
  const seed = props.seed ?? props.name
  if (seed === undefined || seed === '') return 0
  return avatarHash(String(seed)) % PALETTE.length
})

// The 700 steps of indigo, violet, pink, orange, green, fuchsia, blue and
// red: white initials stay at 4.5:1 or more on each, in both themes. One
// green only — the accent is teal, a second green reads as the same colour.
const PALETTE = [
  '#4338ca', '#6d28d9', '#be185d', '#c2410c',
  '#15803d', '#a21caf', '#1d4ed8', '#b91c1c',
]

const bgColor = computed(() => props.color ?? PALETTE[colorIndex.value])

const ICON_SIZES = { xs: 12, sm: 14, md: 16, lg: 20, xl: 32 } as const
const iconSize = computed(() => ICON_SIZES[props.size])

function onError(): void {
  imgError.value = true
}
</script>

<template>
  <span
    v-if="presence"
    class="uid-avatar-presence"
    :class="`uid-avatar-presence--${size}`"
    role="img"
    :aria-label="label"
    :title="label"
  >
    <span
      class="uid-avatar"
      :class="[`uid-avatar--${size}`, `uid-avatar--${shape}`, ring ? `uid-avatar--ring uid-avatar--ring-${ring}` : null]"
      aria-hidden="true"
    >
      <img
        v-if="src && !imgError"
        :src="src"
        alt=""
        class="uid-avatar__img"
        @error="onError"
      >
      <span
        v-else
        class="uid-avatar__initials"
        :style="{ background: bgColor }"
      >
        <UidIcon
          v-if="icon"
          :icon="icon"
          :size="iconSize"
        />
        <template v-else>{{ initials }}</template>
      </span>
    </span>
    <span
      class="uid-avatar-presence__dot"
      :class="`uid-avatar-presence__dot--${presence}`"
      aria-hidden="true"
    />
  </span>
  <span
    v-else
    class="uid-avatar"
    :class="[`uid-avatar--${size}`, `uid-avatar--${shape}`, ring ? `uid-avatar--ring uid-avatar--ring-${ring}` : null]"
    :title="name"
    :aria-label="alt ?? name"
    role="img"
  >
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt ?? name"
      class="uid-avatar__img"
      @error="onError"
    >
    <span
      v-else
      class="uid-avatar__initials"
      :style="{ background: bgColor }"
      aria-hidden="true"
    >
      <UidIcon
        v-if="icon"
        :icon="icon"
        :size="iconSize"
      />
      <template v-else>{{ initials }}</template>
    </span>
  </span>
</template>
