'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { GraphDoc, LayoutKind, LayoutDirection, Node, Edge, ShapeType } from '@flowcn/core';
import { normalizeGraph } from '@flowcn/core';
import { Diagram, type DiagramRef, type EditorMode } from '@flowcn/react';
import { Button } from '@/components/ui/button';
import { NodeEditDialog } from '@/components/NodeEditDialog';
import { EditorSidebar } from '@/components/EditorSidebar';
import { ArrowLeft } from 'lucide-react';

// Initial simple graph
const initialDoc: GraphDoc = {
  meta: {
    title: 'Interactive Graph Editor',
    description: 'Create and modify graphs through the visual editor',
  },
  nodes: [
    { id: 'start', label: 'Start', type: 'start' },
    { id: 'process1', label: 'Process 1', type: 'process' },
    { id: 'end', label: 'End', type: 'end' },
  ],
  edges: [
    { from: 'start', to: 'process1' },
    { from: 'process1', to: 'end' },
  ],
  layout: {
    kind: 'layered',
    direction: 'LR',
  },
};

export default function EditorPage() {
  const diagramRef = useRef<DiagramRef>(null);
  const [doc, setDoc] = useState<GraphDoc>(initialDoc);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [layoutKind, setLayoutKind] = useState<LayoutKind>(
    doc.layout?.kind || 'layered'
  );
  const [direction, setDirection] = useState<LayoutDirection>(
    doc.layout?.direction || 'LR'
  );
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  // Editor state
  const [mode, setMode] = useState<EditorMode>('select');
  const [hasSelection, setHasSelection] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rounded');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Get normalized graph for stable edge IDs
  const normalizedDoc = useMemo(() => normalizeGraph(doc), [doc]);

  // Get selected edge object
  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId) return null;
    return normalizedDoc.edges.find(e => e.id === selectedEdgeId) || null;
  }, [selectedEdgeId, normalizedDoc.edges]);

  const handleDocChange = useCallback((newDoc: GraphDoc) => {
    setDoc(newDoc);
  }, []);

  const handleNodeEdit = useCallback((node: Node) => {
    setEditingNode(node);
    setEditDialogOpen(true);
  }, []);

  const handleSaveNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    setDoc(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      ),
    }));
    // Update selected node if it's the one being edited
    setSelectedNode(prev =>
      prev?.id === nodeId ? { ...prev, ...updates } : prev
    );
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setDoc(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId),
    }));
    setSelectedNode(prev => prev?.id === nodeId ? null : prev);
  }, []);

  const handleSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  const handleModeChange = useCallback((newMode: EditorMode) => {
    setMode(newMode);
    diagramRef.current?.setMode(newMode);
  }, []);

  const handleSelectionChange = useCallback((
    hasSelection: boolean,
    selectedNodeIdArg: string | null,
    selectedEdgeIdArg: string | null
  ) => {
    setHasSelection(hasSelection);
    setSelectedEdgeId(selectedEdgeIdArg);
    if (selectedNodeIdArg) {
      const node = doc.nodes.find(n => n.id === selectedNodeIdArg);
      setSelectedNode(node || null);
    } else if (!selectedEdgeIdArg) {
      setSelectedNode(null);
    }
  }, [doc.nodes]);

  // Handle edge update
  const handleEdgeUpdate = useCallback((edgeId: string, updates: Partial<Edge>) => {
    // Find the edge in normalizedDoc to get from/to
    const normalizedEdge = normalizedDoc.edges.find(e => e.id === edgeId);
    if (!normalizedEdge) return;

    setDoc(prev => ({
      ...prev,
      edges: prev.edges.map(e => {
        // Match by from/to since original edges may not have IDs
        if (e.from === normalizedEdge.from && e.to === normalizedEdge.to) {
          return { ...e, ...updates };
        }
        return e;
      }),
    }));
  }, [normalizedDoc.edges]);

  // Handle edge delete
  const handleEdgeDelete = useCallback((edgeId: string) => {
    const normalizedEdge = normalizedDoc.edges.find(e => e.id === edgeId);
    if (!normalizedEdge) return;

    setDoc(prev => ({
      ...prev,
      edges: prev.edges.filter(e =>
        !(e.from === normalizedEdge.from && e.to === normalizedEdge.to)
      ),
    }));
    setSelectedEdgeId(null);
  }, [normalizedDoc.edges]);

  // Handle waypoint move
  const handleWaypointMove = useCallback((edgeId: string, index: number, x: number, y: number) => {
    const normalizedEdge = normalizedDoc.edges.find(e => e.id === edgeId);
    if (!normalizedEdge) return;

    setDoc(prev => ({
      ...prev,
      edges: prev.edges.map(e => {
        if (e.from === normalizedEdge.from && e.to === normalizedEdge.to) {
          const waypoints = [...(e.waypoints || [])];
          waypoints[index] = { x, y };
          return { ...e, waypoints };
        }
        return e;
      }),
    }));
  }, [normalizedDoc.edges]);

  // Handle waypoint remove
  const handleWaypointRemove = useCallback((edgeId: string, index: number) => {
    const normalizedEdge = normalizedDoc.edges.find(e => e.id === edgeId);
    if (!normalizedEdge) return;

    setDoc(prev => ({
      ...prev,
      edges: prev.edges.map(e => {
        if (e.from === normalizedEdge.from && e.to === normalizedEdge.to) {
          const waypoints = [...(e.waypoints || [])];
          waypoints.splice(index, 1);
          return { ...e, waypoints: waypoints.length > 0 ? waypoints : undefined };
        }
        return e;
      }),
    }));
  }, [normalizedDoc.edges]);

  // Handle waypoint add
  const handleWaypointAdd = useCallback((edgeId: string, x: number, y: number) => {
    const normalizedEdge = normalizedDoc.edges.find(e => e.id === edgeId);
    if (!normalizedEdge) return;

    setDoc(prev => ({
      ...prev,
      edges: prev.edges.map(e => {
        if (e.from === normalizedEdge.from && e.to === normalizedEdge.to) {
          const waypoints = [...(e.waypoints || [])];
          waypoints.push({ x, y });
          return { ...e, waypoints };
        }
        return e;
      }),
    }));
  }, [normalizedDoc.edges]);

  const handleConnectingChange = useCallback((connecting: boolean) => {
    setIsConnecting(connecting);
  }, []);

  const handleAddNode = useCallback(() => {
    diagramRef.current?.addNode();
  }, []);

  const handleAddNodeWithShape = useCallback((shape: ShapeType) => {
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      label: 'New Node',
      type: 'process',
      shape,
    };
    setDoc(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    diagramRef.current?.deleteSelected();
  }, []);

  const handleResetLayout = useCallback(() => {
    diagramRef.current?.resetLayout();
  }, []);

  const handleCancelConnection = useCallback(() => {
    diagramRef.current?.cancelConnection();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Graph Editor</h1>
            <p className="text-sm text-muted-foreground">
              Drag nodes to reposition, use sidebar tools to build your graph
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Diagram canvas */}
          <div className="flex-1 bg-muted/20 rounded-lg p-4 overflow-auto relative border">
            <Diagram
              ref={diagramRef}
              doc={doc}
              options={{ kind: layoutKind, direction }}
              onSelect={handleSelect}
              showEdgeLabels={showEdgeLabels}
              editable={true}
              onDocChange={handleDocChange}
              onNodeEdit={handleNodeEdit}
              mode={mode}
              onModeChange={setMode}
              onSelectionChange={handleSelectionChange}
              onConnectingChange={handleConnectingChange}
              onEdgeWaypointMove={handleWaypointMove}
              onEdgeWaypointRemove={handleWaypointRemove}
              onEdgeWaypointAdd={handleWaypointAdd}
            />
          </div>

          {/* Sidebar */}
          <div className="w-64 overflow-y-auto">
            <EditorSidebar
              mode={mode}
              onModeChange={handleModeChange}
              isConnecting={isConnecting}
              onCancelConnection={handleCancelConnection}
              onAddNode={handleAddNode}
              onAddNodeWithShape={handleAddNodeWithShape}
              onDeleteSelected={handleDeleteSelected}
              onResetLayout={handleResetLayout}
              hasSelection={hasSelection}
              selectedShape={selectedShape}
              onShapeSelect={setSelectedShape}
              layoutKind={layoutKind}
              direction={direction}
              showEdgeLabels={showEdgeLabels}
              onLayoutKindChange={setLayoutKind}
              onDirectionChange={setDirection}
              onShowEdgeLabelsChange={setShowEdgeLabels}
              nodeCount={doc.nodes.length}
              edgeCount={doc.edges.length}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onEdgeUpdate={handleEdgeUpdate}
              onEdgeDelete={handleEdgeDelete}
              onNodeUpdate={handleSaveNode}
            />
          </div>
        </div>
      </div>

      {/* Node Edit Dialog */}
      <NodeEditDialog
        node={editingNode}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
      />
    </div>
  );
}
