/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createMessageConnection, type MessageConnection } from 'vscode-jsonrpc/node.js'
import { markdownLanguageServerConfiguration } from './markdownLanguageServerConfiguration.ts'
import {
  executeMarkdownLanguageServerRequest,
  isMarkdownLanguageServerRequest,
} from './markdownLanguageServerRequest.ts'

interface InitializeParams {
  readonly rootUri?: string | null
}

interface TextDocumentParams {
  readonly textDocument?: {
    readonly text?: string
    readonly uri?: string
  }
}

interface DidChangeTextDocumentParams {
  readonly contentChanges?: readonly {
    readonly text?: string
  }[]
  readonly textDocument?: {
    readonly uri?: string
  }
}

const state = {
  documents: new Map<string, { readonly text: string }>(),
  rootUri: '',
}

const languageServerPath = fileURLToPath(new URL('workerMain.js', import.meta.url))
const languageServer = spawn(process.execPath, [languageServerPath, '--stdio'], {
  env: {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
  },
  stdio: ['pipe', 'pipe', 'pipe'],
})
languageServer.stderr.pipe(process.stderr)

const clientConnection = createMessageConnection(process.stdin, process.stdout)
const serverConnection = createMessageConnection(languageServer.stdout, languageServer.stdin)

const forwardNotification = (
  connection: Readonly<MessageConnection>,
  method: string,
  params: object | readonly unknown[] | undefined,
): void => {
  void connection.sendNotification(method, params)
}

clientConnection.onRequest((method, params, token) => {
  if (method === 'initialize') {
    state.rootUri = ((params || {}) as InitializeParams).rootUri || ''
  }
  return serverConnection.sendRequest(method, params, token)
})

clientConnection.onNotification((method, params) => {
  switch (method) {
    case 'textDocument/didChange': {
      const change = params as DidChangeTextDocumentParams | undefined
      const uri = change?.textDocument?.uri
      const text = change?.contentChanges?.at(-1)?.text
      if (typeof uri === 'string' && typeof text === 'string') {
        state.documents.set(uri, { text })
      }
      break
    }
    case 'textDocument/didClose': {
      const uri = (params as TextDocumentParams | undefined)?.textDocument?.uri
      if (typeof uri === 'string') {
        state.documents.delete(uri)
      }
      break
    }
    case 'textDocument/didOpen': {
      const textDocument = (params as TextDocumentParams | undefined)?.textDocument
      if (typeof textDocument?.uri === 'string' && typeof textDocument.text === 'string') {
        state.documents.set(textDocument.uri, { text: textDocument.text })
      }
      break
    }
  }
  forwardNotification(serverConnection, method, params)
  if (method === 'initialized') {
    forwardNotification(serverConnection, 'workspace/didChangeConfiguration', markdownLanguageServerConfiguration)
  }
})

serverConnection.onRequest((method, params, token) => {
  if (isMarkdownLanguageServerRequest(method)) {
    if (!state.rootUri) {
      throw new Error(`Markdown language server request received before initialization`)
    }
    return executeMarkdownLanguageServerRequest(method, params || {}, {
      getDocument: (uri) => state.documents.get(uri),
      rootUri: state.rootUri,
    })
  }
  return clientConnection.sendRequest(method, params, token)
})

serverConnection.onNotification((method, params) => {
  forwardNotification(clientConnection, method, params)
})

languageServer.on('exit', (code) => {
  clientConnection.dispose()
  serverConnection.dispose()
  process.exitCode = code ?? 1
})

process.on('exit', () => {
  languageServer.kill()
})

clientConnection.listen()
serverConnection.listen()
