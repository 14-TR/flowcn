# @flowcn/react Package Specification

## Overview

**Purpose**: Define the architecture, components, and standards for the `@flowcn/react` package, which provides React components for rendering flowcn diagrams.

**Scope**: The `packages/react/` directory containing React components and hooks.

**Version**: 0.0.0

## Package Description

`@flowcn/react` is a React component library that provides:
- `<Diagram>` component for rendering graph documents
- `<NodeCard>` for rendering nodes as shadcn/ui Cards
- `<EdgeSvg>` for rendering edges as SVG paths
- Interaction handling (hover, click, keyboard navigation)
- Edit mode support (drag, connect, delete)

**Key Principle**: This package renders nodes as real DOM elements (not SVG), enabling native browser interactions and standard CSS styling.

## Directory Structure

```
packages/react/
├── src/
│   ├── index.ts              # Package entry point and exports
│   ├── Diagram.tsx           # Main diagram component
│   ├── NodeCard.tsx          # Node rendering component
│   ├── EdgeSvg.tsx           # Edge rendering component
│   ├── ConnectionIndicator.tsx # Connection preview
│   ├── EdgeWaypoint.tsx      # Waypoint manipulation
│   ├── FloatingToolbar.tsx   # Edit mode toolbar
│   ├── hooks/
│   │   └── useDragNode.ts    # Drag-and-drop hook
│   └── shapes/
│       ├── index.ts          # Shape exports
│       └── ShapeRenderer.tsx # SVG shape rendering
├── dist/                     # Build output
├── package.json
└── tsconfig.json
```

## Core Components

### Diagram

The main component for rendering flowcn graphs.

```tsx
interface DiagramProps {
  /** Graph document to render */
  doc: GraphDoc;
  /** Layout options (overrides doc.layout) */
  options?: Partial<LayoutOptions>;
  /** Callback when a node is selected */
  onSelect?: (node: Node | null) => void;
  /** Callback when a node is hovered */
  onHover?: (node: Node | null) => void;
  /** Additional CSS class */
  className?: string;
  /** Show edge labels */
  showEdgeLabels?: boolean;
  /** Enable edit mode */
  editable?: boolean;
  /** Callback when graph changes (edit mode) */
  onDocChange?: (doc: GraphDoc) => void;
  /** Callback when node is double-clicked */
  onNodeEdit?: (node: Node) => void;
}
```

**Usage**:
```tsx
import { Diagram } from '@flowcn/react';
import type { GraphDoc } from '@flowcn/core';

function MyDiagram({ doc }: { doc: GraphDoc }) {
  return (
    <Diagram
      doc={doc}
      onSelect={(node) => console.log('Selected:', node)}
    />
  );
}
```

**Responsibilities**:
- Compute layout using `@flowcn/core`
- Render nodes and edges
- Handle interactions (hover, click, keyboard)
- Manage selection and hover state
- Support edit mode with drag-and-drop

### NodeCard

Renders a single node as a styled card.

```tsx
interface NodeCardProps {
  node: Node;
  position: NodePosition;
  selected?: boolean;
  hovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  draggable?: boolean;
  onDragStart?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
  connectMode?: boolean;
  isConnectionSource?: boolean;
  onDoubleClick?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}
```

**Styling**:
- Base: Card with border and shadow
- Hover: Increased shadow and subtle scale
- Selected: Ring with offset
- Custom colors: Via `node.color` and `node.borderColor`

### EdgeSvg

Renders an edge as an SVG path.

```tsx
interface EdgeSvgProps {
  edge: Edge;
  route: EdgeRoute;
  highlighted?: boolean;
  showLabel?: boolean;
}
```

**Features**:
- Orthogonal path rendering
- Configurable line styles (solid, dashed, dotted)
- Arrow/dot/diamond endpoints
- Optional labels at midpoint

## Interaction Patterns

### Hover Highlighting

**Behavior**: When a node is hovered, it and all incident edges are highlighted.

**Implementation**:
- `hoveredNodeId` state tracks current hover
- `getIncidentEdges()` finds connected edges
- CSS classes applied for highlight styling

