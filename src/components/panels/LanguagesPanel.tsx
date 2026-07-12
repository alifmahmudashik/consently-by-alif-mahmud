import { useConfigStore } from "../../store/configStore";
import { Section, Field, TextInput, Button, Select } from "../ui";
import type { LanguageDetectionMethod } from "../../runtime/types";

const METHOD_LABELS: Record<LanguageDetectionMethod, string> = {
  browser: "Browser language (default)",
  path: "URL path segment (e.g. /en, /ar)",
  query: "URL query parameter",
  cookie: "Cookie",
  localStorage: "Local storage",
};

export function LanguagesPanel() {
  const config = useConfigStore((s) => s.config);
  const updateLanguageMeta = useConfigStore((s) => s.updateLanguageMeta);
  const updateBehavior = useConfigStore((s) => s.updateBehavior);
  const addLanguage = useConfigStore((s) => s.addLanguage);
  const removeLanguage = useConfigStore((s) => s.removeLanguage);
  const setDefaultLanguage = useConfigStore((s) => s.setDefaultLanguage);

  const detection = config.behavior.languageDetection;

  return (
    <div>
      <Section
        title="Language detection"
        description="How a visitor's language is picked. Whatever is detected is matched against each language's Code below. Falls back to the default language if nothing matches."
      >
        <Field label="Method">
          <Select
            value={detection.method}
            onChange={(e) => updateBehavior({ languageDetection: { ...detection, method: e.target.value as LanguageDetectionMethod } })}
          >
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        {detection.method !== "browser" && detection.method !== "path" && (
          <Field label={detection.method === "query" ? "Query parameter name" : detection.method === "cookie" ? "Cookie name" : "Local storage key"}>
            <TextInput
              placeholder={detection.method === "query" ? "lang" : "site_lang"}
              value={detection.paramName}
              onChange={(e) => updateBehavior({ languageDetection: { ...detection, paramName: e.target.value } })}
            />
          </Field>
        )}

        {(detection.method === "cookie" || detection.method === "localStorage") && (
          <Field label="JSON path (optional)" hint='If the stored value is a JSON object rather than plain text, e.g. {"user":{"locale":"en"}} → user.locale'>
            <TextInput
              placeholder="user.locale"
              value={detection.jsonPath}
              onChange={(e) => updateBehavior({ languageDetection: { ...detection, jsonPath: e.target.value } })}
            />
          </Field>
        )}
      </Section>

      <Section
        title="Languages"
        description="Edit each language's banner text from the Content and Categories tabs."
      >
        <div className="flex flex-col gap-3">
          {config.languages.map((lang) => (
            <div key={lang.code} className="grid grid-cols-[1fr_100px_auto_auto] items-end gap-2 rounded-lg border border-zinc-200 p-3">
              <Field label="Label">
                <TextInput value={lang.label} onChange={(e) => updateLanguageMeta(lang.code, "label", e.target.value)} />
              </Field>
              <Field label="Code">
                <TextInput value={lang.code} onChange={(e) => updateLanguageMeta(lang.code, "code", e.target.value)} />
              </Field>
              <label className="flex items-center gap-1.5 pb-2 text-xs text-zinc-600">
                <input
                  type="radio"
                  name="defaultLanguage"
                  checked={config.defaultLanguage === lang.code}
                  onChange={() => setDefaultLanguage(lang.code)}
                />
                Default
              </label>
              <Button variant="danger" type="button" disabled={config.languages.length <= 1} onClick={() => removeLanguage(lang.code)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button variant="secondary" type="button" onClick={addLanguage}>
          + Add language
        </Button>
      </Section>
    </div>
  );
}
