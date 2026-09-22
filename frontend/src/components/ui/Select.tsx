import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  id,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <select
        id={id}
        className={`
          h-10 w-full rounded-lg
          border bg-white px-3
          text-sm text-slate-900
          transition-colors
          focus:border-slate-400
          focus:outline-none
          focus:ring-2
          focus:ring-slate-200
          disabled:cursor-not-allowed
          disabled:bg-slate-50
          ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-slate-200"
          }
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        {...props}
      >
        {children}
      </select>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
