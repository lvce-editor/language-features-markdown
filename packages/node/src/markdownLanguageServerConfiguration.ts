export const markdownLanguageServerConfiguration = {
  settings: {
    markdown: {
      occurrencesHighlight: {
        enabled: true,
      },
      preferredMdPathExtensionStyle: 'auto',
      server: {
        log: 'off',
      },
      suggest: {
        paths: {
          enabled: true,
          includeWorkspaceHeaderCompletions: 'never',
        },
      },
      validate: {
        duplicateLinkDefinitions: {
          enabled: 'warning',
        },
        enabled: true,
        fileLinks: {
          enabled: 'warning',
          markdownFragmentLinks: 'inherit',
        },
        fragmentLinks: {
          enabled: 'warning',
        },
        ignoredLinks: [],
        referenceLinks: {
          enabled: 'warning',
        },
        unusedLinkDefinitions: {
          enabled: 'warning',
        },
      },
    },
  },
} as const
