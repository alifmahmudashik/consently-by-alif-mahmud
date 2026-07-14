import type { ConsentBannerConfig } from "../runtime/types";

export interface RuntimeUrls {
  js: string;
}

export function generateEmbedSnippet(config: ConsentBannerConfig, runtime: RuntimeUrls): string {
  const configJson = JSON.stringify(config, null, 2);

  // No DOMContentLoaded wrapper: ConsentBanner.init() pushes the Consent Mode "default" signal
  // to the dataLayer synchronously, before anything else, so it needs to run the instant this
  // script executes — not after waiting for the rest of the page. That's safe because this
  // snippet is meant to go right before </body>, where document.body already exists.
  return `<!-- Consently -->
<script src="${runtime.js}"></script>
<script>
  ConsentBanner.init(${indent(configJson, 4)});
</script>
<!-- /Consently -->`;
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line, i) => (i === 0 ? line : pad + line))
    .join("\n");
}

export function downloadTextFile(filename: string, contents: string, mime = "text/plain") {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
