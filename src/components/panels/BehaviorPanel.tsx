import { useConfigStore } from "../../store/configStore";
import { Section, Field, TextInput, Toggle, Select } from "../ui";
import type { GeoConsentMode } from "../../runtime/types";

export function BehaviorPanel() {
  const config = useConfigStore((s) => s.config);
  const setId = useConfigStore((s) => s.setId);
  const updateBehavior = useConfigStore((s) => s.updateBehavior);

  return (
    <div>
      <Section title="Project" description="Used as the localStorage key prefix — keep it unique per site.">
        <Field label="Project ID">
          <TextInput value={config.id} onChange={(e) => setId(e.target.value)} />
        </Field>
      </Section>

      <Section title="Consent">
        <Field label={`Remember choice for ${config.behavior.consentExpiryDays} days`}>
          <input
            type="range"
            min={30}
            max={395}
            value={config.behavior.consentExpiryDays}
            onChange={(e) => updateBehavior({ consentExpiryDays: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Toggle
          checked={config.behavior.defaultConsent}
          onChange={(defaultConsent) => updateBehavior({ defaultConsent })}
          label="Opt-out model (categories granted by default until visitor changes them)"
        />
        <Toggle
          checked={config.behavior.respectDoNotTrack}
          onChange={(respectDoNotTrack) => updateBehavior({ respectDoNotTrack })}
          label="Respect browser 'Do Not Track' signal"
        />
      </Section>

      <Section
        title="Geo targeting"
        description="No API, no network call: uses the visitor's browser timezone as a free proxy for 'are they in Europe' — good enough to skip the banner for clearly non-EU visitors, not a legal geofence."
      >
        <Field label="Who sees the banner">
          <Select
            value={config.behavior.geoConsent}
            onChange={(e) => updateBehavior({ geoConsent: e.target.value as GeoConsentMode })}
          >
            <option value="off">Everyone</option>
            <option value="eu-only">Only Europe (auto-grant everyone else, no banner)</option>
          </Select>
        </Field>
        {config.behavior.geoConsent === "eu-only" && (
          <p className="text-[11px] leading-relaxed text-zinc-400">
            If the timezone can't be read at all, or looks European, the banner still shows as normal — it only skips
            for visitors whose timezone is clearly outside Europe. Doesn't affect the live preview.
          </p>
        )}
      </Section>

      <Section title="Google Consent Mode" description="Pushes granted/denied signals to window.dataLayer for GA4 / Google Tag Manager.">
        <Toggle
          checked={config.behavior.googleConsentMode}
          onChange={(googleConsentMode) => updateBehavior({ googleConsentMode })}
          label="Enable Google Consent Mode v2 integration"
        />
      </Section>

      <Section title="Reopen trigger" description="Optional CSS selector for a 'Cookie settings' link elsewhere on your site (e.g. the footer) that reopens the preferences dialog.">
        <Field label="CSS selector">
          <TextInput
            placeholder="#cookie-settings-link"
            value={config.behavior.reopenTriggerSelector}
            onChange={(e) => updateBehavior({ reopenTriggerSelector: e.target.value })}
          />
        </Field>
      </Section>
    </div>
  );
}
