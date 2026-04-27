import { ref, watch, type Ref } from 'vue'
import { parseRules, runRules } from '../utils/validation/parseRules'
import type { RuleInput, FieldContext } from '../utils/validation/types'

export interface UseFieldOptions {
  name?: string
  label?: string
  form?: Ref<Record<string, unknown> | undefined>
}

export function useField(value: Ref<unknown>, rules?: RuleInput | Ref<RuleInput | undefined>, options?: UseFieldOptions) {
  const error = ref('')
  const touched = ref(false)

  function validate(): boolean {
    const currentRules = rules && 'value' in (rules as object) ? (rules as Ref<RuleInput | undefined>).value : rules as RuleInput | undefined
    const parsed = parseRules(currentRules)
    const ctx: FieldContext = {
      field: options?.name ?? '',
      label: options?.label,
      form: options?.form?.value,
    }
    error.value = runRules(value.value, parsed, ctx)
    return !error.value
  }

  function onBlur(): void {
    touched.value = true
    validate()
  }

  function reset(): void {
    error.value = ''
    touched.value = false
  }

  watch(value, () => {
    if (touched.value) validate()
  })

  return { error, touched, validate, onBlur, reset }
}
