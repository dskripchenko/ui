<script setup lang="ts">
import { computed, inject, onUnmounted, watch } from 'vue'
import { WIZARD_KEY } from './context.js'

export interface UidWizardStepProps {
  index: number
  validate?: () => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<UidWizardStepProps>(), {
  validate: undefined,
})

const wizard = inject(WIZARD_KEY)
if (!wizard) throw new Error('UidWizardStep must be inside UidWizard')

watch(
  () => props.validate,
  (fn, oldFn) => {
    if (oldFn !== undefined) wizard.unregisterValidator(props.index)
    if (fn !== undefined) wizard.registerValidator(props.index, fn)
  },
  { immediate: true },
)

onUnmounted(() => wizard.unregisterValidator(props.index))

const isActive = computed(() => wizard.current.value === props.index)
</script>

<template>
  <div
    v-if="isActive"
    class="uid-wizard-step"
    role="tabpanel"
    :aria-label="`Шаг ${index + 1}`"
  >
    <slot />
  </div>
</template>
