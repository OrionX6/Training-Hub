#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const command = args[0];

// Helper to execute shell commands
const execute = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        reject(error);
        return;
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

// Helper to spawn processes
const spawnProcess = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', ...options });
    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
};

// Command implementations
const commands = {
  async dev() {
    // Check if supabase is running
    try {
      await execute('supabase status');
    } catch (error) {
      console.log('Starting Supabase...');
      await execute('supabase start');
    }
    
    // Start development server
    await spawnProcess('npm', ['start']);
  },

  async build() {
    console.log('Running type check...');
    await execute('tsc --noEmit');
    
    console.log('Running tests...');
    await execute('npm test -- --watchAll=false');
    
    console.log('Building application...');
    await execute('npm run build');
  },

  async test() {
    const testPath = args[1] || '';
    await spawnProcess('npm', ['test', testPath]);
  },

  async lint() {
    const fix = args.includes('--fix');
    await execute(`npm run lint${fix ? ':fix' : ''}`);
  },

  async clean() {
    const paths = [
      'build',
      'node_modules/.cache',
      'coverage'
    ];

    for (const p of paths) {
      const fullPath = path.join(process.cwd(), p);
      if (fs.existsSync(fullPath)) {
        console.log(`Removing ${p}...`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    }
    console.log('Clean completed');
  },

  async setup() {
    console.log('Installing dependencies...');
    await execute('npm install');

    console.log('Setting up Supabase...');
    await execute('supabase init');
    await execute('supabase start');

    console.log('Running migrations...');
    await execute('supabase db reset');

    console.log('Setup complete! You can now run `npm run dev` to start development');
  },

  help() {
    console.log(`
Available commands:
  dev     - Start development environment (includes Supabase)
  build   - Build the application with type checking and tests
  test    - Run tests (optionally specify path)
  lint    - Run linting (--fix to auto-fix issues)
  clean   - Clean build artifacts and caches
  setup   - Initial project setup
  help    - Show this help message
    `);
  }
};

// Execute command
if (commands[command]) {
  commands[command]()
    .catch(error => {
      console.error('Error executing command:', error);
      process.exit(1);
    });
} else {
  console.error(`Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}
