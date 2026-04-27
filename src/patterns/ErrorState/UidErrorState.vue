<script setup lang="ts">
import './UidErrorState.css'
import { computed } from 'vue'
import { AlertCircle, WifiOff, ServerCrash } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import type { Component } from 'vue'

export interface UidErrorStateProps {
  code?: '404' | '500' | 'network' | string
  title?: string
  description?: string
}

const props = withDefaults(defineProps<UidErrorStateProps>(), {
  code: undefined,
  title: undefined,
  description: undefined,
})

defineSlots<{
  illustration?(): unknown
  title?(): unknown
  description?(): unknown
  actions?(): unknown
}>()

interface ErrorPreset {
  icon: Component
  title: string
  description: string
}

const PRESETS: Record<string, ErrorPreset> = {
  '404': {
    icon: AlertCircle,
    title: 'Страница не найдена',
    description: 'Запрашиваемая страница не существует или была перемещена.',
  },
  '500': {
    icon: ServerCrash,
    title: 'Ошибка сервера',
    description: 'На сервере произошла ошибка. Мы уже работаем над исправлением.',
  },
  network: {
    icon: WifiOff,
    title: 'Нет соединения',
    description: 'Проверьте подключение к интернету и попробуйте снова.',
  },
}

const preset = computed<ErrorPreset | null>(() =>
  props.code ? (PRESETS[props.code] ?? null) : null,
)

const resolvedIcon = computed(() => preset.value?.icon ?? AlertCircle)
const resolvedTitle = computed(() => props.title ?? preset.value?.title ?? 'Что-то пошло не так')
const resolvedDescription = computed(() => props.description ?? preset.value?.description)
</script>

<template>
  <div class="uid-pattern-error-state">
    <div class="uid-pattern-error-state__illustration">
      <slot name="illustration">
        <UidIcon
          :icon="resolvedIcon"
          :size="48"
        />
      </slot>
    </div>

    <div
      v-if="code"
      class="uid-pattern-error-state__code"
    >
      {{ code }}
    </div>

    <div class="uid-pattern-error-state__content">
      <h2 class="uid-pattern-error-state__title">
        <slot name="title">
          {{ resolvedTitle }}
        </slot>
      </h2>
      <p
        v-if="resolvedDescription || $slots.description"
        class="uid-pattern-error-state__description"
      >
        <slot name="description">
          {{ resolvedDescription }}
        </slot>
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="uid-pattern-error-state__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
