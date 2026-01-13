# flowcn Release Notes

## Overview

**Purpose**: Track release history, version changes, and upcoming features for flowcn.

**Scope**: All packages and applications in the flowcn monorepo.

**Version**: 0.0.0

## Current Versions

| Package | Version | Status |
|---------|---------|--------|
| `@flowcn/core` | 0.0.0 | Development |
| `@flowcn/react` | 0.0.0 | Development |
| `apps/demo` | 0.0.0 | Development |

## Version History

### v0.0.0 - Initial Development (2026-01-12)

**Status**: In Development

**Summary**: Initial project setup with core functionality.

#### @flowcn/core

**Features**:
- Graph document types (`GraphDoc`, `Node`, `Edge`, `Group`)
- Graph validation (`validateGraph`)
- Graph normalization (`normalizeGraph`)
- Layered layout algorithm (Sugiyama-based)
- Grid layout algorithm (fallback for cycles)
- Orthogonal edge routing

**Types**:
- `Node` - Graph node with id, label, type, shape, colors
- `Edge` - Graph edge with from, to, label, line styles
- `Group` - Node grouping (stub for future implementation)
- `LayoutOptions` - Layout algorithm configuration
- `LayoutResult` - Computed positions and routes
- `Diagnostic` - Validation error/warning messages

#### @flowcn/react

**Components**:
- `<Diagram>` - Main component for rendering graphs
- `<NodeCard>` - Renders nodes as shadcn/ui Cards
- `<EdgeSvg>` - Renders edges as SVG paths
- `<ConnectionIndicator>` - Shows connection preview in edit mode
- `<EdgeWaypoint>` - Handles edge waypoint manipulation

**Features**:
- Hover highlighting of nodes and incident edges
- Click selection with `onSelect` callback
- Keyboard navigation (Tab, Enter, Space)
- Editable mode with drag-and-drop
- Connection mode for adding edges
- Custom node shapes (rectangle, rounded, diamond, etc.)

#### apps/demo

**Pages**:
- `/` - Landing page with feature overview
- `/examples/editor` - Interactive editor example

**Components**:
- `DiagramControls` - Layout kind, direction controls
- `NodeInspector` - Shows selected node details
- `ShapePalette` - Shape selection UI
- `EdgePropertiesPanel` - Edge style configuration

### Known Limitations (v0.0.0)

**MVP Constraints**:
- No group box rendering (types defined, rendering stub)
- No zoom/pan controls
- No edge editing or rerouting
- Limited to orthogonal edges (no splines)

**Cycle Handling**:
- Graphs with cycles fall back to grid layout

## Upgrade Guide

### From Pre-release to 0.0.0

This is the initial release. No upgrade path required.

## Upcoming Features

### Priority 1: Group Box Rendering

**Target**: v0.1.0

Visual group boxes with:
- Background rectangles
- Group labels
- Nested groups support

### Priority 2: Zoom and Pan

**Target**: v0.1.0

Viewport controls:
- Mouse wheel zoom
- Pan via drag
- Zoom to fit
- Reset view button

### Priority 3: Animation

**Target**: v0.2.0

Layout transitions:
- Animate node position changes
- Animate edge path changes
- Stagger entrance animations

### Priority 4: Export

**Target**: v0.2.0

Diagram export:
- Export to PNG
- Export to SVG
- Export to JSON (already supported via GraphDoc)

## Breaking Changes Log

### v0.0.0

No breaking changes (initial release).

## Deprecations

### v0.0.0

- `Edge.kind` property deprecated in favor of `Edge.lineStyle`
  - `kind: 'solid'` → `lineStyle: 'solid'`
  - `kind: 'dashed'` → `lineStyle: 'dashed'`

## Release Process

### Pre-Release Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Version numbers updated in all `package.json` files
- [ ] Release notes updated
- [ ] No TypeScript errors (`pnpm typecheck`)

### Release Steps

1. Update version in all package.json files
2. Update this release notes file
3. Build all packages: `docker compose run --rm dev pnpm build`
4. Run tests: `docker compose run --rm dev pnpm test`
5. Commit changes: `git commit -m "chore: release v0.x.x"`
6. Tag release: `git tag v0.x.x`
7. Push: `git push && git push --tags`

## References

- [Architecture Specification](../10-architecture/architecture_spec.md)
- [Monorepo Operations Specification](./monorepo_ops_spec.md)
- [Core Package Specification](../30-packages/core_spec.md)
- [React Package Specification](../30-packages/react_spec.md)
