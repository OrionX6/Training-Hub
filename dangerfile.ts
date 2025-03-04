import { danger, warn, fail, message } from 'danger';

// Info messages
message('Thank you for submitting a pull request! The team will review your changes soon.');

// Store PR details
const { additions = 0, deletions = 0 } = danger.github.pr;
const modifiedFiles = danger.git.modified_files;
const createdFiles = danger.git.created_files;
const deletedFiles = danger.git.deleted_files;
const changedFiles = [...modifiedFiles, ...createdFiles, ...deletedFiles];

// Check PR size
const bigPRThreshold = 500;
if (additions + deletions > bigPRThreshold) {
  warn(`This pull request is quite big (${additions} additions, ${deletions} deletions). Consider breaking it into smaller PRs.`);
}

// Check test coverage
const testFiles = changedFiles.filter(file => file.includes('.test.') || file.includes('.spec.'));
const sourceFiles = changedFiles.filter(file => 
  file.includes('src/') && 
  !file.includes('.test.') && 
  !file.includes('.spec.') &&
  !file.includes('.d.ts') &&
  (file.endsWith('.ts') || file.endsWith('.tsx'))
);

if (sourceFiles.length > 0 && testFiles.length === 0) {
  warn('This PR contains source code changes without corresponding test changes.');
}

// Check documentation
const docsFiles = changedFiles.filter(file => file.includes('.md') || file.includes('docs/'));
const hasCodeChanges = sourceFiles.length > 0;
if (hasCodeChanges && docsFiles.length === 0) {
  warn('Consider adding or updating documentation for your changes.');
}

// Check for console statements
const jsFiles = changedFiles.filter(file => 
  (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) &&
  !file.includes('.test.') &&
  !file.includes('.spec.')
);

jsFiles.forEach(file => {
  const content = danger.git.diffForFile(file);
  if (content && content.diff.includes('console.log')) {
    warn(`The file ${file} contains console.log statements. Please remove them.`);
  }
});

// Check for commented out code
jsFiles.forEach(file => {
  const content = danger.git.diffForFile(file);
  if (content && content.diff.match(/^[+]\s*\/\/.*\w+/m)) {
    warn(`The file ${file} contains commented out code. Please remove it if it's no longer needed.`);
  }
});

// Check dependency changes
const packageChanged = modifiedFiles.includes('package.json');
const lockfileChanged = modifiedFiles.includes('package-lock.json');
if (packageChanged && !lockfileChanged) {
  fail('Changes to package.json require a corresponding package-lock.json update.');
}

// Check for .env changes
if (modifiedFiles.includes('.env.example')) {
  message('When updating .env.example, make sure to update the documentation and CI/CD configuration if necessary.');
}

// Check PR title format
const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,50}/;
if (!conventionalCommitPattern.test(danger.github.pr.title)) {
  fail('Please use conventional commit format for your PR title.');
  message('Example formats: feat: add user profile, fix(auth): handle login errors');
}

// Check component organization
const newComponents = createdFiles.filter(file => 
  file.includes('/components/') && 
  (file.endsWith('.tsx') || file.endsWith('.ts'))
);

newComponents.forEach(component => {
  const hasTests = changedFiles.some(file => file === component.replace(/\.tsx?$/, '.test.tsx'));
  const hasTypes = changedFiles.some(file => file.includes(component.replace(/\.tsx?$/, '.types.ts')));
  
  if (!hasTests) {
    warn(`New component ${component} is missing test file.`);
  }
  if (!hasTypes && !component.includes('/shared/')) {
    warn(`Consider adding a separate types file for ${component}.`);
  }
});

// Check for sensitive information
const sensitivePatterns = [
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
];

changedFiles.forEach(file => {
  const content = danger.git.diffForFile(file);
  if (content) {
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(content.diff)) {
        fail(`Possible sensitive information found in ${file}. Please remove any secrets, API keys, or passwords.`);
      }
    });
  }
});

// Check branch naming convention
const branchPattern = /^(feature|fix|hotfix|release)\/[a-z0-9-]+$/;
if (!branchPattern.test(danger.github.pr.head.ref)) {
  warn('Branch name should follow convention: feature/*, fix/*, hotfix/*, release/*');
}

// Encourage smaller, focused commits
const commits = danger.github.commits;
if (commits.length > 10) {
  warn('This PR has too many commits. Consider squashing them.');
}

// Check for merge conflicts
if (danger.github.pr.mergeable === false) {
  fail('This PR has merge conflicts. Please resolve them before proceeding.');
}

// Remind about review requirements
if (!danger.github.requested_reviewers.length) {
  warn('Please request code review from team members.');
}
