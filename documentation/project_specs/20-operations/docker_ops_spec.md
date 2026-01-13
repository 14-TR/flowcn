# Docker Operations Specification

## Overview

**Purpose**: Standardize Docker-based development environment operations for flowcn.

**Scope**: Docker Compose commands, container lifecycle, volume management, and troubleshooting.

**Version**: 0.0.0

## Docker-First Approach

### Philosophy

flowcn uses a Docker-first development approach:
- **No host dependencies**: Developers do not need Node.js, npm, pnpm, or any build tools installed
- **Consistent environment**: All developers use the same Node.js version and dependencies
- **Simple startup**: Single command to start development

### Prerequisites

**Required**:
- Docker (20.10+)
- Docker Compose (2.0+)
- Git

**Not Required**:
- Node.js
- npm/pnpm/yarn
- Any build tools

## Docker Compose Services

### Service Definitions

| Service | Purpose | Port | Command |
|---------|---------|------|---------|
| `dev` | Development server with hot reload | 3000 | `docker compose up dev` |

### Container Configuration

**Base Image**: `node:20-alpine`

**Working Directory**: `/app`

**Volumes**:
- `.:/app` - Source code mount
- `node_modules:/app/node_modules` - Named volume for dependencies
- `pnpm-store:/root/.local/share/pnpm/store` - pnpm store cache

## Development Commands

### Starting Development

**Start Development Server**:
```bash
# Using Docker Compose
docker compose up dev

# Using Makefile (Linux/macOS)
make dev
```

**Start in Background**:
```bash
docker compose up -d dev
```

**View Logs**:
```bash
docker compose logs -f dev
```

### Running Commands in Container

**Interactive Shell**:
```bash
docker compose run --rm dev sh
```

**Run pnpm Commands**:
```bash
# Install dependencies
docker compose run --rm dev pnpm install

# Run tests
docker compose run --rm dev pnpm test

# Build packages
docker compose run --rm dev pnpm build

# Run specific package tests
docker compose run --rm dev pnpm --filter @flowcn/core test
```

### Stopping and Cleanup

**Stop Containers**:
```bash
docker compose down
```

**Stop and Remove Volumes** (clean slate):
```bash
docker compose down -v
```

**Full Cleanup** (using Makefile):
```bash
make clean
```

## Volume Management

### Named Volumes

| Volume | Purpose | When to Clear |
|--------|---------|---------------|
| `node_modules` | Package dependencies | When dependencies are corrupted |
| `pnpm-store` | pnpm package cache | Rarely needed |

### Clearing Volumes

**Clear All Volumes**:
```bash
docker compose down -v
docker compose up dev
```

**Rebuild from Scratch**:
```bash
# Remove containers, networks, and volumes
docker compose down -v

# Remove any orphaned containers
docker compose down --remove-orphans

# Rebuild and start
docker compose up --build dev
```

## File Watching

### Hot Reload Configuration

**Polling Mode**: Enabled for cross-platform compatibility

**Watch Configuration**: Turbopack handles file watching in the Next.js demo

### Watch Behavior

- Source file changes in `packages/` trigger rebuilds
- Demo app changes in `apps/demo/` trigger hot reload
- Changes to `package.json` require container restart

## Makefile Commands

### Available Targets

| Target | Description | Command |
|--------|-------------|---------|
| `dev` | Start development server | `make dev` |
| `test` | Run all tests | `make test` |
| `build` | Build all packages | `make build` |
| `install` | Install dependencies | `make install` |
| `shell` | Open container shell | `make shell` |
| `clean` | Remove containers and volumes | `make clean` |

### Makefile Source

```makefile
.PHONY: dev test build install shell clean

dev:
	docker compose up dev

test:
	docker compose run --rm dev pnpm test

build:
	docker compose run --rm dev pnpm build

install:
	docker compose run --rm dev pnpm install

shell:
	docker compose run --rm dev sh

clean:
	docker compose down -v
	docker system prune -f
```

## Troubleshooting

### Common Issues

#### Container Won't Start

**Symptom**: `docker compose up` fails or container exits immediately

**Solutions**:
1. Check Docker is running: `docker info`
2. Check port availability: `lsof -i :3000`
3. Rebuild containers: `docker compose up --build dev`

#### Dependencies Not Installing

**Symptom**: Module not found errors

**Solutions**:
1. Clear volumes and reinstall:
   ```bash
   docker compose down -v
   docker compose run --rm dev pnpm install
   docker compose up dev
   ```

#### Hot Reload Not Working

**Symptom**: Changes not reflected in browser

**Solutions**:
1. Check file watching is enabled
2. Restart the container: `docker compose restart dev`
3. Clear Next.js cache:
   ```bash
   docker compose run --rm dev rm -rf apps/demo/.next
   docker compose up dev
   ```

#### Port Already in Use

**Symptom**: `bind: address already in use`

**Solutions**:
1. Find and kill the process:
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```
2. Use a different port:
   ```bash
   docker compose run --rm -p 3001:3000 dev pnpm --filter demo dev
   ```

### Debugging

**View Container Logs**:
```bash
docker compose logs dev
```

**View Live Logs**:
```bash
docker compose logs -f dev
```

**Inspect Container**:
```bash
docker compose exec dev sh
```

**Check Container Status**:
```bash
docker compose ps
```

## Windows-Specific Notes

### PowerShell Commands

Use the PowerShell script for Windows:
```powershell
.\scripts\dev.ps1
```

### Line Endings

Ensure Git is configured for proper line endings:
```bash
git config --global core.autocrlf input
```

### Docker Desktop

- Enable WSL 2 backend for better performance
- Ensure sufficient memory allocation (4GB+ recommended)

## Performance Optimization

### Speed Tips

1. **Use Named Volumes**: Already configured for `node_modules`
2. **Limit Context**: `.dockerignore` excludes unnecessary files
3. **Layer Caching**: Dockerfile optimized for cache utilization

### Memory Configuration

If builds are slow, increase Docker memory allocation:
- Docker Desktop → Preferences → Resources → Memory → 4GB+

## References

- [Architecture Specification](../10-architecture/architecture_spec.md)
- [Monorepo Operations Specification](./monorepo_ops_spec.md)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
