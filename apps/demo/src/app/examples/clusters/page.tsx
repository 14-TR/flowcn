import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ExampleViewer } from '@/components/ExampleViewer';
import { clustersExample } from '@/data/examples';

export default function ClustersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/examples/flowchart">Flowchart</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/examples/agent-workflow">Agent Workflow</Link>
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {clustersExample.meta?.title}
          </h1>
          <p className="text-muted-foreground">
            {clustersExample.meta?.description}
          </p>
        </div>

        <div className="h-[calc(100vh-250px)]">
          <ExampleViewer doc={clustersExample} />
        </div>
      </div>
    </div>
  );
}
