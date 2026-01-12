# flowcn Design Documentation

## Overview

flowcn is an interactive, deterministic flow diagram renderer that treats diagrams as real UI components rather than static SVG. This design document describes the architecture, algorithms, and guarantees provided by the system.

## Core Principles

### 1. Determinism

**Guarantee**: The same input graph always produces the same layout output.

**Implementation**:
- All nodes and edges are sorted by ID before processing
- Layout algorithms use stable sorting with ID tiebreakers
- Edge IDs are auto-generated deterministically from source, target, and index
- No randomness or timestamps in any computation

**Benefits**:
- Predictable rendering across sessions
- Reliable testing and debugging
- Version control friendly (diffs show actual changes)

### 2. Real UI Components

**Nodes as Cards**: Unlike traditional diagram libraries that render everything as SVG, flowcn renders nodes as actual DOM elements using shadcn/ui Card components.

**Benefits**:
- Native browser interactions (focus, hover, accessibility)
- CSS-based styling with Tailwind
- Better text rendering and selection
- Easier integration with UI component libraries

**Trade-offs**:
- More complex positioning (absolute positioning required)
- SVG overlay needed for edges
- Slightly higher DOM node count

### 3. Docker-First Development

**No Host Dependencies**: Developers do not need to install Node, npm, pnpm, or any build tools.

**Implementation**:
- Multi-stage Dockerfile for dev and prod
- Named volumes for node_modules persistence
- File watching with polling for cross-platform compatibility
- Single command startup: `docker compose up`

## Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────┐
│           apps/demo                     │
│     (Next.js + UI Components)           │
├─────────────────────────────────────────┤
│         packages/react                  │
│  (Diagram, NodeCard, EdgeSvg)           │
├─────────────────────────────────────────┤
│         packages/core                   │
│  (Types, Validation, Layout)            │
└─────────────────────────────────────────┘
```

**packages/core**: Pure TypeScript with no UI dependencies. Handles graph data structures, validation, and layout computation.

**packages/react**: React components that consume core types and render interactive diagrams.

**apps/demo**: Next.js application showcasing examples with controls and inspector panels.

## Layout Algorithms

### Layered Layout (Sugiyama Framework)

Used for directed acyclic graphs (DAGs).

**Steps**:

1. **Cycle Detection**: DFS-based cycle detection. If cycles found, fall back to grid.

2. **Layer Assignment**: Topological sort using Kahn's algorithm places nodes in layers.

3. **Crossing Minimization**: Barycenter heuristic with multiple passes to reduce edge crossings.

4. **Position Assignment**: Nodes placed in layers with configurable spacing.

5. **Edge Routing**: Orthogonal connectors with intermediate waypoints.

**Determinism**:
- Queue sorted at each step
- Barycenter ties broken by node ID
- Stable sort throughout

**Complexity**: O(V + E) for layer assignment, O(passes * V * E) for crossing minimization

### Grid Layout

Used as fallback for cyclic graphs or when explicitly requested.

**Algorithm**:
- Calculate grid dimensions: `cols = ceil(sqrt(nodeCount))`
- Sort nodes by ID
- Place nodes in row-major order
- Route edges with simple orthogonal paths

**Determinism**: Sorting by ID ensures consistent placement.

**Complexity**: O(V log V + E)

### Edge Routing

**Orthogonal Routing**: Edges consist of horizontal and vertical segments only.

**Connection Points**:
- LR direction: Right of source to left of target
- TB direction: Bottom of source to top of target

**Arrowheads**: SVG marker elements positioned at edge endpoints.

**Label Placement**: Labels positioned at the midpoint of the edge path.

## Data Flow

```
User Input (GraphDoc)
    ↓
normalizeGraph()  → Sorted nodes/edges, stable IDs
    ↓
validateGraph()   → Diagnostics (errors/warnings)
    ↓
layoutGraph()     → NodePositions + EdgeRoutes
    ↓
<Diagram>         → Render Cards + SVG
```

## Validation

**Purpose**: Catch common errors before layout and rendering.

**Checks**:
- Missing node IDs (error)
- Duplicate node IDs (error)
- Edges referencing non-existent nodes (error)
- Duplicate edge IDs (error)
- Nodes referencing non-existent groups (warning)

**Output**: Array of `Diagnostic` objects with level, message, and relevant IDs.

## Normalization

**Purpose**: Prepare graphs for deterministic processing.

**Operations**:
1. Assign IDs to edges without IDs (format: `from->to#index`)
2. Sort nodes by ID
3. Sort edges by ID
4. Sort groups by ID (if present)

**Idempotence**: Normalizing a normalized graph produces identical output.

## Interactions

### Hover

**Behavior**: When a node is hovered, it and all incident edges are highlighted.

**Implementation**:
- `hoveredNodeId` state tracks current hover
- `getIncidentEdges()` finds connected edges
- CSS classes applied for highlight styling

