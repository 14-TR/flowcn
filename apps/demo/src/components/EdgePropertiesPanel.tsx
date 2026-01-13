'use client';

import type { Edge, EndpointStyle, LineStyle, CurveType } from '@flowcn/core';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const endpointOptions: { value: EndpointStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'arrow', label: 'Arrow' },
  { value: 'dot', label: 'Dot' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'square', label: 'Square' },
];

const lineStyleOptions: { value: LineStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const curveTypeOptions: { value: CurveType; label: string }[] = [
  { value: 'elbow', label: 'Elbow (right angles)' },
  { value: 'bezier', label: 'Bezier (curved)' },
  { value: 'straight', label: 'Straight' },
];

const colorOptions = [
  { value: '', label: 'Default' },
  { value: 'rgb(59 130 246)', label: 'Blue' },
  { value: 'rgb(34 197 94)', label: 'Green' },
  { value: 'rgb(239 68 68)', label: 'Red' },
  { value: 'rgb(234 179 8)', label: 'Yellow' },
  { value: 'rgb(168 85 247)', label: 'Purple' },
  { value: 'rgb(249 115 22)', label: 'Orange' },
  { value: 'rgb(148 163 184)', label: 'Gray' },
];

interface EdgePropertiesPanelProps {
  edge: Edge;
  onEdgeUpdate: (edgeId: string, updates: Partial<Edge>) => void;
  onDelete: (edgeId: string) => void;
  /** When true, renders without Card wrapper for embedding in other components */
  embedded?: boolean;
}

function EdgePropertiesContent({
  edge,
  onEdgeUpdate,
  onDelete,
}: Omit<EdgePropertiesPanelProps, 'embedded'>) {
  return (
    <div className="space-y-3">
      {/* From/To info */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">From:</span>
          <span className="font-mono">{edge.from}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">To:</span>
          <span className="font-mono">{edge.to}</span>
        </div>
      </div>

      <hr className="border-border" />

      {/* Source Endpoint */}
      <div className="space-y-1.5">
        <Label className="text-xs">Source Endpoint</Label>
        <Select
          value={edge.sourceEndpoint || 'none'}
          onChange={(e) => onEdgeUpdate(edge.id!, { sourceEndpoint: e.target.value as EndpointStyle })}
        >
          {endpointOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {/* Target Endpoint */}
      <div className="space-y-1.5">
        <Label className="text-xs">Target Endpoint</Label>
        <Select
          value={edge.targetEndpoint || 'arrow'}
          onChange={(e) => onEdgeUpdate(edge.id!, { targetEndpoint: e.target.value as EndpointStyle })}
        >
          {endpointOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {/* Line Style */}
      <div className="space-y-1.5">
        <Label className="text-xs">Line Style</Label>
        <Select
          value={edge.lineStyle || 'solid'}
          onChange={(e) => onEdgeUpdate(edge.id!, { lineStyle: e.target.value as LineStyle })}
        >
          {lineStyleOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {/* Curve Type */}
      <div className="space-y-1.5">
        <Label className="text-xs">Curve Type</Label>
        <Select
          value={edge.curveType || 'elbow'}
          onChange={(e) => onEdgeUpdate(edge.id!, { curveType: e.target.value as CurveType })}
        >
          {curveTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="text-xs">Color</Label>
        <Select
          value={edge.color || ''}
          onChange={(e) => onEdgeUpdate(edge.id!, { color: e.target.value || undefined })}
        >
          {colorOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {/* Delete button */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full mt-2"
        onClick={() => onDelete(edge.id!)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Edge
      </Button>

      <span className="text-xs text-muted-foreground pt-1 block">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Del</kbd> to delete
      </span>
    </div>
  );
}

export function EdgePropertiesPanel({
  edge,
  onEdgeUpdate,
  onDelete,
  embedded = false,
}: EdgePropertiesPanelProps) {
  if (embedded) {
    return (
      <EdgePropertiesContent
        edge={edge}
        onEdgeUpdate={onEdgeUpdate}
        onDelete={onDelete}
      />
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          Selected Edge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EdgePropertiesContent
          edge={edge}
          onEdgeUpdate={onEdgeUpdate}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
}
