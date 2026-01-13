# apps/demo Application Specification

## Overview

**Purpose**: Define the architecture, pages, and standards for the demo application that showcases flowcn capabilities.

**Scope**: The `apps/demo/` directory containing the Next.js demo application.

**Version**: 0.0.0

## Application Description

The demo application is a Next.js application that:
- Showcases flowcn diagram capabilities
- Provides interactive examples
- Demonstrates edit mode features
- Serves as documentation and testing ground

**Key Principle**: The demo is not a production application but a showcase and development tool.

## Directory Structure

```
apps/demo/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with styles
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Global styles
│   │   └── examples/
│   │       └── editor/
│   │           └── page.tsx   # Editor example page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── switch.tsx
│   │   ├── DiagramControls.tsx    # Layout controls
│   │   ├── EdgePropertiesPanel.tsx # Edge editing
│   │   ├── EditorSidebar.tsx      # Editor sidebar
│   │   ├── NodeEditDialog.tsx     # Node editing dialog
│   │   ├── NodeInspector.tsx      # Node details panel
│   │   └── ShapePalette.tsx       # Shape selection
│   └── lib/
│       └── utils.ts           # Utility functions
├── public/                    # Static assets
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## Pages

### Landing Page (`/`)

**Purpose**: Introduce flowcn and provide navigation to examples.

**Content**:
- Project title and description
- Feature highlights
- Links to examples
- Quick start code snippet

### Editor Example (`/examples/editor`)

**Purpose**: Demonstrate full diagram editing capabilities.

**Features**:
- Interactive diagram rendering
- Node selection and editing
- Edge creation and styling
- Layout controls
- Shape palette
- Node/edge property panels

**State Management**:
- `GraphDoc` stored in component state
- Changes trigger re-render
- Layout computed on each change

## Components

### DiagramControls

Controls for diagram layout options.

**Props**:
```typescript
interface DiagramControlsProps {
  layoutKind: LayoutKind;
  direction: LayoutDirection;
  showEdgeLabels: boolean;
  onLayoutKindChange: (kind: LayoutKind) => void;
  onDirectionChange: (direction: LayoutDirection) => void;
  onShowEdgeLabelsChange: (show: boolean) => void;
}
```

**Features**:
- Layout kind selector (layered/grid)
- Direction selector (LR/TB)
- Edge labels toggle

### NodeInspector

Displays details of the selected node.

**Props**:
```typescript
interface NodeInspectorProps {
  node: Node | null;
}
```

**Features**:
- Shows node ID, label, type
- Displays custom data as JSON
- Shows node dimensions

### ShapePalette

Allows selecting node shapes.

**Props**:
```typescript
interface ShapePaletteProps {
  selectedShape: ShapeType;
  onShapeSelect: (shape: ShapeType) => void;
}
```

**Features**:
- Grid of available shapes
- Visual preview of each shape
- Highlight selected shape

### EdgePropertiesPanel

Configures edge properties.

**Props**:
```typescript
interface EdgePropertiesPanelProps {
  edge: Edge | null;
  onEdgeChange: (edge: Edge) => void;
}
```

**Features**:
- Line style selector
- Curve type selector
- Endpoint style selectors
- Color picker

### NodeEditDialog

Modal for editing node properties.

**Props**:
```typescript
interface NodeEditDialogProps {
  node: Node | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (node: Node) => void;
}
```

**Features**:
- Label editing
- Type selection
- Shape selection
- Color pickers

### EditorSidebar

Sidebar containing editor controls and panels.

**Features**:
- Mode selector (select/connect)
- Add node button
- Delete selected button
- Reset layout button
- Node/edge properties panels

## UI Components (shadcn/ui)

The demo uses shadcn/ui components for consistent styling:

| Component | Purpose |
|-----------|---------|
| `Button` | Actions and controls |
| `Card` | Container panels |
| `Dialog` | Modal editing |
| `Input` | Text input fields |
| `Label` | Form labels |
| `Select` | Dropdown selectors |
| `Switch` | Toggle controls |

## Styling

### Tailwind Configuration

**Theme Extensions**:
- Custom colors for diagram elements
- Container sizing utilities
- Animation utilities

### CSS Variables

Uses shadcn/ui CSS variables for theming:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  /* ... */
}
```

