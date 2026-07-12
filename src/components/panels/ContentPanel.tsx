import { useConfigStore } from "../../store/configStore";
import { Section, Field, TextInput, TextArea } from "../ui";
import { LanguageSwitcherMini } from "../LanguageSwitcherMini";

export function ContentPanel({ editingCode, onEditingCodeChange }: { editingCode: string; onEditingCodeChange: (code: string) => void }) {
  const languages = useConfigStore((s) => s.config.languages);
  const updateLanguageText = useConfigStore((s) => s.updateLanguageText);
  const updateLanguageButton = useConfigStore((s) => s.updateLanguageButton);

  const lang = languages.find((l) => l.code === editingCode) ?? languages[0];
  if (!lang) return null;

  return (
    <div>
      <LanguageSwitcherMini languages={languages} value={lang.code} onChange={onEditingCodeChange} />

      <Section title="Quick banner">
        <Field label="Title" hint="Not shown in the banner itself; used as its accessible label.">
          <TextInput value={lang.title} onChange={(e) => updateLanguageText(lang.code, "title", e.target.value)} />
        </Field>
        <Field label="Description" hint="Supports basic HTML, e.g. <a href> links.">
          <TextArea rows={4} value={lang.description} onChange={(e) => updateLanguageText(lang.code, "description", e.target.value)} />
        </Field>
      </Section>

      <Section title="Buttons">
        <Field label="Accept all">
          <TextInput value={lang.buttons.acceptAll} onChange={(e) => updateLanguageButton(lang.code, "acceptAll", e.target.value)} />
        </Field>
        <Field label="Reject all">
          <TextInput value={lang.buttons.rejectAll} onChange={(e) => updateLanguageButton(lang.code, "rejectAll", e.target.value)} />
        </Field>
        <Field label="Customize">
          <TextInput value={lang.buttons.customize} onChange={(e) => updateLanguageButton(lang.code, "customize", e.target.value)} />
        </Field>
        <Field label="Save preferences">
          <TextInput value={lang.buttons.save} onChange={(e) => updateLanguageButton(lang.code, "save", e.target.value)} />
        </Field>
      </Section>

      <Section title="Tabs">
        <Field label="Consent tab label">
          <TextInput value={lang.consentTitle} onChange={(e) => updateLanguageText(lang.code, "consentTitle", e.target.value)} />
        </Field>
        <Field label="Details tab label">
          <TextInput value={lang.detailsTitle} onChange={(e) => updateLanguageText(lang.code, "detailsTitle", e.target.value)} />
        </Field>
        <Field label="About tab label">
          <TextInput value={lang.aboutTitle} onChange={(e) => updateLanguageText(lang.code, "aboutTitle", e.target.value)} />
        </Field>
        <Field label="About tab content" hint="Longer legal / explanatory text. Supports basic HTML.">
          <TextArea rows={6} value={lang.aboutText} onChange={(e) => updateLanguageText(lang.code, "aboutText", e.target.value)} />
        </Field>
        <Field label="'Learn more' link text">
          <TextInput value={lang.learnMore} onChange={(e) => updateLanguageText(lang.code, "learnMore", e.target.value)} />
        </Field>
        <Field label="No cookies message">
          <TextInput value={lang.noCookies} onChange={(e) => updateLanguageText(lang.code, "noCookies", e.target.value)} />
        </Field>
      </Section>
    </div>
  );
}
