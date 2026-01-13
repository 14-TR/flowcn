'use client';

import { useState, useEffect } from 'react';
import type { Node, ShapeType } from '@flowcn/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

// Preset colors for quick selection
const PRESET_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Slate', value: '#64748b' },
];

const SHAPE_OPTIONS: { label: string; value: ShapeType }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Rectangle', value: 'rectangle' },
  { label: 'Pill', value: 'pill' },
  { label: 'Diamond', value: 'diamond' },
  { label: 'Oval', value: 'oval' },
  { label: 'Hexagon', value: 'hexagon' },
  { label: 'Parallelogram', value: 'parallelogram' },
  { label: 'Cylinder', value: 'cylinder' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Triangle', value: 'triangle' },
  { label: 'Star', value: 'star' },
];

// Helper to determine if a color is light (for text contrast)
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

interface NodeEditDialogProps {
  node: Node | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, updates: Partial<Node>) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeEditDialog({
  node,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: NodeEditDialogProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [shape, setShape] = useState<ShapeType>('rounded');

  useEffect(() => {
    if (node) {
      setLabel(node.label);
      setType(node.type || '');
      setColor(node.color || '');
      setBorderColor(node.borderColor || '');
      setShape(node.shape || 'rounded');
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onSave(node.id, {
        label: label.trim() || 'Untitled',
        type: type.trim() || undefined,
        color: color || undefined,
        borderColor: borderColor || undefined,
        shape,
      });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (node) {
      onDelete(node.id);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter node label"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-type">Type</Label>
            <Input
              id="node-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., process, decision, start, end"
            />
            <p className="text-xs text-muted-foreground">
              Optional. Used for styling or categorization.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-shape">Shape</Label>
            <Select
              id="node-shape"
              value={shape}
              onChange={(e) => setShape(e.target.value as ShapeType)}
            >
              {SHAPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="node-color">Fill Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="node-color"
                  value={color || '#ffffff'}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                >
                  {PRESET_COLORS.map((c) => (
                    <option key={c.name} value={c.value}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-border-color">Border Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="node-border-color"
                  value={borderColor || '#e2e8f0'}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Select
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="flex-1"
                >
                  {PRESET_COLORS.map((c) => (
                    <option key={c.name} value={c.value}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Preview */}
          {(color || borderColor || shape !== 'rounded') && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
              <div 
                className="h-12 rounded-lg flex items-center justify-center text-sm font-medium"
                style={{
                  backgroundColor: color || 'hsl(var(--card))',
                  borderColor: borderColor || 'hsl(var(--border))',
                  borderWidth: 2,
                  borderStyle: 'solid',
                  color: color ? (isLightColor(color) ? '#000' : '#fff') : undefined,
                }}
              >
                {label || 'Preview'}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t pt-3">
            <strong>ID:</strong> {node.id}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Node
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
