import type { InjectionKey, Ref } from 'vue'

export interface BreadcrumbContext {
  /** Bumped after every UidBreadcrumb update so items can re-check whether they are last. */
  tick: Ref<number>
  /**
   * `collapse` mode: the `<li>` elements of the crumbs collapsed into "…", in DOM order.
   * The first one stays in the layout and shows the "…" in place of its content.
   */
  hidden: Ref<readonly HTMLElement[]>
  /** Whether the "…" opens a menu of the collapsed crumbs. */
  menu: Ref<boolean>
  /** The menu's element id (for `aria-controls`). */
  menuId: string
  /** Whether that menu is open. */
  menuOpen: Ref<boolean>
  /** Toggle the menu of collapsed crumbs, anchored to the "…" button. */
  toggleMenu: (trigger: HTMLElement) => void
}

export const BREADCRUMB_KEY: InjectionKey<BreadcrumbContext> = Symbol('UidBreadcrumb')
