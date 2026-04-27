<script setup lang="ts">
import './UidPageHeader.css'
import { ArrowLeft } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UidPageHeaderProps {
  title?: string
  description?: string
  back?: boolean
}

withDefaults(defineProps<UidPageHeaderProps>(), {
  title: undefined,
  description: undefined,
  back: false,
})

const emit = defineEmits<{
  back: []
}>()

defineSlots<{
  breadcrumb?(): unknown
  title?(): unknown
  description?(): unknown
  actions?(): unknown
  tabs?(): unknown
}>()
</script>

<template>
  <div class="uid-pattern-page-header">
    <div
      v-if="$slots.breadcrumb"
      class="uid-pattern-page-header__breadcrumb"
    >
      <slot name="breadcrumb" />
    </div>

    <div class="uid-pattern-page-header__row">
      <div class="uid-pattern-page-header__heading">
        <button
          v-if="back"
          type="button"
          class="uid-pattern-page-header__back"
          aria-label="Назад"
          @click="emit('back')"
        >
          <UidIcon
            :icon="ArrowLeft"
            :size="20"
          />
        </button>

        <div>
          <h1 class="uid-pattern-page-header__title">
            <slot name="title">
              {{ title }}
            </slot>
          </h1>
          <p
            v-if="description || $slots.description"
            class="uid-pattern-page-header__description"
          >
            <slot name="description">
              {{ description }}
            </slot>
          </p>
        </div>
      </div>

      <div
        v-if="$slots.actions"
        class="uid-pattern-page-header__actions"
      >
        <slot name="actions" />
      </div>
    </div>

    <div
      v-if="$slots.tabs"
      class="uid-pattern-page-header__tabs"
    >
      <slot name="tabs" />
    </div>
  </div>
</template>
