'use client';

import { useState } from 'react';
import type { GraphDoc, LayoutKind, LayoutDirection, Node } from '@flowcn/core';
import { Diagram } from '@flowcn/react';
import { NodeInspector } from './NodeInspector';
import { DiagramControls } from './DiagramControls';

interface ExampleViewerProps {
  doc: GraphDoc;
}

export function ExampleViewer({ doc }: ExampleViewerProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [layoutKind, setLayoutKind] = useState<LayoutKind>(
    doc.layout?.kind || 'layered'
  );
  const [direction, setDirection] = useState<LayoutDirection>(
    doc.layout?.direction || 'LR'
  );
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-9 bg-muted/20 rounded-lg p-6 overflow-auto">
        <Diagram
          doc={doc}
          options={{ kind: layoutKind, direction }}
          onSelect={setSelectedNode}
          showEdgeLabels={showEdgeLabels}
        />
      </div>
      <div className="col-span-3 space-y-6">
        <DiagramControls
          layoutKind={layoutKind}
          direction={direction}
          showEdgeLabels={showEdgeLabels}
          onLayoutKindChange={setLayoutKind}
          onDirectionChange={setDirection}
          onShowEdgeLabelsChange={setShowEdgeLabels}
        />
        <NodeInspector node={selectedNode} />
      </div>
    </div>
  );
}
