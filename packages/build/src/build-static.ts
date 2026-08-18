import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const sharedProcess = await import('@lvce-editor/shared-process')

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
