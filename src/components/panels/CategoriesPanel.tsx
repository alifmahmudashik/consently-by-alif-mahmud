import { useState } from "react";
import { useConfigStore } from "../../store/configStore";
import { Section, Field, TextInput, TextArea, Select, Button, Toggle, IconButton } from "../ui";
import { LanguageSwitcherMini } from "../LanguageSwitcherMini";

export function CategoriesPanel({ editingCode, onEditingCodeChange }: { editingCode: string; onEditingCodeChange: (code: string) => void }) {
  const config = useConfigStore((s) => s.config);
  const updateCategoryText = useConfigStore((s) => s.updateCategoryText);
  const addCategory = useConfigStore((s) => s.addCategory);
  const removeCategory = useConfigStore((s) => s.removeCategory);
  const toggleCategoryRequired = useConfigStore((s) => s.toggleCategoryRequired);
  const moveCategory = useConfigStore((s) => s.moveCategory);
  const addManualCookie = useConfigStore((s) => s.addManualCookie);
  const updateManualCookie = useConfigStore((s) => s.updateManualCookie);
  const removeManualCookie = useConfigStore((s) => s.removeManualCookie);

  const [newCategoryName, setNewCategoryName] = useState("");
  const lang = config.languages.find((l) => l.code === editingCode) ?? config.languages[0];

  return (
    <div>
      <LanguageSwitcherMini languages={config.languages} value={lang.code} onChange={onEditingCodeChange} />

      <Section
        title="Cookie categories"
        description="Cookies found on your live site are auto-matched to a category using the bundled cookie database. Anything unmatched lands in Unclassified."
      >
        <div className="flex flex-col gap-3">
          {config.categories.map((category, index) => {
            const text = lang.categories[category.id] ?? { name: category.id, description: "" };
            return (
              <div key={category.id} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col">
                    <IconButton disabled={index === 0} onClick={() => moveCategory(category.id, "up")} aria-label="Move up">
                      ↑
                    </IconButton>
                    <IconButton disabled={index === config.categories.length - 1} onClick={() => moveCategory(category.id, "down")} aria-label="Move down">
                      ↓
                    </IconButton>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <TextInput
                      value={text.name}
                      onChange={(e) => updateCategoryText(lang.code, category.id, "name", e.target.value)}
                      placeholder="Category name"
                    />
                    <TextArea
                      rows={2}
                      value={text.description}
                      onChange={(e) => updateCategoryText(lang.code, category.id, "description", e.target.value)}
                      placeholder="Category description"
                    />
                    <div className="flex items-center justify-between">
                      <Toggle checked={category.required} onChange={() => toggleCategoryRequired(category.id)} label="Always on (necessary)" />
                      <Button variant="danger" type="button" onClick={() => removeCategory(category.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <TextInput placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              if (!newCategoryName.trim()) return;
              addCategory(newCategoryName.trim());
              setNewCategoryName("");
            }}
          >
            Add category
          </Button>
        </div>
      </Section>

      <Section
        title="Manually declared cookies"
        description="Use this for cookies that can't be auto-detected (set server-side, httpOnly, or added by a third-party script after consent). These always appear in the banner and take priority over the automatic scan."
      >
        <div className="flex flex-col gap-3">
          {config.manualCookies.map((cookie, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 p-3">
              <Field label="Cookie name">
                <TextInput value={cookie.key} onChange={(e) => updateManualCookie(index, { key: e.target.value })} />
              </Field>
              <Field label="Category">
                <Select value={cookie.category} onChange={(e) => updateManualCookie(index, { category: e.target.value })}>
                  {config.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang.categories[c.id]?.name ?? c.id}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Provider">
                <TextInput value={cookie.controller} onChange={(e) => updateManualCookie(index, { controller: e.target.value })} />
              </Field>
              <Field label="Retention">
                <TextInput value={cookie.retention} onChange={(e) => updateManualCookie(index, { retention: e.target.value })} />
              </Field>
              <div className="col-span-2">
                <Field label="Description">
                  <TextInput value={cookie.description} onChange={(e) => updateManualCookie(index, { description: e.target.value })} />
                </Field>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button variant="danger" type="button" onClick={() => removeManualCookie(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" type="button" onClick={() => addManualCookie()}>
          + Add cookie
        </Button>
      </Section>
    </div>
  );
}
