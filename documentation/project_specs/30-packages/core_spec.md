# @flowcn/core Package Specification

## Overview

**Purpose**: Define the architecture, APIs, and standards for the `@flowcn/core` package, which provides graph types, validation, and layout algorithms.

**Scope**: The `packages/core/` directory containing pure TypeScript logic with no UI dependencies.

**Version**: 0.0.0

## Package Description

`@flowcn/core` is a pure TypeScript library that provides:
- Type definitions for graph documents (`GraphDoc`, `Node`, `Edge`)
- Graph validation and diagnostics
- Graph normalization for deterministic processing
- Layout algorithms (layered, grid)
- Edge routing computation

**Key Principle**: This package has ZERO runtime dependencies and ZERO UI dependencies. It is pure TypeScript that can run in Node.js, browsers, or any JavaScript runtime.

## Directory Structure

```
packages/core/
├── src/
│   ├── index.ts           # Package entry point and exports
│   ├── types.ts           # Core type definitions
│   ├── normalize.ts       # Graph normalization
│   ├── normalize.test.ts  # Normalization tests
│   ├── validate.ts        # Graph validation
│   ├── validate.test.ts   # Validation tests
│   └── layout/
│       ├── index.ts       # Layout exports
│       ├── layered.ts     # Sugiyama-based layout
│       ├── grid.ts        # Grid fallback layout
│       └── layout.test.ts # Layout tests
├── dist/                  # Build output
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Core Types

### GraphDoc

The main document type representing a complete graph.

```typescript
interface GraphDoc {
  meta?: GraphMeta;      // Document metadata
  nodes: Node[];         // Graph nodes
  edges: Edge[];         // Graph edges
  groups?: Group[];      // Node groups (clusters)
  layout?: LayoutOptions; // Layout configuration
}
```

### Node

A node in the graph.

```typescript
interface Node {
  id: string;              // Required: Unique identifier
  label: string;           // Required: Display text
  type?: string;           // Semantic type for styling
  shape?: ShapeType;       // Visual shape
  color?: string;          // Fill color
  borderColor?: string;    // Border color
  group?: string;          // Group membership
  data?: Record<string, unknown>; // Custom data
  width?: number;          // Width hint
  height?: number;         // Height hint
}
```

### Edge

An edge connecting two nodes.

```typescript
interface Edge {
  id?: string;                    // Auto-generated if missing
  from: string;                   // Source node ID
  to: string;                     // Target node ID
  label?: string;                 // Display text
  lineStyle?: LineStyle;          // 'solid' | 'dashed' | 'dotted'
  curveType?: CurveType;          // 'straight' | 'elbow' | 'bezier'
  sourceEndpoint?: EndpointStyle; // Start point style
  targetEndpoint?: EndpointStyle; // End point style
  color?: string;                 // Edge color
  waypoints?: Point[];            // Manual routing points
  data?: Record<string, unknown>; // Custom data
}
```

### LayoutOptions

Configuration for layout algorithms.

```typescript
interface LayoutOptions {
  kind: 'layered' | 'grid';       // Layout algorithm
  direction: 'LR' | 'TB';         // Direction
  spacingX?: number;              // Horizontal spacing (default 100)
  spacingY?: number;              // Vertical spacing (default 80)
  padding?: number;               // Diagram padding (default 40)
  defaultNodeWidth?: number;      // Default node width (default 200)
  defaultNodeHeight?: number;     // Default node height (default 80)
}
```

### LayoutResult

Result of layout computation.

```typescript
interface LayoutResult {
  nodePositions: Record<string, NodePosition>;
  edgeRoutes: Record<string, EdgeRoute>;
  groupBoxes?: Record<string, GroupBox>;
  width: number;
  height: number;
}
```

## Public API

### normalizeGraph()

Prepares a graph for deterministic processing.

```typescript
function normalizeGraph(doc: GraphDoc): NormalizedGraph
```

**Operations**:
1. Assign IDs to edges without IDs (format: `from->to#index`)
2. Sort nodes by ID
3. Sort edges by ID
4. Sort groups by ID (if present)

**Guarantees**:
- Idempotent: Normalizing a normalized graph produces identical output
- Deterministic: Same input always produces same output

### validateGraph()

Validates a graph and returns diagnostics.

