import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Placeholder,
});

function Placeholder() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md text-center space-y-2">
        <h1 className="text-xl font-semibold">job-hunter-os</h1>
        <p className="text-sm text-muted-foreground">
          Zero-code Markdown agent skills and MCP playbook repository. Open this folder in your AI IDE and read AGENTS.md.
        </p>
      </div>
    </main>
  );
}
