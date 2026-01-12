'use client';

import type { LayoutKind, LayoutDirection } from '@flowcn/core';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DiagramControlsProps {
  layoutKind: LayoutKind;
  direction: LayoutDirection;
  showEdgeLabels: boolean;
  onLayoutKindChange: (kind: LayoutKind) => void;
  onDirectionChange: (direction: LayoutDirection) => void;
  onShowEdgeLabelsChange: (show: boolean) => void;
}

export function DiagramControls({
  layoutKind,
  direction,
  showEdgeLabels,
  onLayoutKindChange,
  onDirectionChange,
  onShowEdgeLabelsChange,
}: DiagramControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="layout-kind">Layout Algorithm</Label>
          <Select
            id="layout-kind"
            value={layoutKind}
            onChange={(e) =>
              onLayoutKindChange(e.target.value as LayoutKind)
            }
          >
            <option value="layered">Layered (DAG)</option>
            <option value="grid">Grid</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direction">Direction</Label>
          <Select
            id="direction"
            value={direction}
            onChange={(e) =>
              onDirectionChange(e.target.value as LayoutDirection)
            }
          >
            <option value="LR">Left to Right</option>
            <option value="TB">Top to Bottom</option>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-labels">Show Edge Labels</Label>
          <Switch
            id="show-labels"
            checked={showEdgeLabels}
            onCheckedChange={onShowEdgeLabelsChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
