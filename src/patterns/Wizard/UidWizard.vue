<script setup lang="ts">
import './UidWizard.css'
import { computed, provide } from 'vue'
import { WIZARD_KEY } from './context.js'
import type { WizardStepDef } from './context.js'

export interface UidWizardProps {
  steps: WizardStepDef[]
}

const props = defineProps<UidWizardProps>()
const current = defineModel<number>({ default: 0 })

const validators = new Map<number, () => boolean | Promise<boolean>>()

const stepsRef = computed(() => props.steps)
const isFirst = computed(() => current.value === 0)
const isLast = computed(() => current.value === props.steps.length - 1)

async function next(): Promise<void> {
  const validator = validators.get(current.value)
  if (validator) {
    const valid = await validator()
    if (!valid) return
  }
  if (!isLast.value) current.value++
}

function prev(): void {
  if (!isFirst.value) current.value--
}

function goTo(index: number): void {
  if (index >= 0 && index < props.steps.length) current.value = index
}

function registerValidator(index: number, fn: () => boolean | Promise<boolean>): void {
  validators.set(index, fn)
}

function unregisterValidator(index: number): void {
  validators.delete(index)
}

provide(WIZARD_KEY, {
  current,
  steps: stepsRef,
  isFirst,
  isLast,
  next,
  prev,
  goTo,
  registerValidator,
  unregisterValidator,
})

defineExpose({ current, next, prev, goTo, isFirst, isLast })
</script>

<template>
  <div class="uid-wizard">
    <slot />
  </div>
</template>
