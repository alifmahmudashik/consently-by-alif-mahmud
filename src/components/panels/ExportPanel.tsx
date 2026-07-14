import { useMemo, useRef, useState } from "react";
import { useConfigStore } from "../../store/configStore";
import { Section, Field, TextInput, Button } from "../ui";
import { generateEmbedSnippet, downloadTextFile } from "../../lib/generateSnippet";
import type { ConsentBannerConfig } from "../../runtime/types";

export function ExportPanel() {
  const config = useConfigStore((s) => s.config);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const resetToDefault = useConfigStore((s) => s.resetToDefault);

  const [runtimeBase, setRuntimeBase] = useState(() => `${window.location.origin}/runtime`);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const snippet = useMemo(
    // cookieDbUrl is deliberately left as the relative "/cookie-db.json" default here — the
    // runtime resolves that against wherever consent-banner.js itself was actually loaded from
    // at load time, so the snippet keeps working even if the runtime later moves to another
    // domain, without needing to bake a fixed URL in ahead of time (see runtime/embed.ts).
    () => generateEmbedSnippet(config, { js: `${runtimeBase}/consent-banner.js` }),
    [config, runtimeBase],
  );

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function importConfig(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ConsentBannerConfig;
        if (!parsed.languages || !parsed.categories || !parsed.theme) {
          alert("This doesn't look like a valid Consently config file.");
          return;
        }
        loadConfig(parsed);
      } catch {
        alert("Couldn't parse that file as JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <Section
        title="Embed snippet"
        description="Paste this before </body> on every page you want the banner to appear on. It loads the (self-hosted) runtime script and initializes it with your configuration. The banner renders inside a shadow root, so it can't inherit — or leak — CSS from the rest of the page."
      >
        <Field label="Runtime base URL" hint="Where consent-banner.js is hosted — cookie-db.json (also in dist/runtime/) is found automatically from that same location, so this keeps working even if you move to a different domain later. Defaults to this app's own /runtime folder — point it elsewhere if you self-host the runtime files.">
          <TextInput value={runtimeBase} onChange={(e) => setRuntimeBase(e.target.value)} />
        </Field>
        <div className="relative">
          <pre className="max-h-96 overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 p-3 text-xs text-zinc-100">
            <code>{snippet}</code>
          </pre>
          <Button variant="primary" type="button" className="absolute top-2 right-2" onClick={copySnippet}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </Section>

      <Section title="Project file" description="Save your configuration to reuse it later, share it with teammates, or keep it in version control.">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" onClick={() => downloadTextFile(`${config.id || "consent-banner"}.json`, JSON.stringify(config, null, 2), "application/json")}>
            Export config JSON
          </Button>
          <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
            Import config JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importConfig(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              if (confirm("Reset everything back to the default template?")) resetToDefault();
            }}
          >
            Reset to default
          </Button>
        </div>
      </Section>
    </div>
  );
}