```typescript
function validateGraph(doc: GraphDoc): Diagnostic[]
```

**Checks**:
- Nodes must have unique IDs
- Nodes must have an `id` field
- Edges must have `from` and `to` fields
- Edges must reference existing nodes
- Edge IDs must be unique

**Returns**: Array of `Diagnostic` objects with `level`, `message`, and optional ID fields.

### layoutGraph()

Computes positions for all nodes and routes for all edges.

```typescript
function layoutGraph(
  doc: GraphDoc,
  options?: Partial<LayoutOptions>
): LayoutResult
```

**Algorithm Selection**:
- Uses `doc.layout.kind` or defaults to `'layered'`
- Layered layout falls back to grid if cycles detected

## Layout Algorithms

### Layered Layout (Sugiyama Framework)

Used for directed acyclic graphs (DAGs).

**Steps**:
1. **Cycle Detection**: DFS-based cycle detection
2. **Layer Assignment**: Topological sort using Kahn's algorithm
3. **Crossing Minimization**: Barycenter heuristic with multiple passes
4. **Position Assignment**: Nodes placed in layers with spacing
5. **Edge Routing**: Orthogonal connectors with waypoints

**Determinism Guarantees**:
- Queue sorted at each step
- Barycenter ties broken by node ID
- Stable sort throughout

**Complexity**: O(V + E) for layer assignment, O(passes × V × E) for crossing minimization

### Grid Layout

Used as fallback for cyclic graphs or when explicitly requested.

**Algorithm**:
- Calculate grid dimensions: `cols = ceil(sqrt(nodeCount))`
- Sort nodes by ID
- Place nodes in row-major order
- Route edges with simple orthogonal paths

**Complexity**: O(V log V + E)

### Edge Routing

**Orthogonal Routing**: Edges consist of horizontal and vertical segments only.

**Connection Points**:
- LR direction: Right of source to left of target
- TB direction: Bottom of source to top of target

**Arrowheads**: Configured via `targetEndpoint` (default: `'arrow'`)

## Testing Requirements

### Determinism Tests

Every layout algorithm MUST include determinism tests:

```typescript
it('should produce deterministic output', () => {
  const result1 = layoutGraph(doc);
  const result2 = layoutGraph(doc);
  expect(result1).toEqual(result2);
});
```

### Validation Tests

All validation rules must have corresponding tests:

```typescript
it('should detect duplicate node IDs', () => {
  const doc = {
    nodes: [
      { id: 'a', label: 'A' },
      { id: 'a', label: 'A Duplicate' },
    ],
    edges: [],
  };
  const diagnostics = validateGraph(doc);
  expect(diagnostics).toContainEqual(
    expect.objectContaining({
      level: 'error',
      message: expect.stringContaining('Duplicate'),
    })
  );
});
```

### Edge Case Tests

Required edge case coverage:
- Empty graph (no nodes, no edges)
- Single node graph
- Graph with only edges (invalid)
- Cyclic graphs
- Disconnected graphs
- Self-loop edges

## Adding a New Layout Algorithm

### Protocol

**Process**:
1. Create algorithm file in `src/layout/<name>.ts`
2. Implement function matching `LayoutAlgorithm` signature
3. Add export to `src/layout/index.ts`
4. Add to algorithm selection in `layoutGraph()`
5. Create comprehensive tests
6. Update documentation

**Requirements**:
- Must be deterministic (same input → same output)
- Must handle empty graphs
- Must include determinism test
- Must include edge case tests

### Algorithm Signature

```typescript
type LayoutAlgorithm = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
) => {
  nodePositions: Record<string, NodePosition>;
  edgeRoutes: Record<string, EdgeRoute>;
};
```

## Validation Checklist

### New Feature Checklist

- [ ] Types exported from `types.ts`
- [ ] Public functions exported from `index.ts`
- [ ] JSDoc comments on all exports
- [ ] Determinism tests written
- [ ] Edge case tests written
- [ ] No runtime dependencies added

### Code Quality Checklist

- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] Pure functions (no side effects)
- [ ] Collections sorted by ID before processing

## References

- [Architecture Specification](../10-architecture/architecture_spec.md)
- [Repository Specification](../10-architecture/repo_spec.md)
- [Documentation Specification](../00-governance/docs_spec.md)
