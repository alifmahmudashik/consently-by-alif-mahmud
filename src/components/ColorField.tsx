import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { TextInput } from "./ui";

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-9 w-9 shrink-0 rounded-lg border border-zinc-300"
          style={{ backgroundColor: value }}
          aria-label={`Pick ${label}`}
        />
        <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
        {open && (
          <div className="absolute top-11 left-0 z-20 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
            <HexColorPicker color={value} onChange={onChange} />
          </div>
        )}
      </div>
    </div>
  );
}