### Click/Selection

**Behavior**: Clicking a node selects it and calls the `onSelect` callback.

**Implementation**:
- `selectedNodeId` state tracks selection
- `onClick` handler updates state and invokes callback
- Visual feedback via ring styling

### Keyboard Navigation

**Behavior**: Tab cycles focus through nodes, Enter/Space selects.

**Implementation**:
- Each NodeCard has `tabIndex={0}` and `role="button"`
- `onKeyDown` handler intercepts Enter/Space
- Follows WAI-ARIA button pattern

## Styling

**Approach**: Tailwind CSS classes with shadcn/ui theme variables.

**Theme**: CSS custom properties for colors (--background, --foreground, etc.)

**Node Styling**:
- Base: Card with border and shadow
- Hover: Increased shadow and scale
- Selected: Ring with offset

**Edge Styling**:
- Default: Gray stroke (slate-400)
- Highlighted: Blue stroke (blue-500)
- Dashed: Configurable via `kind` field

## Testing Strategy

### Unit Tests

**Location**: `packages/core/src/**/*.test.ts`

**Focus**:
- Determinism: Same input produces identical output
- Validation: All error cases caught
- Edge cases: Empty graphs, single nodes, cycles

**Framework**: Vitest with Node environment

### Integration Tests

Not yet implemented (stub for future).

**Proposed Focus**:
- Full layout pipeline
- React component rendering
- Interaction handling

## Performance Considerations

### Layout Computation

**Current**: Acceptable for graphs up to ~100 nodes. Layered layout with crossing minimization is O(n^2) in worst case.

**Future Optimizations**:
- Limit crossing minimization passes
- Cache layout results with content hash
- Web Worker for large graphs

### Rendering

**Current**: React renders all nodes as DOM elements. Acceptable for ~100 nodes.

**Future Optimizations**:
- Virtualization for large diagrams
- Canvas fallback for >500 nodes
- Culling for off-screen nodes

## Extensibility Points

### Custom Node Renderers

Currently not supported, but designed for extension:

```typescript
// Future API (stub)
<Diagram
  doc={doc}
  nodeRenderer={(node) => <CustomNode node={node} />}
/>
```

### Custom Layout Algorithms

Export interface allows third-party layouts:

```typescript
// Future API (stub)
function myCustomLayout(
  graph: NormalizedGraph,
  options: LayoutOptions
): LayoutResult {
  // Custom logic
}
```

### Group/Cluster Rendering

Types defined but rendering not implemented:

```typescript
export interface GroupBox {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
}
```

**Future**: Render group boxes as background rectangles with labels.

## Known Limitations

### MVP Constraints

- No drag-and-drop editing
- No group box rendering (types defined, rendering stub)
- No zoom/pan (can be added via transform)
- No edge editing or rerouting
- Limited to orthogonal edges (no splines)

### Cycle Handling

Graphs with cycles fall back to grid layout. Future versions may support:
- Cycle breaking (remove minimal edges to create DAG)
- Hierarchical layout with back-edges

## Future Enhancements

### Priority 1: Group Box Rendering

Implement visual group boxes with:
- Background rectangles
- Group labels
- Nested groups support

### Priority 2: Zoom and Pan

Add viewport controls:
- Mouse wheel zoom
- Pan via drag
- Zoom to fit
- Reset view button

### Priority 3: Animation

Add layout transitions:
- Animate node position changes
- Animate edge path changes
- Stagger entrance animations

### Priority 4: Export

Support diagram export:
- Export to PNG (via html2canvas)
- Export to SVG (convert DOM to SVG)
- Export to JSON (already supported via GraphDoc)

## Comparison to Alternatives

### vs Mermaid

**flowcn Advantages**:
- Real UI components vs static SVG
- Interactive (hover, click, keyboard)
- Type-safe API
- Deterministic layout

**Mermaid Advantages**:
- More diagram types (sequence, gantt, etc.)
- DSL syntax (text-based)
- Mature ecosystem

### vs react-flow

**flowcn Advantages**:
- Deterministic automatic layout
- Simpler API for read-only diagrams
- No external dependencies (besides React)

**react-flow Advantages**:
- Drag-and-drop editing
- Built-in zoom/pan
- Mini-map and controls
- Plugin ecosystem

### vs D3 Force Layout

**flowcn Advantages**:
- Deterministic (not physics-based)
- Hierarchical structure preserved
- Faster convergence

**D3 Advantages**:
- More natural for non-hierarchical graphs
- Flexible force customization
- Mature library

## Summary

flowcn provides a deterministic, Docker-first, component-based approach to rendering flow diagrams. Its three-layer architecture separates concerns while maintaining type safety. The layered layout algorithm handles DAGs efficiently, with a grid fallback for cycles. Real UI components enable rich interactions while maintaining accessibility. The system is designed for extension while keeping the MVP focused and deliverable.
