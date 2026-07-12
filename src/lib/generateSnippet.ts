import type { ConsentBannerConfig } from "../runtime/types";

export interface RuntimeUrls {
  js: string;
  css: string;
}

export function generateEmbedSnippet(config: ConsentBannerConfig, runtime: RuntimeUrls): string {
  const configJson = JSON.stringify(config, null, 2);

  return `<!-- Consently -->
<link rel="stylesheet" href="${runtime.css}" />
<script src="${runtime.js}"></script>
<script>
  window.addEventListener("DOMContentLoaded", function () {
    ConsentBanner.init(${indent(configJson, 4)});
  });
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
