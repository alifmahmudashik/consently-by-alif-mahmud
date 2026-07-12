import { useConfigStore } from "../../store/configStore";
import { Section, Toggle, Field, Select } from "../ui";
import type { BannerPosition, MiniIconPosition, RejectButtonPosition } from "../../runtime/types";

const POSITIONS: { value: BannerPosition; label: string; dot: string }[] = [
  { value: "center", label: "Center modal", dot: "items-center justify-center" },
  { value: "top", label: "Top bar", dot: "items-start justify-center" },
  { value: "bottom", label: "Bottom bar", dot: "items-end justify-center" },
  { value: "bottom-left", label: "Bottom left", dot: "items-end justify-start" },
  { value: "bottom-right", label: "Bottom right", dot: "items-end justify-end" },
];

export function LayoutPanel() {
  const layout = useConfigStore((s) => s.config.layout);
  const updateLayout = useConfigStore((s) => s.updateLayout);

  return (
    <div>
      <Section title="Position" description="Where the banner appears on the page.">
        <div className="grid grid-cols-2 gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos.value}
              type="button"
              onClick={() => updateLayout({ position: pos.value })}
              className={`flex flex-col gap-2 rounded-lg border p-2 text-left transition-colors ${
                layout.position === pos.value ? "border-indigo-500 bg-indigo-50" : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className={`flex h-14 w-full rounded-md bg-zinc-100 p-1.5 ${pos.dot}`}>
                <div className="h-3 w-8 rounded-sm bg-zinc-400" />
              </div>
              <span className="text-xs font-medium text-zinc-700">{pos.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Behavior">
        <Toggle
          checked={layout.overlay}
          onChange={(overlay) => updateLayout({ overlay })}
          label="Dim page background (center position only)"
        />
        <Toggle
          checked={layout.showCloseButton}
          onChange={(showCloseButton) => updateLayout({ showCloseButton })}
          label="Show close (×) button"
        />
        <p className="-mt-2 text-[11px] leading-relaxed text-zinc-400">
          Only ever appears after a visitor has already made a choice once (e.g. when they reopen it later) — the
          first-ever view always requires accept, reject, or customize.
        </p>
        <Toggle
          checked={layout.showMiniIcon}
          onChange={(showMiniIcon) => updateLayout({ showMiniIcon })}
          label="Show reopen icon after banner is dismissed"
        />
        {layout.showMiniIcon && (
          <>
            <Field label="Reopen icon corner">
              <Select
                value={layout.miniIconPosition}
                onChange={(e) => updateLayout({ miniIconPosition: e.target.value as MiniIconPosition })}
              >
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-right">Bottom right</option>
              </Select>
            </Field>
            <Field label={`Reopen icon spacing from edge (${layout.miniIconOffset}px)`}>
              <input
                type="range"
                min={0}
                max={80}
                value={layout.miniIconOffset}
                onChange={(e) => updateLayout({ miniIconOffset: Number(e.target.value) })}
                className="w-full"
              />
            </Field>
          </>
        )}
      </Section>

      <Section title="Buttons">
        <Toggle
          checked={layout.showRejectButton}
          onChange={(showRejectButton) => updateLayout({ showRejectButton })}
          label="Show reject button"
        />
        {layout.showRejectButton && (
          <Field label="Reject button position">
            <Select
              value={layout.rejectButtonPosition}
              onChange={(e) => updateLayout({ rejectButtonPosition: e.target.value as RejectButtonPosition })}
            >
              <option value="left">Left</option>
              <option value="middle">Middle</option>
              <option value="right">Right</option>
            </Select>
          </Field>
        )}
      </Section>
    </div>
  );
}
