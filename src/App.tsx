import { useState } from "react";
import { useConfigStore } from "./store/configStore";
import { PreviewFrame } from "./components/PreviewFrame";
import { BrandingPanel } from "./components/panels/BrandingPanel";
import { LayoutPanel } from "./components/panels/LayoutPanel";
import { ContentPanel } from "./components/panels/ContentPanel";
import { CategoriesPanel } from "./components/panels/CategoriesPanel";
import { LanguagesPanel } from "./components/panels/LanguagesPanel";
import { BehaviorPanel } from "./components/panels/BehaviorPanel";
import { ExportPanel } from "./components/panels/ExportPanel";

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TAB_ICONS = {
  branding: (
    <svg {...iconProps}>
      <path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.3c1.8 0 3.2-1.4 3.2-3.2C20.5 6.6 16.7 2 12 2Z" />
      <circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  layout: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  content: (
    <svg {...iconProps}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  categories: (
    <svg {...iconProps}>
      <path d="M20.6 12.3 12.7 20.2a1.5 1.5 0 0 1-2.1 0l-6.8-6.8a1.5 1.5 0 0 1 0-2.1l7.9-7.9c.3-.3.7-.4 1-.4H19a1.5 1.5 0 0 1 1.5 1.5v6.4c0 .4-.1.8-.4 1.1Z" />
      <circle cx="15" cy="8" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  languages: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" />
    </svg>
  ),
  behavior: (
    <svg {...iconProps}>
      <path d="M4 6h16M4 18h16" />
      <circle cx="9" cy="6" r="2" fill="white" />
      <circle cx="16" cy="18" r="2" fill="white" />
    </svg>
  ),
  export: (
    <svg {...iconProps}>
      <path d="M12 3v12m0 0-4-4m4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  ),
} as const;

const TABS = [
  { key: "branding", label: "Branding" },
  { key: "layout", label: "Layout" },
  { key: "content", label: "Content" },
  { key: "categories", label: "Categories" },
  { key: "languages", label: "Languages" },
  { key: "behavior", label: "Behavior" },
  { key: "export", label: "Export" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function App() {
  const [tab, setTab] = useState<TabKey>("branding");
  const defaultLanguage = useConfigStore((s) => s.config.defaultLanguage);
  const [editingCode, setEditingCode] = useState(defaultLanguage);

  return (
    <div className="flex h-screen w-screen flex-col bg-white text-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-900">Consently</div>
            <div className="text-[11px] text-zinc-400">by Alif Mahmud</div>
          </div>
        </div>
        <a
          href="https://alifmahmud.com"
          target="_blank"
          rel="noopener"
          className="text-xs font-medium text-zinc-500 hover:text-indigo-600"
        >
          Free &amp; open source · MIT
        </a>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r border-zinc-200 bg-zinc-50 p-2.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "text-zinc-600 hover:bg-white hover:text-zinc-900"
              }`}
            >
              {TAB_ICONS[t.key]}
              {t.label}
            </button>
          ))}
        </nav>

        <aside className="w-96 shrink-0 overflow-y-auto border-r border-zinc-200 bg-zinc-50/60 p-4">
          <div key={tab} className="panel-fade-in">
            {tab === "branding" && <BrandingPanel />}
            {tab === "layout" && <LayoutPanel />}
            {tab === "content" && <ContentPanel editingCode={editingCode} onEditingCodeChange={setEditingCode} />}
            {tab === "categories" && <CategoriesPanel editingCode={editingCode} onEditingCodeChange={setEditingCode} />}
            {tab === "languages" && <LanguagesPanel />}
            {tab === "behavior" && <BehaviorPanel />}
            {tab === "export" && <ExportPanel />}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <PreviewFrame />
        </main>
      </div>
    </div>
  );
}

export default App;
