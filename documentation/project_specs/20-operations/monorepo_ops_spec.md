# Monorepo Operations Specification

## Overview

**Purpose**: Standardize day-to-day developer operations for the flowcn monorepo.

**Scope**: pnpm workspace management, package workflows, build processes, and testing.

**Version**: 0.0.0

## Monorepo Structure

### At-a-Glance

- **Package Manager**: pnpm (8.x+)
- **Workspace Root**: `/flowcn`
- **Packages**: `packages/core`, `packages/react`
- **Applications**: `apps/demo`

### Workspace Configuration

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

## Package Management

### Installing Dependencies

**Install All Dependencies**:
```bash
docker compose run --rm dev pnpm install
```

**Add Dependency to Specific Package**:
```bash
# Add to @flowcn/core
docker compose run --rm dev pnpm --filter @flowcn/core add <package>

# Add to @flowcn/react
docker compose run --rm dev pnpm --filter @flowcn/react add <package>

# Add to demo app
docker compose run --rm dev pnpm --filter demo add <package>
```

**Add Dev Dependency**:
```bash
docker compose run --rm dev pnpm --filter <package> add -D <dependency>
```

**Add Workspace Dependency**:
```bash
# Add @flowcn/core to @flowcn/react
docker compose run --rm dev pnpm --filter @flowcn/react add @flowcn/core
```

### Updating Dependencies

**Update All**:
```bash
docker compose run --rm dev pnpm update
```

**Update Specific Package**:
```bash
docker compose run --rm dev pnpm --filter @flowcn/core update <dependency>
```

**Interactive Update**:
```bash
docker compose run --rm dev pnpm update -i
```

## Building Packages

### Build Commands

**Build All Packages**:
```bash
docker compose run --rm dev pnpm build
```

**Build Specific Package**:
```bash
# Build core
docker compose run --rm dev pnpm --filter @flowcn/core build

# Build react
docker compose run --rm dev pnpm --filter @flowcn/react build
```

### Build Order

Packages must be built in dependency order:
1. `@flowcn/core` (no dependencies)
2. `@flowcn/react` (depends on core)

The workspace build command handles this automatically.

### Build Output

| Package | Output Directory | Formats |
|---------|-----------------|---------|
| `@flowcn/core` | `packages/core/dist/` | ESM, CJS |
| `@flowcn/react` | `packages/react/dist/` | ESM, CJS |

### Build Configuration

**Tool**: tsup

**tsup.config.ts Pattern**:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
```

## Testing

### Running Tests

**Run All Tests**:
```bash
docker compose run --rm dev pnpm test
```

**Run Tests for Specific Package**:
```bash
# Core package tests
docker compose run --rm dev pnpm --filter @flowcn/core test

# Watch mode
docker compose run --rm dev pnpm --filter @flowcn/core test:watch
```

**Run Specific Test File**:
```bash
docker compose run --rm dev pnpm --filter @flowcn/core test normalize.test.ts
```

### Test Configuration

**Framework**: Vitest

**vitest.config.ts Pattern**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

## Development Workflow

### Standard Workflow

1. **Start Dev Server**:
   ```bash
   docker compose up dev
   ```

2. **Make Changes**: Edit files in `packages/` or `apps/`

3. **Run Tests**:
   ```bash
   docker compose run --rm dev pnpm test
   ```

4. **Build** (before committing):
   ```bash
   docker compose run --rm dev pnpm build
   ```

### Package Development

When developing a package:

1. **Edit Source**: Make changes in `packages/<name>/src/`
2. **Run Tests**: Verify with `pnpm --filter <name> test`
3. **Test in Demo**: Changes are picked up automatically via workspace links

### Adding a New Package

1. **Create Directory Structure**:
   ```bash
   mkdir -p packages/<name>/src
   ```

2. **Create package.json**:
   ```json
   {
     "name": "@flowcn/<name>",
     "version": "0.0.0",
     "main": "./dist/index.js",
     "module": "./dist/index.mjs",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/index.mjs",
         "require": "./dist/index.js"
       }
     },
     "scripts": {
       "build": "tsup",
       "test": "vitest run",
       "test:watch": "vitest"
     }
   }
   ```

3. **Create Entry Point**: `packages/<name>/src/index.ts`

4. **Install Dependencies**: `pnpm install`

## Linting and Formatting

### ESLint

**Run Lint**:
```bash
docker compose run --rm dev pnpm lint
```

**Fix Lint Issues**:
```bash
docker compose run --rm dev pnpm lint --fix
```

### TypeScript Check

**Type Check All Packages**:
```bash
docker compose run --rm dev pnpm typecheck
```

## Version Management

### Semantic Versioning

Follow SemVer for all packages:
- **MAJOR**: Breaking changes to public API
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, internal changes

### Updating Versions

All packages share the same version:

1. Update version in `packages/core/package.json`
2. Update version in `packages/react/package.json`
3. Update `release_notes.md`

## Scripts Reference

### Root package.json Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `pnpm -r build` | Build all packages |
| `test` | `pnpm -r test` | Run all tests |
| `lint` | `eslint .` | Lint all code |
| `typecheck` | `tsc --noEmit` | Type check |

### Package-Level Scripts

| Script | Purpose |
|--------|---------|
| `build` | Build the package |
| `test` | Run tests |
| `test:watch` | Run tests in watch mode |

## Troubleshooting

### Common Issues

#### "Module not found" Errors

**Cause**: Package not built or workspace link broken

**Solution**:
```bash
docker compose run --rm dev pnpm install
docker compose run --rm dev pnpm build
```

#### TypeScript Errors After Changes

**Cause**: Type definitions out of sync

**Solution**:
```bash
# Rebuild packages
docker compose run --rm dev pnpm build

# Or restart TypeScript server in IDE
```

#### Test Failures

**Debugging**:
```bash
# Run specific test with verbose output
docker compose run --rm dev pnpm --filter @flowcn/core test -- --reporter=verbose
```

## References

- [Architecture Specification](../10-architecture/architecture_spec.md)
- [Docker Operations Specification](./docker_ops_spec.md)
- [Repository Specification](../10-architecture/repo_spec.md)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
