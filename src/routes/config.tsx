import { RuntimeControls } from "@/components/runtime-controls";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { parse } from "yaml";
import { toast } from "sonner";
import { configQuery } from "@/lib/queries";
import { saveConfigFile, setDryRun } from "@/lib/repo-data.functions";
import { PageHeader, Panel } from "@/components/page-header";
import { SourceBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/config")({
  head: () => ({ meta: [{ title: "Config — Job Hunter Console" }, { name: "description", content: "Edit target search links, common form answers and the dry-run switch for your job hunting agent." }, { property: "og:title", content: "Config — Job Hunter Console" }, { property: "og:description", content: "Edit target search links, common form answers and the dry-run switch for your job hunting agent." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(configQuery),
  component: ConfigPage,
});

function ConfigPage() {
  const { data } = useSuspenseQuery(configQuery);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const toggle = async (v: boolean) => {
    setBusy(true);
    try {
      await setDryRun({ data: { dryRun: v } });
      await qc.invalidateQueries({ queryKey: ["config"] });
      toast.success(v ? "Dry run ON — agent will not submit" : "Dry run OFF — agent will submit applications");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader title="Config" subtitle="Changes are written straight to the files in this repo." right={<SourceBadge live={data.live} />} />
      <RuntimeControls key={data.guardrails} text={data.guardrails} live={data.live} />
      <Panel className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Dry run</div>
            <p className="text-sm text-muted-foreground">config/guardrails.yaml — fill forms but never click Submit.</p>
          </div>
          <Switch checked={data.dryRun} onCheckedChange={toggle} disabled={busy} aria-label="Toggle dry run" />
        </div>
        <pre className="mt-4 overflow-x-auto rounded-md bg-secondary p-3 font-mono text-xs text-muted-foreground">{data.guardrails}</pre>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <YamlEditor title="Target search links" file="context/targets.yaml" fileKey="targets" initial={data.targets} />
        <YamlEditor title="Common form answers" file="context/form-answers.yaml" fileKey="formAnswers" initial={data.formAnswers} />
      </div>
    </>
  );
}

function YamlEditor({ title, file, fileKey, initial }: { title: string; file: string; fileKey: "targets" | "formAnswers"; initial: string }) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  let error: string | null = null;
  try { parse(text); } catch (e) { error = (e as Error).message.split("\n")[0] ?? "invalid"; }
  const save = async () => {
    setSaving(true);
    try {
      await saveConfigFile({ data: { key: fileKey, content: text } });
      toast.success(`Saved ${file}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="font-mono text-xs text-muted-foreground">{file}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setText(initial)} disabled={text === initial}>Reset</Button>
          <Button size="sm" onClick={save} disabled={!!error || saving || text === initial}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-xs leading-relaxed" />
      <div className={`mt-2 font-mono text-xs ${error ? "text-destructive" : "text-success"}`}>{error ? `YAML error: ${error}` : "valid YAML"}</div>
    </Panel>
  );
}
