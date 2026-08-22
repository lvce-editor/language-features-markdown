import { build } from 'esbuild'
import { execa } from 'execa'
import { chmod, copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const extension = join(root, 'packages', 'extension')
const node = join(root, 'packages', 'node')
const languageServerDist = join(extension, 'dist', 'language-server')

await mkdir(languageServerDist, { recursive: true })
const languageServerEntry = join(languageServerDist, 'markdown-language-server.js')
const esbuildPath = join(root, 'node_modules', 'esbuild', 'bin', 'esbuild')
await build({
  banner: {
    js: "#!/usr/bin/env node\nimport { createRequire } from 'node:module'\nconst require = createRequire(import.meta.url)",
  },
  bundle: true,
  entryPoints: [join(node, 'src', 'markdownLanguageServerMain.ts')],
  external: ['node:*'],
  format: 'esm',
  outfile: languageServerEntry,
  platform: 'node',
  target: 'node24',
})
await chmod(languageServerEntry, 0o755)
execa(
  esbuildPath,
  [
    '--format=esm',
    '--bundle',
    '--external:node:*',
    '--platform=node',
    '--target=node24',
    "--banner:js=#!/usr/bin/env node\nimport { createRequire } from 'node:module'\nconst require = createRequire(import.meta.url)",
    '--watch',
    join(node, 'src', 'markdownLanguageServerMain.ts'),
    `--outfile=${languageServerEntry}`,
  ],
  {
    cwd: root,
    stdio: 'inherit',
  },
)
await copyFile(
  join(root, 'node_modules', 'vscode-markdown-languageserver', 'dist', 'node', 'workerMain.js'),
  join(languageServerDist, 'workerMain.js'),
)

execa(
  esbuildPath,
  [
    '--format=esm',
    '--bundle',
    '--external:electron',
    '--external:node:*',
    '--watch',
    'packages/extension/src/languageFeaturesMarkdownMain.ts',
    '--outfile=packages/extension/dist/languageFeaturesMarkdownMain.js',
  ],
  {
    cwd: root,
    stdio: 'inherit',
  },
)
