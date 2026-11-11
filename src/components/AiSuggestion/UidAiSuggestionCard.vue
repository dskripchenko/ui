<script setup lang="ts">
import './UidAiSuggestionCard.css'
import { computed, nextTick, ref, watch, type Component } from 'vue'
import { Ban, CircleAlert, Clock, EyeOff, RotateCcw, Sparkles, TriangleAlert, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import UidButton from '../Button/UidButton.vue'
import UidMarkdown from '../Markdown/UidMarkdown.vue'
import UidSkeleton from '../Skeleton/UidSkeleton.vue'
import UidSpinner from '../Spinner/UidSpinner.vue'
import { useLocale } from '../../composables/useLocale.js'

export type UidAiSuggestionState = 'pending' | 'result' | 'error'
export type UidAiSuggestionErrorKind = 'off' | 'setup' | 'limit' | 'failed'

export interface UidAiSuggestionError {
  /** What went wrong, in one line. */
  title: string
  /** What it means and what to do. */
  message?: string
  /** A machine code shown small under the message. */
  code?: string
  /** Picks the icon and its tone: off — muted, setup and limit — warning, failed — danger. */
  kind?: UidAiSuggestionErrorKind
}

export interface UidAiSuggestionCardProps {
  state?: UidAiSuggestionState
  /** The card's heading. */
  title: string
  /** The Markdown text a model proposed (v-model:text). */
  text?: string
  /** The text as the model gave it: when `text` differs, the card says it was edited. */
  original?: string
  /** Show the text as a field to edit (v-model:editing). */
  editing?: boolean
  /** The model's name, at the end of the meta line. */
  model?: string
  /** What the proposal is based on, e.g. «9 messages · 10:24–11:52». */
  meta?: string
  /** The line under the skeleton while waiting. */
  pendingText?: string
  error?: UidAiSuggestionError
  /** The error is worth another try: shows «Retry». */
  retryable?: boolean
  /** The mark that only this person sees the proposal; `false` hides it. */
  privateLabel?: string | false
  /** Show the closing ×. */
  closable?: boolean
}

const props = withDefaults(defineProps<UidAiSuggestionCardProps>(), {
  state: 'result',
  text: '',
  original: undefined,
  editing: false,
  model: undefined,
  meta: undefined,
  pendingText: undefined,
  error: undefined,
  retryable: false,
  privateLabel: undefined,
  closable: true,
})

const emit = defineEmits<{
  'update:text': [text: string]
  'update:editing': [editing: boolean]
  close: []
  cancel: []
  retry: []
}>()

const slots = defineSlots<{
  /** Buttons under a result: publish, edit, copy… */
  actions?(props: { editing: boolean, edited: boolean }): unknown
  /** Replaces the heading's icon. */
  icon?(): unknown
}>()

const locale = useLocale()
const field = ref<HTMLTextAreaElement | null>(null)

const edited = computed(() => props.original !== undefined && props.text !== props.original)
const mark = computed(() => (props.privateLabel === false ? null : props.privateLabel ?? locale.value.aiSuggestion.private))
const metaLine = computed(() => [props.meta, props.model, edited.value ? locale.value.aiSuggestion.edited : undefined].filter((x) => x !== undefined && x !== '').join(' · '))

const errorIcons: Record<UidAiSuggestionErrorKind, Component> = { off: Ban, setup: CircleAlert, limit: Clock, failed: TriangleAlert }
const errorKind = computed<UidAiSuggestionErrorKind>(() => props.error?.kind ?? 'failed')

watch(() => props.editing, async (on) => {
  if (on) {
    await nextTick()
    field.value?.focus()
  }
})

function revert(): void {
  if (props.original !== undefined) emit('update:text', props.original)
}
</script>

<template>
  <section
    class="uid-ai-suggestion"
    :class="`uid-ai-suggestion--${state}`"
    :aria-busy="state === 'pending' ? 'true' : undefined"
  >
    <header class="uid-ai-suggestion__head">
      <slot name="icon">
        <UidIcon
          :icon="Sparkles"
          :size="16"
          class="uid-ai-suggestion__spark"
        />
      </slot>
      <span class="uid-ai-suggestion__title">{{ title }}</span>
      <span
        v-if="mark"
        class="uid-ai-suggestion__private"
      >
        <UidIcon
          :icon="EyeOff"
          :size="12"
        />
        {{ mark }}
      </span>
      <button
        v-if="closable"
        type="button"
        class="uid-ai-suggestion__close"
        :aria-label="locale.common.close"
        @click="emit('close')"
      >
        <UidIcon
          :icon="X"
          :size="16"
        />
      </button>
    </header>

    <template v-if="state === 'pending'">
      <UidSkeleton
        :lines="3"
        class="uid-ai-suggestion__skeleton"
      />
      <p
        class="uid-ai-suggestion__pending"
        role="status"
      >
        <UidSpinner size="sm" />
        <span>{{ [pendingText ?? locale.aiSuggestion.pending, model].filter(Boolean).join(' · ') }}</span>
      </p>
      <div class="uid-ai-suggestion__actions">
        <UidButton
          variant="secondary"
          size="sm"
          :icon="X"
          @click="emit('cancel')"
        >
          {{ locale.common.cancel }}
        </UidButton>
      </div>
    </template>

    <template v-else-if="state === 'error'">
      <div
        class="uid-ai-suggestion__error"
        :class="`uid-ai-suggestion__error--${errorKind}`"
        role="alert"
      >
        <UidIcon
          :icon="errorIcons[errorKind]"
          :size="16"
          class="uid-ai-suggestion__error-icon"
        />
        <div>
          <p class="uid-ai-suggestion__error-title">
            {{ error?.title }}
          </p>
          <p
            v-if="error?.message"
            class="uid-ai-suggestion__error-text"
          >
            {{ error.message }}
          </p>
        </div>
      </div>
      <p
        v-if="error?.code"
        class="uid-ai-suggestion__meta"
      >
        {{ locale.aiSuggestion.code(error.code) }}
      </p>
      <div
        v-if="retryable"
        class="uid-ai-suggestion__actions"
      >
        <UidButton
          size="sm"
          :icon="RotateCcw"
          @click="emit('retry')"
        >
          {{ locale.aiSuggestion.retry }}
        </UidButton>
      </div>
    </template>

    <template v-else>
      <label
        v-if="editing"
        class="uid-ai-suggestion__edit"
      >
        <span class="uid-ai-suggestion__label">{{ locale.aiSuggestion.field }}</span>
        <textarea
          ref="field"
          class="uid-ai-suggestion__field"
          :value="text"
          rows="6"
          @input="emit('update:text', ($event.target as HTMLTextAreaElement).value)"
        />
      </label>
      <UidMarkdown
        v-else
        class="uid-ai-suggestion__text"
        :source="text"
      />
      <p
        v-if="metaLine !== ''"
        class="uid-ai-suggestion__meta"
      >
        {{ metaLine }}
      </p>
      <div
        v-if="slots.actions || (editing && edited)"
        class="uid-ai-suggestion__actions"
      >
        <slot
          name="actions"
          :editing="editing"
          :edited="edited"
        />
        <UidButton
          v-if="editing && edited"
          variant="secondary"
          size="sm"
          :icon="RotateCcw"
          @click="revert"
        >
          {{ locale.aiSuggestion.revert }}
        </UidButton>
      </div>
    </template>
  </section>
</template>
