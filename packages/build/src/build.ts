import { packageExtension } from '@lvce-editor/package-extension'
import { build } from 'esbuild'
import { chmod, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const extension = join(root, 'packages', 'extension')
const dist = join(root, '.tmp', 'dist')
const extensionDist = join(extension, 'dist', 'languageFeaturesMarkdownMain.js')
const extensionLanguageServerDist = join(extension, 'dist', 'language-server')
const packagedLanguageServerDist = join(dist, 'dist', 'language-server')

await rm(dist, { recursive: true, force: true })
await mkdir(join(dist, 'dist'), { recursive: true })
await mkdir(extensionLanguageServerDist, { recursive: true })
await mkdir(packagedLanguageServerDist, { recursive: true })

const packageJson = JSON.parse(await readFile(join(extension, 'package.json'), 'utf8'))
delete packageJson.jest
delete packageJson.devDependencies

await writeFile(join(dist, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
await copyFile(join(root, 'README.md'), join(dist, 'README.md'))
await copyFile(join(root, 'LICENSE'), join(dist, 'LICENSE'))
await copyFile(join(extension, 'icon.png'), join(dist, 'icon.png'))
await copyFile(join(extension, 'extension.json'), join(dist, 'extension.json'))

await build({
  bundle: true,
  entryPoints: [join(extension, 'src', 'languageFeaturesMarkdownMain.ts')],
  external: ['electron', 'node:*'],
  format: 'esm',
  outfile: extensionDist,
  platform: 'browser',
  target: 'esnext',
})
await copyFile(extensionDist, join(dist, 'dist', 'languageFeaturesMarkdownMain.js'))

const languageServerEntry = join(extension, 'src', 'markdown-language-server.js')
const builtLanguageServerEntry = join(extensionLanguageServerDist, 'markdown-language-server.js')
await copyFile(languageServerEntry, builtLanguageServerEntry)
await chmod(builtLanguageServerEntry, 0o755)
await copyFile(
  join(extension, 'node_modules', 'vscode-markdown-languageserver', 'dist', 'node', 'workerMain.js'),
  join(extensionLanguageServerDist, 'workerMain.js'),
)
await copyFile(builtLanguageServerEntry, join(packagedLanguageServerDist, 'markdown-language-server.js'))
await chmod(join(packagedLanguageServerDist, 'markdown-language-server.js'), 0o755)
await copyFile(join(extensionLanguageServerDist, 'workerMain.js'), join(packagedLanguageServerDist, 'workerMain.js'))

await packageExtension({
  highestCompression: true,
  inDir: dist,
  outFile: join(root, 'extension.tar.br'),
})
