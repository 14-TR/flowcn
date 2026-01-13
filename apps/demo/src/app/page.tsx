import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">flowcn</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Interactive, deterministic flow diagram renderer implemented as real
            UI using React and shadcn/ui components
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/examples/editor">
                Open Editor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="https://github.com/yourusername/flowcn"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Deterministic Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Same input graph always yields the same positions. Implements
                layered layout for DAGs with automatic fallback to grid for
                cyclic graphs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real UI Components</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Nodes render as shadcn/ui Card components, not static SVG.
                Fully interactive with hover, click, and keyboard navigation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Docker First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Everything runs from Docker. No need to install Node, npm, or
                any build tools on your host machine.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Get Started</h2>
          <Card className="hover:shadow-lg transition-shadow border-primary/50">
            <CardHeader>
              <CardTitle>
                <Link
                  href="/examples/editor"
                  className="hover:text-primary"
                >
                  Interactive Editor
                </Link>
              </CardTitle>
              <CardDescription>
                Build and modify graphs visually with drag-and-drop nodes, connection creation, and real-time editing
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