## Example GraphDocs

### Simple Flowchart

```typescript
const simpleFlowchart: GraphDoc = {
  meta: { title: 'Simple Flowchart' },
  nodes: [
    { id: 'start', label: 'Start', type: 'start' },
    { id: 'process', label: 'Process', type: 'process' },
    { id: 'end', label: 'End', type: 'end' },
  ],
  edges: [
    { from: 'start', to: 'process' },
    { from: 'process', to: 'end' },
  ],
  layout: { kind: 'layered', direction: 'LR' },
};
```

### Complex Workflow

```typescript
const complexWorkflow: GraphDoc = {
  meta: { title: 'AI Agent Pipeline' },
  nodes: [
    { id: 'receive', label: 'Receive Request', type: 'entry' },
    { id: 'parse', label: 'Parse Input', type: 'transform' },
    { id: 'classify', label: 'Classify Intent', type: 'ai-model' },
    { id: 'route', label: 'Route to Handler', type: 'router' },
    { id: 'query', label: 'Query Database', type: 'data-access' },
    { id: 'api', label: 'Call API', type: 'integration' },
    { id: 'generate', label: 'Generate Response', type: 'ai-model' },
    { id: 'send', label: 'Send Response', type: 'exit' },
  ],
  edges: [
    { from: 'receive', to: 'parse' },
    { from: 'parse', to: 'classify' },
    { from: 'classify', to: 'route' },
    { from: 'route', to: 'query', label: 'data' },
    { from: 'route', to: 'api', label: 'external' },
    { from: 'query', to: 'generate' },
    { from: 'api', to: 'generate' },
    { from: 'generate', to: 'send' },
  ],
  layout: { kind: 'layered', direction: 'TB' },
};
```

## Adding a New Example

### Protocol

**Process**:
1. Create page file at `src/app/examples/<name>/page.tsx`
2. Define example GraphDoc
3. Add Diagram component with appropriate options
4. Add controls if needed
5. Add navigation link (if applicable)

**Requirements**:
- Page must be a valid Next.js page component
- GraphDoc must validate without errors
- Example should demonstrate specific feature(s)
- Include brief description of what's being demonstrated

### Example Template

```tsx
'use client';

import { useState } from 'react';
import { Diagram } from '@flowcn/react';
import type { GraphDoc } from '@flowcn/core';

const exampleDoc: GraphDoc = {
  meta: { title: 'Example Name' },
  nodes: [
    // Define nodes
  ],
  edges: [
    // Define edges
  ],
  layout: { kind: 'layered', direction: 'LR' },
};

export default function ExamplePage() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Example Name</h1>
      <p className="mb-4">Description of what this example demonstrates.</p>
      
      <div className="border rounded-lg p-4">
        <Diagram
          doc={exampleDoc}
          onSelect={setSelectedNode}
        />
      </div>
    </div>
  );
}
```

## Development

### Running the Demo

```bash
# Start development server
docker compose up dev
# Access at http://localhost:3000
```

### Adding shadcn/ui Components

```bash
# Inside container
npx shadcn@latest add <component-name>
```

## Validation Checklist

### New Example Checklist

- [ ] Page file created with correct path
- [ ] GraphDoc validates without errors
- [ ] Diagram renders correctly
- [ ] Example demonstrates specific feature
- [ ] Description provided

### Code Quality Checklist

- [ ] Uses 'use client' directive where needed
- [ ] State management is appropriate
- [ ] No TypeScript errors
- [ ] Follows existing patterns

## References

- [Architecture Specification](../10-architecture/architecture_spec.md)
- [React Package Specification](./react_spec.md)
- [Core Package Specification](./core_spec.md)
- [Next.js Documentation](https://nextjs.org/docs)
