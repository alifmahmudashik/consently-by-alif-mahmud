import { useConfigStore } from "../../store/configStore";
import { Section, Field, TextInput, Toggle } from "../ui";
import { ColorField } from "../ColorField";

const FONT_OPTIONS = [
  { label: "System UI", value: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Poppins", value: "Poppins, system-ui, sans-serif" },
  { label: "Monospace", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
];

export function BrandingPanel() {
  const theme = useConfigStore((s) => s.config.theme);
  const updateTheme = useConfigStore((s) => s.updateTheme);

  return (
    <div>
      <Section title="Logo" description="Shown in the banner header.">
        <Toggle checked={theme.showLogo} onChange={(showLogo) => updateTheme({ showLogo })} label="Show logo" />
        <Field label="Logo URL">
          <TextInput
            placeholder="https://example.com/logo.png"
            value={theme.logoUrl}
            onChange={(e) => updateTheme({ logoUrl: e.target.value })}
          />
        </Field>
        {theme.logoUrl && (
          <div className="flex items-center gap-3">
            <img src={theme.logoUrl} alt="logo preview" className="max-h-10 object-contain" style={{ width: theme.logoWidth }} />
          </div>
        )}
        <Field label={`Logo width (${theme.logoWidth}px)`}>
          <input
            type="range"
            min={24}
            max={200}
            value={theme.logoWidth}
            onChange={(e) => updateTheme({ logoWidth: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Accent" value={theme.accentColor} onChange={(v) => updateTheme({ accentColor: v })} />
          <ColorField label="Background" value={theme.backgroundColor} onChange={(v) => updateTheme({ backgroundColor: v })} />
          <ColorField label="Text" value={theme.textColor} onChange={(v) => updateTheme({ textColor: v })} />
          <ColorField label="Muted text" value={theme.mutedTextColor} onChange={(v) => updateTheme({ mutedTextColor: v })} />
          <ColorField label="Border" value={theme.borderColor} onChange={(v) => updateTheme({ borderColor: v })} />
        </div>
      </Section>

      <Section title="Shape & typography">
        <Field label={`Card corner radius (${theme.cardRadius}px)`}>
          <input
            type="range"
            min={0}
            max={32}
            value={theme.cardRadius}
            onChange={(e) => updateTheme({ cardRadius: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Field label={`Button corner radius (${theme.buttonRadius}px)`}>
          <input
            type="range"
            min={0}
            max={32}
            value={theme.buttonRadius}
            onChange={(e) => updateTheme({ buttonRadius: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Field label="Font family">
          <select
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            value={theme.fontFamily}
            onChange={(e) => updateTheme({ fontFamily: e.target.value })}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </Field>
      </Section>
    </div>
  );
}
