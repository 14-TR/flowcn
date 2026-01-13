'use client';

import type { LayoutKind, LayoutDirection, Node, Edge, ShapeType } from '@flowcn/core';
import type { EditorMode } from '@flowcn/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ShapePalette } from './ShapePalette';
import { EdgePropertiesPanel } from './EdgePropertiesPanel';
import {
  MousePointer2,
  Spline,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  Wrench,
  Shapes,
  LayoutGrid,
  Info,
  Keyboard,
  Cable,
  Palette,
} from 'lucide-react';

// Quick color palette for nodes
const QUICK_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

interface EditorSidebarProps {
  // Mode
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  isConnecting: boolean;
  onCancelConnection: () => void;

  // Actions
  onAddNode: () => void;
  onAddNodeWithShape: (shape: ShapeType) => void;
  onDeleteSelected: () => void;
  onResetLayout: () => void;
  hasSelection: boolean;

  // Shape palette
  selectedShape: ShapeType;
  onShapeSelect: (shape: ShapeType) => void;

  // Layout
  layoutKind: LayoutKind;
  direction: LayoutDirection;
  showEdgeLabels: boolean;
  onLayoutKindChange: (kind: LayoutKind) => void;
  onDirectionChange: (direction: LayoutDirection) => void;
  onShowEdgeLabelsChange: (show: boolean) => void;

  // Stats
  nodeCount: number;
  edgeCount: number;

  // Selection
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onEdgeUpdate: (edgeId: string, updates: Partial<Edge>) => void;
  onEdgeDelete: (edgeId: string) => void;
  // Node update callback for quick color changes
  onNodeUpdate?: (nodeId: string, updates: Partial<Node>) => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group border-b border-border last:border-b-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function EditorSidebar({
  mode,
  onModeChange,
  isConnecting,
  onCancelConnection,
  onAddNode,
  onAddNodeWithShape,
  onDeleteSelected,
  onResetLayout,
  hasSelection,
  selectedShape,
  onShapeSelect,
  layoutKind,
  direction,
  showEdgeLabels,
  onLayoutKindChange,
  onDirectionChange,
  onShowEdgeLabelsChange,
  nodeCount,
  edgeCount,
  selectedNode,
  selectedEdge,
  onEdgeUpdate,
  onEdgeDelete,
  onNodeUpdate,
}: EditorSidebarProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Tools Section */}
      <Section title="Tools" icon={<Wrench className="h-4 w-4" />} defaultOpen={true}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={mode === 'select' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => onModeChange('select')}
            >
              <MousePointer2 className="h-4 w-4 mr-1" />
              Select
            </Button>
            <Button
              variant={mode === 'connect' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => onModeChange('connect')}
            >
              <Spline className="h-4 w-4 mr-1" />
              Connect
            </Button>
          </div>
          {isConnecting && (
            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
              Click a target node to connect, or{' '}
              <button
                className="text-blue-600 underline"
                onClick={onCancelConnection}
              >
                cancel
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAddNodeWithShape(selectedShape)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onDeleteSelected}
              disabled={!hasSelection}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onResetLayout}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Layout
            </Button>
          </div>
        </div>
      </Section>

      {/* Selected Edge Properties - Only shown when edge is selected */}
      {selectedEdge && (
        <Section title="Edge Properties" icon={<Cable className="h-4 w-4" />} defaultOpen={true}>
          <EdgePropertiesPanel
            edge={selectedEdge}
            onEdgeUpdate={onEdgeUpdate}
            onDelete={onEdgeDelete}
            embedded
          />
        </Section>
      )}

      {/* Selected Node - Only shown when node is selected */}
      {selectedNode && (
        <Section title="Selected Node" icon={<Info className="h-4 w-4" />} defaultOpen={true}>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Label: </span>
              <span className="font-medium">{selectedNode.label}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type: </span>
              <span className="font-medium">{selectedNode.type || 'default'}</span>
            </div>
            
            {/* Quick Color Picker */}
            {onNodeUpdate && (
              <div className="space-y-2 pt-1">
                <Label className="text-xs flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  Fill Color
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c.name}
                      className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                        selectedNode.color === c.value
                          ? 'border-ring ring-1 ring-ring'
                          : 'border-border'
                      }`}
                      style={{ 
                        backgroundColor: c.value || 'hsl(var(--card))',
                      }}
                      onClick={() => onNodeUpdate(selectedNode.id, { color: c.value || undefined })}
                      title={c.name}
                    />
                  ))}
                </div>
                
                <Label className="text-xs flex items-center gap-1 pt-1">
                  Border Color
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c.name}
                      className={`w-6 h-6 rounded-md transition-all hover:scale-110 ${
                        selectedNode.borderColor === c.value
                          ? 'ring-2 ring-ring ring-offset-1'
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: `3px solid ${c.value || 'hsl(var(--border))'}`,
                      }}
                      onClick={() => onNodeUpdate(selectedNode.id, { borderColor: c.value || undefined })}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t">
              <span className="text-muted-foreground text-xs">ID: </span>
              <span className="font-mono text-xs">{selectedNode.id}</span>
            </div>
            <span className="text-xs text-muted-foreground block">
              Double-click node to edit all properties
            </span>
          </div>
        </Section>
      )}

      {/* Shape Palette */}
      <Section title="Shapes" icon={<Shapes className="h-4 w-4" />} defaultOpen={!selectedNode && !selectedEdge}>
        <ShapePalette
          onShapeSelect={onShapeSelect}
          selectedShape={selectedShape}
        />
      </Section>

      {/* Layout Controls */}
      <Section title="Layout" icon={<LayoutGrid className="h-4 w-4" />} defaultOpen={false}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="layout-kind" className="text-xs">Algorithm</Label>
            <Select
              id="layout-kind"
              value={layoutKind}
              onChange={(e) => onLayoutKindChange(e.target.value as LayoutKind)}
            >
              <option value="layered">Layered (DAG)</option>
              <option value="grid">Grid</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="direction" className="text-xs">Direction</Label>
            <Select
              id="direction"
              value={direction}
              onChange={(e) => onDirectionChange(e.target.value as LayoutDirection)}
            >
              <option value="LR">Left to Right</option>
              <option value="TB">Top to Bottom</option>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-labels" className="text-xs">Edge Labels</Label>
            <Switch
              id="show-labels"
              checked={showEdgeLabels}
              onCheckedChange={onShowEdgeLabelsChange}
            />
          </div>
        </div>
      </Section>

      {/* Graph Stats */}
      <Section title="Stats" icon={<Info className="h-4 w-4" />} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{nodeCount}</div>
            <div className="text-xs text-muted-foreground">Nodes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{edgeCount}</div>
            <div className="text-xs text-muted-foreground">Edges</div>
          </div>
        </div>
      </Section>

      {/* Keyboard Shortcuts */}
      <Section title="Shortcuts" icon={<Keyboard className="h-4 w-4" />} defaultOpen={false}>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Delete selected</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Del</kbd>
          </div>
          <div className="flex justify-between">
            <span>Cancel connect</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
          </div>
        </div>
      </Section>
    </div>
  );
}
