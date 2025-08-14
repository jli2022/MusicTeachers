# Docker Deployment Guide

## Overview

The Music Teachers Platform can be deployed using Docker for both development and production environments. This guide covers:

- **Production deployment** with optimized builds
- **Development environment** with hot reloading
- **Database management** in containers
- **Troubleshooting** common issues

## Files Overview

- `Dockerfile` - Production build configuration
- `Dockerfile.dev` - Development build configuration
- `docker-compose.yml` - Production stack (app + PostgreSQL)
- `docker-compose.dev.yml` - Development stack with hot reload
- `docker-entrypoint.sh` - Container initialization script

## Production Deployment

### Quick Start
```bash
# Start all services
docker compose up -d

# Initialize database
docker exec music-teachers-app npx prisma db push

# Check status
docker compose ps

# View logs
docker compose logs -f app
```

### Services
- **app**: Next.js application on port 3002
- **postgres**: PostgreSQL database on port 5432

### Environment Variables
Production environment variables are set in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/musicteachers?schema=public
  - NEXTAUTH_SECRET=your-secret-key-change-this-in-production
  - NEXTAUTH_URL=http://localhost:3002
```

**⚠️ Important**: Change the `NEXTAUTH_SECRET` and database password for production deployments.

## Development Environment

### Hot Reload Development
```bash
# Start development stack
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f app-dev
```

This setup:
- Mounts source code for hot reloading
- Uses development database on port 5433
- Runs `npm run dev` inside container

## Database Management

### Schema Management
```bash
# Push schema changes
docker exec music-teachers-app npx prisma db push

# Create migrations
docker exec music-teachers-app npx prisma migrate dev

# Generate Prisma client
docker exec music-teachers-app npx prisma generate

# Open Prisma Studio
docker exec music-teachers-app npx prisma studio
```

### Direct Database Access
```bash
# Connect to production DB
docker exec -it music-teachers-db psql -U postgres -d musicteachers

# Connect to development DB
docker exec -it music-teachers-db-dev psql -U postgres -d musicteachers_dev
```

### Backup and Restore
```bash
# Backup database
docker exec music-teachers-db pg_dump -U postgres musicteachers > backup.sql

# Restore database
docker exec -i music-teachers-db psql -U postgres musicteachers < backup.sql
```

## Port Configuration

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| app | 3002 | 3000 | Next.js Application |
| postgres | 5432 | 5432 | PostgreSQL Database |
| app-dev | 3000 | 3000 | Development App |
| postgres-dev | 5433 | 5432 | Development Database |

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
lsof -i :3002

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

**Database connection errors:**
```bash
# Check database health
docker compose logs postgres

# Test database connection
docker exec music-teachers-db pg_isready -U postgres
```

**Build failures:**
```bash
# Clean build cache
docker builder prune -f

# Remove all containers and rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Permission issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild with fresh volumes
docker compose down -v
docker compose up -d
```

**Out of disk space:**
```bash
# Clean Docker system
docker system prune -a -f

# Remove unused volumes
docker volume prune -f
```

### Logs and Debugging

```bash
# View all logs
docker compose logs

# Follow specific service logs
docker compose logs -f app
docker compose logs -f postgres

# Shell into container
docker exec -it music-teachers-app sh

# Check container resources
docker stats
```

## Production Deployment Checklist

- [ ] Change default PostgreSQL password
- [ ] Update `NEXTAUTH_SECRET` with secure random string
- [ ] Configure proper domain in `NEXTAUTH_URL`
- [ ] Set up reverse proxy (nginx/traefik) for HTTPS
- [ ] Configure backup strategy for database
- [ ] Set up log aggregation
- [ ] Configure monitoring (health checks)
- [ ] Review security settings

## Advanced Configuration

### Custom Environment Variables
Create a `.env` file for environment-specific configurations:

```bash
# .env
POSTGRES_PASSWORD=your-secure-password
NEXTAUTH_SECRET=your-secure-secret-key
APP_PORT=3002
DB_PORT=5432
```

Reference in docker-compose.yml:
```yaml
env_file:
  - .env
```

### Multi-stage Builds
The production Dockerfile uses multi-stage builds for optimization:
- **deps**: Install dependencies
- **builder**: Build application
- **runner**: Final runtime image

### Health Checks
PostgreSQL includes health checks:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

Add health checks to the app service for production monitoring.