import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</p>}
      <div className="mt-3 flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      {children}
      {hint && <span className="text-[11px] leading-relaxed text-zinc-400">{hint}</span>}
    </label>
  );
}

const inputStyles =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-shadow focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputStyles} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputStyles} ${props.className ?? ""}`} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputStyles} ${props.className ?? ""}`}>
      {children}
    </select>
  );
}

export function Button({ variant = "secondary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
    secondary: "bg-white border border-zinc-300 text-zinc-900 shadow-sm hover:bg-zinc-50",
    ghost: "text-zinc-600 hover:bg-zinc-100",
    danger: "text-red-600 hover:bg-red-50",
  }[variant];

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-0.5">
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-zinc-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
      {label && <span className="text-sm text-zinc-700">{label}</span>}
    </label>
  );
}

export function IconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 ${className}`}
    />
  );
}
