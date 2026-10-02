import { computed, getCurrentInstance, type Component, type ComputedRef } from 'vue'

export type RouterLocation = string | Record<string, unknown>

export interface UseRouterLinkSource {
  href?: string
  to?: RouterLocation
}

export interface UseRouterLink {
  /** The app's globally registered `RouterLink`, or `null` when `to` is unset or vue-router is not installed. */
  routerLink: ComputedRef<Component | null>
  /** Plain `href` for the `<a>` fallback: explicit `href`, else a string `to`. */
  fallbackHref: ComputedRef<string | undefined>
}

/**
 * Resolves `to` against a globally registered RouterLink without warning or rendering a
 * broken `<routerlink>` element when vue-router is absent; callers fall back to `<a href>`.
 * Must be called during component setup.
 */
export function useRouterLink(source: UseRouterLinkSource): UseRouterLink {
  const instance = getCurrentInstance()

  const routerLink = computed<Component | null>(() => {
    if (source.to === undefined) return null
    const registered = instance?.appContext.components.RouterLink
    return (registered as Component | undefined) ?? null
  })

  const fallbackHref = computed(() => source.href ?? (typeof source.to === 'string' ? source.to : undefined))

  return { routerLink, fallbackHref }
}
