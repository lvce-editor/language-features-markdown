import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'markdown.completion-heading'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const fixtureUri = import.meta.resolve('../fixtures/completions')
  const workspaceUri = await FileSystem.loadFixture(fixtureUri)
  await Workspace.setPath(workspaceUri)
  await Main.openUri(`${workspaceUri}/README.md`)
  await Editor.setCursor(4, 10)

  await Editor.openCompletion()

  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItem = Locator('.EditorCompletionItem', { hasText: '#second-section' })
  await expect(completionItem).toHaveText('#second-section')
}
