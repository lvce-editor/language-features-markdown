import { activate, registerLanguageServer } from '@lvce-editor/api'

await activate()

registerLanguageServer({
  argv: ['--stdio'],
  id: 'vscode-markdown',
  languageId: 'markdown',
  uri: 'dist/language-server/markdown-language-server.js',
})
