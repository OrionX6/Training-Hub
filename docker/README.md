# Docker Development Environment

This guide explains how to use Docker for development in the Training Hub project.

## Prerequisites

- Docker Engine 20.10.0 or later
- Docker Compose 2.0.0 or later
- Node.js 18.x (for local development tools)

## Quick Start

1. Clone the repository and navigate to the project directory:
```bash
git clone <repository-url>
cd training-hub
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Start the development environment:
```bash
npm run docker:dev
```

## Available Commands

### Development Environment
- `npm run docker:dev` - Start development environment
- `npm run docker:down` - Stop development environment
- `npm run docker:rebuild` - Rebuild and restart containers
- `npm run docker:clean` - Clean Docker environment and artifacts

### Utilities
- `npm run docker:logs [service]` - View logs (optionally specify service)
- `npm run docker:shell [service]` - Open shell in container (default: app)
- `npm run docker:test` - Run tests in Docker container
- `npm run docker:lint` - Run linter in Docker container

## Service Architecture

The development environment consists of the following services:

- **app**: React application (port 3000)
- **supabase**: PostgreSQL database (port 54322)
- **supabase-studio**: Supabase Studio (port 3001)
- **meta**: Postgres Meta API (port 8080)
- **mailhog**: Email testing (SMTP: 1025, UI: 8025)
- **adminer**: Database management (port 8081)

## Development Workflow

1. Start the environment:
```bash
npm run docker:dev
```

2. Access the services:
- React App: http://localhost:3000
- Supabase Studio: http://localhost:3001
- Mailhog UI: http://localhost:8025
- Adminer: http://localhost:8081

3. Make changes to your code - hot reloading is enabled

4. Run tests:
```bash
npm run docker:test
```

5. Access container shell:
```bash
npm run docker:shell
```

## Database Management

### Using Adminer
1. Access Adminer at http://localhost:8081
2. Login details:
   - System: PostgreSQL
   - Server: supabase
   - Username: postgres
   - Password: postgres
   - Database: postgres

### Using Supabase Studio
1. Access Studio at http://localhost:3001
2. Use the UI to manage your database

## Troubleshooting

### Common Issues

1. Port conflicts
```bash
# Stop all containers and remove volumes
npm run docker:clean

# Restart with fresh containers
npm run docker:dev
```

2. Node modules issues
```bash
# Rebuild the app container
npm run docker:rebuild
```

3. Database connection issues
```bash
# Check database logs
npm run docker:logs supabase

# Access database shell
npm run docker:shell supabase
```

### Debug Tools

- Check container status:
```bash
docker-compose ps
```

- View detailed logs:
```bash
docker-compose logs -f [service]
```

- Reset environment:
```bash
npm run docker:clean && npm run docker:dev
```

## Best Practices

1. Always use `npm run docker:down` to stop the environment properly

2. Run tests inside Docker to ensure consistency:
```bash
npm run docker:test
```

3. Use `npm run docker:shell` for debugging inside containers

4. Keep your images up to date:
```bash
docker-compose pull
```

5. Clean up unused resources periodically:
```bash
npm run docker:clean
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Supabase Documentation](https://supabase.io/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/reference/)
