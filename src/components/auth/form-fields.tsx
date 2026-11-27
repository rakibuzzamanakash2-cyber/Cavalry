"use client";

// Ported from Ru'sAuth (src/app/component/FormFields.tsx). Each field also
// gets a screen-reader label, since the visible text is only a placeholder.

import { Eye, EyeOff, Lock } from "@mynaui/icons-react";
import { useId, useState, type ComponentType, type InputHTMLAttributes } from "react";
import { fieldInputClass, fieldWrapperClass } from "./form-styles";

type IconComponent = ComponentType<{ size?: number; stroke?: number; className?: string }>;

export function IconField({
  icon: Icon,
  label,
  hint,
  inputClassName = "",
  ...inputProps
}: {
  icon: IconComponent;
  label: string;
  hint?: string;
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className={fieldWrapperClass}>
        <Icon size={20} stroke={1.5} className="shrink-0" />
        <input
          {...inputProps}
          id={id}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`${fieldInputClass} ${inputClassName}`.trim()}
        />
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-muted mt-1.5 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField({
  label = "Password",
  hint,
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...inputProps
}: {
  label?: string;
  hint?: string;
  showLabel?: string;
  hideLabel?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className={fieldWrapperClass}>
        <Lock size={20} stroke={1.5} className="shrink-0" />
        <input
          {...inputProps}
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={fieldInputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="hover:text-primary cursor-pointer transition-colors"
        >
          {visible ? <EyeOff size={20} stroke={1.5} /> : <Eye size={20} stroke={1.5} />}
        </button>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-muted mt-1.5 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
