import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onClear?: () => void;
}

export function SearchInput({
  value,
  onClear,
  placeholder = "Pesquisar...",
  className = "",
  ...props
}: SearchInputProps) {
  const possuiValor = value !== undefined && String(value).length > 0;

  return (
    <div className={`relative ${className}`}>
      <Search
        size={17}
        strokeWidth={1.8}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />

      <input
        type="search"
        value={value}
        placeholder={placeholder}
        className="
          h-10 w-full rounded-lg
          border border-slate-200
          bg-white
          pl-9 pr-9
          text-sm text-slate-900
          placeholder:text-slate-400
          transition-colors
          focus:border-slate-400
          focus:outline-none
          focus:ring-2
          focus:ring-slate-200
          disabled:cursor-not-allowed
          disabled:bg-slate-50
        "
        {...props}
      />

      {possuiValor && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="
            absolute right-2 top-1/2
            flex h-7 w-7
            -translate-y-1/2
            items-center justify-center
            rounded-md
            text-slate-400
            hover:bg-slate-100
            hover:text-slate-600
          "
          aria-label="Limpar pesquisa"
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
