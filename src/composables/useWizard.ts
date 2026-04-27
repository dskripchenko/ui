import { inject } from 'vue'
import { WIZARD_KEY } from '../patterns/Wizard/context.js'
import type { WizardContext } from '../patterns/Wizard/context.js'

export function useWizard(): WizardContext {
  const ctx = inject(WIZARD_KEY)
  if (!ctx) throw new Error('useWizard() must be used inside UidWizard')
  return ctx
}
