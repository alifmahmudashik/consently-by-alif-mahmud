import { useEffect, useRef, useState } from "react";
import { useConfigStore } from "../store/configStore";
import { PREVIEW_MESSAGE_SOURCE, isPreviewMessage } from "../preview/protocol";

const iconProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DEVICES = [
  {
    key: "desktop",
    label: "Desktop",
    width: "100%",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="4" width="20" height="13" rx="1.5" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    key: "tablet",
    label: "Tablet",
    width: "768px",
    icon: (
      <svg {...iconProps}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
  {
    key: "mobile",
    label: "Mobile",
    width: "390px",
    icon: (
      <svg {...iconProps}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
] as const;

const resetIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

export function PreviewFrame() {
  const config = useConfigStore((s) => s.config);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("desktop");

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!isPreviewMessage(event.data)) return;
      if (event.data.type === "ready") setReady(true);
    }
    window.addEventListener("message", handleMessage as EventListener);
    return () => window.removeEventListener("message", handleMessage as EventListener);
  }, []);

  useEffect(() => {
    if (!ready) return;
    iframeRef.current?.contentWindow?.postMessage({ source: PREVIEW_MESSAGE_SOURCE, type: "config", config }, "*");
  }, [config, ready]);

  function resetPreview() {
    iframeRef.current?.contentWindow?.postMessage({ source: PREVIEW_MESSAGE_SOURCE, type: "reset" }, "*");
  }

  const activeWidth = DEVICES.find((d) => d.key === device)!.width;

  return (
    <div
      className="flex h-full flex-col"
      style={{
        background: "#f4f4f6",
        backgroundImage: "radial-gradient(circle, #e4e4e9 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          {DEVICES.map((d) => (
            <button
              key={d.key}
              onClick={() => setDevice(d.key)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                device === d.key ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {d.icon}
              {d.label}
            </button>
          ))}
        </div>
        <button
          onClick={resetPreview}
          aria-label="Show banner again"
          title="Show banner again"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          {resetIcon}
          Reset
        </button>
      </div>
      <div className="flex flex-1 items-stretch justify-center overflow-hidden p-6">
        <div
          className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,15,20,0.04),0_16px_40px_rgba(15,15,20,0.10)] transition-[width] duration-200"
          style={{ width: activeWidth }}
        >
          <div className="flex shrink-0 items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <iframe ref={iframeRef} src="/preview.html" title="Consent banner preview" className="min-h-0 w-full flex-1 border-0" />
        </div>
      </div>
    </div>
  );
}
