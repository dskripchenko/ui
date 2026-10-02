<script setup lang="ts">
import './UidRadio.css'
import { computed, inject, useId } from 'vue'
import { RADIO_GROUP_KEY, type RadioValue } from './context.js'
import { useControlAttrs } from '../../composables/useControlAttrs.js'

export interface UidRadioProps {
  value: RadioValue
  label?: string
  disabled?: boolean
  name?: string
  id?: string
}

defineOptions({ inheritAttrs: false })
const { rootAttrs, controlAttrs } = useControlAttrs()

const props = withDefaults(defineProps<UidRadioProps>(), {
  label: undefined,
  disabled: false,
  name: undefined,
  id: undefined,
})

const model = defineModel<RadioValue>()
const group = inject(RADIO_GROUP_KEY, null)
const autoId = useId()
const inputId = props.id ?? autoId

const isChecked = computed(() =>
  group ? group.modelValue.value === props.value : model.value === props.value,
)

const computedName = computed(() => group?.name ?? props.name ?? '')
const isDisabled = computed(() => (group?.disabled.value ?? false) || (props.disabled ?? false))

function handleChange(): void {
  if (group) group.update(props.value)
  else model.value = props.value
}
</script>

<template>
  <label
    v-bind="rootAttrs()"
    class="uid-radio"
    :class="isDisabled && 'uid-radio--disabled'"
  >
    <input
      v-bind="controlAttrs()"
      :id="inputId"
      type="radio"
      class="uid-radio__input"
      :name="computedName"
      :checked="isChecked"
      :disabled="isDisabled"
      @change="handleChange"
    >
    <span
      class="uid-radio__circle"
      aria-hidden="true"
    />
    <span
      v-if="label"
      class="uid-radio__text"
    >{{ label }}</span>
  </label>
</template>
