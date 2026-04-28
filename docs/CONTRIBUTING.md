# Contributing

A single-author repo, but the workflow is documented to keep things consistent.

## Environment

- Node.js 20 LTS+
- pnpm 9+

```bash
pnpm install
pnpm dev               # Storybook
pnpm test              # Vitest in watch mode
pnpm test --run        # one-shot
pnpm lint
pnpm typecheck
pnpm build             # build the library into dist/
pnpm build-storybook   # build Storybook into storybook-static/
pnpm build:analyze     # build with rollup-plugin-visualizer (stats.html)
```

## Adding a component

1. **Branch:** `feat/component-button`, `feat/tokens-shadow`, `fix/input-focus-ring`.
2. **Folder structure** (see [COMPONENT_GUIDELINES](./COMPONENT_GUIDELINES.md#folder-structure)):
   ```
   src/components/Foo/
     UidFoo.vue
     UidFoo.css
     UidFoo.stories.ts
     UidFoo.spec.ts
     index.ts
   ```
3. **Implement** following the guidelines:
   - Props/Events/Slots typed.
   - Styles via tokens and local CSS variables only.
   - A11y minimum.
4. **Stories** — at least `Default`, `Variants`/`Sizes`, `Playground`.
5. **Tests** — props → render, events, key states.
6. **Public export** in `src/index.ts`:
   ```ts
   export { default as UidFoo } from './components/Foo/UidFoo.vue'
   export type { UidFooProps, UidFooVariant, UidFooSize } from './components/Foo'
   ```
7. **Pass the Definition of Done** in [COMPONENT_GUIDELINES](./COMPONENT_GUIDELINES.md#definition-of-done).
8. **Changeset:**
   ```bash
   pnpm changeset
   ```
   Pick a bump type and describe the change.
9. **PR**, wait for CI, merge.

## Versioning

[Changesets](https://github.com/changesets/changesets) + SemVer.

| Bump | When |
|---|---|
| `patch` | Bug fixes, style tweaks without API change, docs |
| `minor` | New component, new prop/variant (with default), new story |
| `major` | Removing/renaming a prop, changing default behavior, removing a component |

Until `1.0.0` we operate in "zero-major": breaking changes go as `minor`. Don't bump to `1.0.0` until at least 5 key components have stabilized.

## Release

Releases are automated via GitHub Actions on push to `main`:

- Push to `main` → `changesets/action` opens a "Version Packages" PR
- Merging that PR triggers `pnpm release`, which builds and publishes to npm

Manual release (local fallback):

```bash
pnpm changeset version    # apply changesets, bump versions, update CHANGELOG
git add -A && git commit -m "release: versions"
pnpm build
pnpm changeset publish    # publish to npm + tag
git push --follow-tags
```

Pre-publish checklist:

- [ ] `pnpm test --run` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` is clean
- [ ] `dist/` contains `index.mjs`, `index.cjs`, `index.d.ts`, and styles
- [ ] `npm pack --dry-run` shows only intended files

## Commit style

Conventional Commits (loose):

```
feat(button): add ghost variant
fix(input): retain focus on rerender
docs(tokens): document shadow scale
chore: bump storybook to 8.4
```

Type: `feat | fix | docs | chore | refactor | test | style`. Scope: component name or area (`tokens`, `themes`, `build`).

## What not to touch outside a PR

- `name` / `version` in `package.json` (Changesets owns versions)
- `exports` in `package.json` — public API; changes are major
- File moves inside `src/components/*` — breaks deep imports for users who don't go through the barrel
