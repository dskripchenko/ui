import { inject, provide, type InjectionKey } from 'vue'

/** What a block renderer returns for one fenced code block. */
export interface UidMarkdownBlockResult {
  /**
   * Markup to insert in place of the code block.
   *
   * Inserted as is (`v-html`): the renderer is responsible for its safety.
   * Return only markup you built yourself with every piece of user text
   * escaped — for example SVG from @dskripchenko/diagrams, which escapes
   * labels by construction. Never return the block's source unescaped.
   */
  html?: string
  /** Why the block could not be rendered; the block is then shown as code with this message. */
  error?: string
  /**
   * A live block: the host's widget (an API console, a chart with controls)
   * is mounted into the block's element instead of static markup. Return a
   * handle or a cleanup function: `update` takes a changed source without
   * remounting, `destroy` runs when the block goes away.
   */
  mount?: (
    el: HTMLElement,
    ctx: UidMarkdownBlockMountContext,
  ) => UidMarkdownBlockMountHandle | (() => void) | void
}

/** What a live block's `mount` is told. The contract is the WYSIWYG editor's too. */
export interface UidMarkdownBlockMountContext {
  /** The block's source. */
  code: string
  language: string
  /** Always false here: rendered markdown is read-only. */
  editable: boolean
  /** Ignored here — rendered markdown has no source to write to. */
  setCode(code: string): void
}

export interface UidMarkdownBlockMountHandle {
  update?(code: string): void
  destroy?(): void
}

/**
 * Renders a fenced code block of one language (```mermaid, ```chart, …)
 * instead of showing it as code. May be asynchronous — the block shows a
 * placeholder until it settles. A thrown error or a rejected promise is
 * treated like `{ error }`.
 */
export type UidMarkdownBlockRenderer = (
  code: string,
  ctx: { language: string; index: number },
) => UidMarkdownBlockResult | Promise<UidMarkdownBlockResult>

/** Block renderers by fence language (lower case). */
export type UidMarkdownBlockRenderers = Readonly<Record<string, UidMarkdownBlockRenderer>>

export const markdownBlockRenderersKey: InjectionKey<UidMarkdownBlockRenderers> =
  Symbol('UidMarkdownBlockRenderers')

/**
 * Registers block renderers for every UidMarkdown below the calling
 * component — call it in the root component's setup once. Application-wide:
 * `app.provide(markdownBlockRenderersKey, renderers)`. Renderers passed to
 * UidMarkdown through its prop take precedence, language by language.
 */
export function provideMarkdownBlockRenderers(renderers: UidMarkdownBlockRenderers): void {
  provide(markdownBlockRenderersKey, renderers)
}

export function useMarkdownBlockRenderers(): UidMarkdownBlockRenderers {
  return inject(markdownBlockRenderersKey, {})
}
