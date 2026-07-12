import type { LanguageText } from "../runtime/types";

export function LanguageSwitcherMini({
  languages,
  value,
  onChange,
}: {
  languages: LanguageText[];
  value: string;
  onChange: (code: string) => void;
}) {
  if (languages.length < 2) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-1.5 rounded-lg bg-zinc-100 p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onChange(lang.code)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === lang.code ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {lang.label} <span className="text-zinc-400">({lang.code})</span>
        </button>
      ))}
    </div>
  );
}
