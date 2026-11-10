// The built library imports no icon library at run time: every component carries
// its icons. Only the `@dskripchenko/ui/icons` entry re-exports lucide-vue-next.
// A component that takes its icons from src/icons/index.ts pulls that entry into a
// shared chunk, and `import "lucide-vue-next"` into every page using the kit.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist')
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]))
const offenders = files(dist)
  .filter((f) => /\.(m?js)$/.test(f) && !relative(dist, f).startsWith('icons/'))
  .filter((f) => /(?:from\s*|import\s*\(\s*|import\s+)["']lucide-vue-next["']/.test(readFileSync(f, 'utf8')))
if (offenders.length) {
  console.error(`lucide-vue-next imported at run time by: ${offenders.map((f) => relative(dist, f)).join(', ')}\nImport icons from 'lucide-vue-next' in the component, not from src/icons/index.ts.`)
  process.exit(1)
}