### Selection

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

### Edit Mode

When `editable={true}`:

**Drag-and-Drop**:
- Nodes can be dragged to new positions
- Position overrides stored in component state
- Edge routes recalculated on drag

**Connection Mode**:
- Click first node to start connection
- Click second node to complete edge
- Visual indicator shows pending connection

**Delete**:
- Delete/Backspace removes selected node or edge
- Confirmation via `onDocChange` callback

## Hooks

### useDragNode

Custom hook for drag-and-drop functionality.

```typescript
function useDragNode(options: {
  nodeId: string;
  initialPosition: { x: number; y: number };
  onDragStart?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
  containerRef?: React.RefObject<HTMLElement>;
}): {
  position: { x: number; y: number };
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
};
```

## Shape Rendering

### ShapeRenderer

Renders SVG shapes for nodes.

```typescript
type ShapeType =
  | 'rectangle'
  | 'rounded'
  | 'pill'
  | 'diamond'
  | 'oval'
  | 'parallelogram'
  | 'hexagon'
  | 'cylinder'
  | 'cloud'
  | 'triangle'
  | 'star';
```

**Implementation**: Each shape is an SVG path sized to the node dimensions.

## Styling

### CSS Classes

| Class | Purpose |
|-------|---------|
| `.flowcn-diagram` | Diagram container |
| `.flowcn-node` | Node card |
| `.flowcn-node--selected` | Selected node |
| `.flowcn-node--hovered` | Hovered node |
| `.flowcn-edge` | Edge path |
| `.flowcn-edge--highlighted` | Highlighted edge |

### Theme Integration

**Approach**: Uses CSS custom properties compatible with shadcn/ui

**Variables**:
- `--background`, `--foreground`
- `--border`, `--ring`
- `--primary`, `--secondary`
- etc.

## Accessibility

### Requirements

All components MUST:
- Have proper ARIA roles
- Support keyboard navigation
- Provide meaningful labels
- Handle focus management

### Implementation

**NodeCard**:
```tsx
<div
  role="button"
  tabIndex={0}
  aria-selected={selected}
  aria-label={`Node: ${node.label}`}
  onKeyDown={handleKeyDown}
>
```

**Diagram**:
- Manages focus order via tab index
- Supports Escape to cancel operations

## Adding a New Component

### Protocol

**Process**:
1. Create component file in `src/<ComponentName>.tsx`
2. Define props interface with JSDoc comments
3. Implement component following patterns
4. Add export to `src/index.ts`
5. Add tests (when test infrastructure is ready)
6. Update documentation

**Requirements**:
- Functional component with hooks
- Props interface exported
- JSDoc comments on all props
- Accessibility attributes included
- No inline styles (use Tailwind classes)

### Component Template

```tsx
/**
 * Brief description of the component.
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" />
 * ```
 */

export interface ComponentNameProps {
  /** Description of required prop */
  requiredProp: string;
  /** Description of optional prop */
  optionalProp?: number;
  /** Callback description */
  onEvent?: (data: EventData) => void;
}

export function ComponentName({
  requiredProp,
  optionalProp = defaultValue,
  onEvent,
}: ComponentNameProps) {
  // Implementation
  return (
    <div className="component-classes">
      {/* JSX */}
    </div>
  );
}
```

## Validation Checklist

### New Component Checklist

- [ ] Component file created with proper naming
- [ ] Props interface defined and exported
- [ ] JSDoc comments on component and all props
- [ ] Export added to `src/index.ts`
- [ ] Accessibility attributes included
- [ ] Keyboard navigation supported (if interactive)
- [ ] No inline styles

### Code Quality Checklist

- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] useCallback/useMemo for expensive operations
- [ ] Proper cleanup in useEffect
- [ ] Dependencies array complete

## References

- [Architecture Specification](../10-architecture/architecture_spec.md)
- [Repository Specification](../10-architecture/repo_spec.md)
- [Core Package Specification](./core_spec.md)
- [Documentation Specification](../00-governance/docs_spec.md)
