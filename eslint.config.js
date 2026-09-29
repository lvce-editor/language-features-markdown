import { defineConfig } from 'eslint/config'
import * as config from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config.default,
  {
    // The application runtime has its own Node version in the pinned checkout.
    files: ['.github/workflows/integration.yml'],
    rules: { 'github-actions/node-version-file': 'off' },
  },
])
