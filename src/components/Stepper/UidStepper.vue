<script setup lang="ts">
import './UidStepper.css'
import { Check } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface StepperStep {
  label: string
  description?: string
}

export interface UidStepperProps {
  steps: StepperStep[]
  current?: number
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<UidStepperProps>(), {
  current: 0,
  orientation: 'horizontal',
})

function getStatus(index: number, current: number): 'completed' | 'current' | 'pending' {
  if (index < current) return 'completed'
  if (index === current) return 'current'
  return 'pending'
}
</script>

<template>
  <ol
    class="uid-stepper"
    :class="[`uid-stepper--${orientation}`]"
    :aria-label="`Шаги (текущий: ${current + 1} из ${steps.length})`"
  >
    <li
      v-for="(step, index) in steps"
      :key="index"
      class="uid-stepper__step"
      :class="[`uid-stepper__step--${getStatus(index, current)}`]"
      :aria-current="index === current ? 'step' : undefined"
    >
      <div class="uid-stepper__indicator">
        <UidIcon
          v-if="getStatus(index, current) === 'completed'"
          :icon="Check"
          :size="16"
          aria-hidden="true"
        />
        <span
          v-else
          aria-hidden="true"
        >{{ index + 1 }}</span>
      </div>
      <div class="uid-stepper__content">
        <span class="uid-stepper__label">{{ step.label }}</span>
        <span
          v-if="step.description"
          class="uid-stepper__description"
        >{{ step.description }}</span>
      </div>
    </li>
  </ol>
</template>
