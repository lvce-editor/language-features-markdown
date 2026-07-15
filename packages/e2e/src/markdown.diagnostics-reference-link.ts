import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'markdown.diagnostics-reference-link'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  const workspaceUri = await FileSystem.getTmpDir({ scheme: 'file' })
  await FileSystem.writeFile(`${workspaceUri}/README.md`, '[missing][reference]\n')
  await Workspace.setPath(workspaceUri)
  await Settings.update({ 'editor.diagnostics': true })

  await Main.openUri(`${workspaceUri}/README.md`)

  await Editor.shouldHaveDiagnostics([
    {
      columnIndex: 10,
      endColumnIndex: 19,
      endRowIndex: 0,
      message: "No link definition found: 'reference'",
      rowIndex: 0,
      type: 'warning',
    },
  ])
}
