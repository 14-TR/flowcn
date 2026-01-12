'use client';

import type { Node } from '@flowcn/core';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface NodeInspectorProps {
  node: Node | null;
}

export function NodeInspector({ node }: NodeInspectorProps) {
  if (!node) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Node Inspector</CardTitle>
          <CardDescription>
            Click on a node to see its details
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{node.label}</CardTitle>
        <CardDescription>Node ID: {node.id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {node.type && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Type</h4>
            <p className="text-sm text-muted-foreground">{node.type}</p>
          </div>
        )}
        {node.group && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Group</h4>
            <p className="text-sm text-muted-foreground">{node.group}</p>
          </div>
        )}
        {node.data && Object.keys(node.data).length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Data</h4>
            <div className="space-y-2">
              {Object.entries(node.data).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span>{' '}
                  <span className="text-muted-foreground">
                    {JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
