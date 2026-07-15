import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'markdown.completion-path'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const workspaceUri = await FileSystem.getTmpDir({ scheme: 'file' })
  await FileSystem.writeFiles([
    {
      content: '[Guide](./gu)\n',
      uri: `${workspaceUri}/README.md`,
    },
    {
      content: '# Guide\n',
      uri: `${workspaceUri}/guide.md`,
    },
  ])
  await Workspace.setPath(workspaceUri)
  await Main.openUri(`${workspaceUri}/README.md`)
  await Editor.setCursor(0, 12)

  await Editor.openCompletion()

  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  const firstCompletionItem = completionItems.nth(0)
  await expect(firstCompletionItem).toHaveText('guide.md')
}
