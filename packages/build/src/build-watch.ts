import { execa } from 'execa'
import { chmod, copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const extension = join(root, 'packages', 'extension')
const languageServerDist = join(extension, 'dist', 'language-server')

await mkdir(languageServerDist, { recursive: true })
const languageServerEntry = join(languageServerDist, 'markdown-language-server.js')
await copyFile(join(extension, 'src', 'markdown-language-server.js'), languageServerEntry)
await chmod(languageServerEntry, 0o755)
await copyFile(
  join(root, 'node_modules', 'vscode-markdown-languageserver', 'dist', 'node', 'workerMain.js'),
  join(languageServerDist, 'workerMain.js'),
)

const esbuildPath = join(root, 'node_modules', 'esbuild', 'bin', 'esbuild')
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
