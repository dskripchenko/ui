import { config } from '@vue/test-utils'
import { computed } from 'vue'
import { localeKey } from './src/composables/useLocale.js'
import { ru } from './src/locales/ru.js'
import { setValidationLocale } from './src/utils/validation/messages.js'

// The specs were written against the Russian strings and formats; the
// library's own default (English) is covered in useLocale.spec.ts.
config.global.provide = { ...config.global.provide, [localeKey as symbol]: computed(() => ru) }
setValidationLocale(ru)
