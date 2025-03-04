#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

// Helper function to execute commands
const exec = (command, options = {}) => {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
};

// Available commands
const commands = {
  up() {
    console.log('Starting development environment...');
    exec('docker-compose up --build');
  },

  down() {
    console.log('Stopping development environment...');
    exec('docker-compose down');
  },

  rebuild() {
    console.log('Rebuilding containers...');
    exec('docker-compose down');
    exec('docker-compose build --no-cache');
    exec('docker-compose up');
  },

  clean() {
    console.log('Cleaning Docker environment...');
    exec('docker-compose down -v');
    exec('docker system prune -f');
    
    // Remove development artifacts
    const artifacts = [
      'node_modules',
      'build',
      'coverage',
      '.cache'
    ];

    artifacts.forEach(artifact => {
      const artifactPath = path.join(process.cwd(), artifact);
      if (fs.existsSync(artifactPath)) {
        console.log(`Removing ${artifact}...`);
        fs.rmSync(artifactPath, { recursive: true, force: true });
      }
    });
  },

  logs() {
    const service = args[1] || '';
    exec(`docker-compose logs ${service} -f`);
  },

  shell() {
    const service = args[1] || 'app';
    exec(`docker-compose exec ${service} sh`);
  },

  test() {
    console.log('Running tests in Docker container...');
    exec('docker-compose exec app npm test');
  },

  lint() {
    console.log('Running linter in Docker container...');
    exec('docker-compose exec app npm run lint');
  },

  help() {
    console.log(`
Docker Development Commands:
  up        - Start the development environment
  down      - Stop the development environment
  rebuild   - Rebuild and restart containers
  clean     - Clean Docker environment and artifacts
  logs      - View logs (optionally specify service)
  shell     - Open shell in container (default: app)
  test      - Run tests in Docker container
  lint      - Run linter in Docker container
  help      - Show this help message
    `);
  }
};

// Execute command
if (commands[command]) {
  commands[command]();
} else {
  console.error(`Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}
