import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { root } from './root.ts'

const sharedProcessPath = join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'shared-process', 'index.js')
const sharedProcess = await import(pathToFileURL(sharedProcessPath).toString())

process.env.PATH_PREFIX = '/language-features-markdown'

const { commitHash } = await sharedProcess.exportStatic({
  extensionPath: 'packages/extension',
  testPath: 'packages/e2e',
  root,
})

await cp(
  join(root, '.tmp', 'dist'),
  join(root, 'dist', commitHash, 'extensions', 'builtin.language-features-markdown'),
  {
    recursive: true,
    force: true,
  },
)
