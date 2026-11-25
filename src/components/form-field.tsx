import { ui } from "@/components/ui";

/** Label + control + hint + error, wired with aria attributes. */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (aria: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label htmlFor={id} className={ui.label}>
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
      })}
      {hint ? (
        <span id={`${id}-hint`} className="text-muted mt-1 block text-xs">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} className="text-accent-strong mt-1 block text-sm">
          {error}
        </span>
      ) : null}
    </div>
  );
}
