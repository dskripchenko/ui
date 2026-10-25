---
"@dskripchenko/ui": minor
---

UidMarkdown: live blocks. A block renderer may return `mount(el, ctx)` instead of `html` — the host's widget (an API console, a chart with controls) is mounted into the block. A changed source goes to the widget's `update`, `destroy` runs when the block goes away; rendered markdown mounts with `editable: false`. New types `UidMarkdownBlockMountContext` and `UidMarkdownBlockMountHandle`; the contract matches the WYSIWYG editor's live blocks.
