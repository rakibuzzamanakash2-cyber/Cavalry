/** A labelled checkbox; the label sits next to the box. */
export function FormCheckbox({
  id,
  name,
  label,
  hint,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="accent-primary mt-1 size-4"
      />
      <div>
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {hint ? (
          <span id={`${id}-hint`} className="text-muted block text-xs">
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
