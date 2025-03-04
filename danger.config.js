module.exports = {
  // Danger runs the dangerfile.ts by default
  dangerfile: './dangerfile.ts',

  // Configure GitHub token source
  GITHUB_TOKEN: process.env.DANGER_GITHUB_API_TOKEN || process.env.GITHUB_TOKEN,

  // Configure Danger settings
  settings: {
    // Fail PR on errors
    failOnErrors: true,

    // GitHub API settings
    github: {
      // Base branch for comparing changes
      baseURL: 'https://api.github.com',
      
      // Configure GitHub API headers
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      
      // Repository info for Danger
      repoSlug: process.env.GITHUB_REPOSITORY,
      
      // PR number from GitHub Actions
      pullRequestNumber: process.env.GITHUB_EVENT_NAME === 'pull_request' 
        ? process.env.GITHUB_EVENT_NUMBER 
        : null,
    },

    // Configure Git settings
    git: {
      // Show more context in diffs
      diffLines: 3,
      
      // Include merge commits in analysis
      skipMergeCommits: false,
    },
  },

  // Configure markdown output
  markdown: {
    // Emoji mapping for status messages
    emoji: {
      success: ':white_check_mark:',
      failure: ':x:',
      warning: ':warning:',
      message: ':memo:',
    },

    // Headers for different sections
    headers: {
      summary: 'PR Analysis Summary',
      warnings: 'Warnings',
      errors: 'Errors',
      messages: 'Notes',
    },
  },

  // Configure rules
  rules: {
    // Common patterns to check in changed files
    common: {
      // Patterns that should fail the PR
      preventMatch: [
        // Prevent debug statements
        'debugger;',
        'console.log(',
        
        // Prevent security issues
        'eval(',
        'localStorage.',
        'sessionStorage.',
        
        // Prevent TODOs
        'TODO:',
        'FIXME:',
      ],
      
      // File patterns to ignore
      ignore: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/jest.config.js',
        '**/setupTests.ts',
      ],
    },

    // Size limits for changes
    sizes: {
      // Maximum number of changed files
      maxFiles: 50,
      
      // Maximum lines changed
      maxLines: 1000,
      
      // Maximum size of PR in bytes
      maxBytes: 500000,
    },

    // Test coverage requirements
    coverage: {
      // Minimum coverage percentage
      minCoverage: 80,
      
      // Files that must be covered
      requiredFiles: [
        'src/components/**/*.tsx',
        'src/services/**/*.ts',
        'src/utils/**/*.ts',
      ],
    },
  },

  // Plugin configurations
  plugins: {
    // Spellcheck configuration
    spellcheck: {
      ignore: [
        'supabase',
        'tsx',
        'js',
        'ts',
        'npm',
        'eslint',
        'prettier',
      ],
    },

    // Label configuration
    labels: {
      // Labels to add based on changes
      rules: {
        'dependencies': ['package.json', 'yarn.lock', 'package-lock.json'],
        'documentation': ['**/*.md', 'docs/**/*'],
        'tests': ['**/*.test.*', '**/*.spec.*'],
        'configuration': ['.*rc', '*.config.js', '*.config.ts'],
      },
    },
  },
};
