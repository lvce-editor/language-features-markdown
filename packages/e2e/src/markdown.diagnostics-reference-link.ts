import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'markdown.diagnostics-reference-link'

const expectedDiagnostics = [
  {
    columnIndex: 10,
    endColumnIndex: 19,
    endRowIndex: 0,
    message: "No link definition found: 'reference'",
    rowIndex: 0,
    type: 'warning',
  },
] as const

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  const workspaceUri = await FileSystem.getTmpDir({ scheme: 'file' })
  await FileSystem.writeFile(`${workspaceUri}/README.md`, '[missing][reference]\n')
  await Workspace.setPath(workspaceUri)
  await Settings.update({ 'editor.diagnostics': true })

  await Main.openUri(`${workspaceUri}/README.md`)

  const maxAttempts = 200
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await Editor.shouldHaveDiagnostics(expectedDiagnostics)
      return
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}
