# Deployment Guide

This guide explains the deployment process for the Training Hub application.

## Deployment Environments

The application can be deployed to three different environments:

- **Development** (`dev`): For local development and testing
- **Staging** (`staging`): For pre-production testing and verification
- **Production** (`prod`): For live production environment

## Prerequisites

Before deploying, ensure you have:

1. Node.js 18.x or higher installed
2. npm or yarn package manager
3. Access to the deployment environment
4. Required environment variables set
5. Supabase project configuration

## Environment Variables

Each environment requires its own set of environment variables. Create appropriate `.env` files:

```bash
# Development
cp .env.example .env.development

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

Required variables for all environments:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Commands

### Quick Deploy

Deploy to a specific environment:

```bash
# Development
npm run deploy:dev

# Staging
npm run deploy:staging

# Production
npm run deploy:prod
```

### Manual Deploy

For more control over the deployment process:

```bash
# Deploy with specific options
./scripts/deploy.sh [environment] [options]
```

Example:
```bash
./scripts/deploy.sh production --skip-tests
```

## Deployment Process

The deployment script performs the following steps:

1. **Environment Validation**
   - Checks required dependencies
   - Validates environment variables
   - Verifies access to required services

2. **Build Process**
   - Cleans previous builds
   - Installs dependencies
   - Runs tests
   - Builds application

3. **Deployment**
   - Uploads build artifacts
   - Updates configuration
   - Performs database migrations
   - Updates services

4. **Verification**
   - Checks deployment status
   - Verifies application health
   - Runs smoke tests

## Environment-Specific Notes

### Development

```bash
npm run deploy:dev
```

- Deploys to local development server
- Uses development database
- Enables debug features

### Staging

```bash
npm run deploy:staging
```

- Deploys to staging server
- Uses staging database
- Mirrors production configuration
- Enables feature flags for testing

### Production

```bash
npm run deploy:prod
```

- Requires additional verification
- Runs full test suite
- Performs database backups
- Uses production CDN
- Enables monitoring

## Continuous Integration

The project uses GitHub Actions for CI/CD:

- **Pull Requests**: Runs tests and builds
- **Staging**: Automatic deployment to staging
- **Production**: Manual approval required

## Rollback Procedure

In case of deployment issues:

1. Identify the issue
2. Run rollback command:
   ```bash
   ./scripts/deploy.sh rollback [environment]
   ```
3. Verify system status
4. Investigate and fix issues

## Monitoring

After deployment, monitor:

- Application logs
- Error rates
- Performance metrics
- Database health
- Server resources

## Troubleshooting

Common deployment issues and solutions:

### Build Failures

```bash
# Clean and rebuild
npm run clean
npm run build
```

### Database Issues

```bash
# Run migrations
npm run migrate

# Reset database (staging only)
npm run db:reset
```

### Environment Issues

```bash
# Validate environment
npm run validate
```

## Security Considerations

1. Never commit sensitive environment variables
2. Use secure deployment keys
3. Follow least privilege principle
4. Monitor security alerts
5. Keep dependencies updated

## Best Practices

1. Always test in staging first
2. Use semantic versioning
3. Document changes in changelog
4. Monitor deployment metrics
5. Keep rollback plans ready

## Additional Resources

- [Local Development Guide](./DEVELOPMENT.md)
- [Database Migration Guide](./MIGRATIONS.md)
- [Security Guidelines](./SECURITY.md)
- [Monitoring Guide](./MONITORING.md)

## Support

For deployment issues:
1. Check logs: `npm run logs`
2. Run diagnostics: `npm run diagnose`
3. Contact DevOps team
4. Submit issue with logs attached
