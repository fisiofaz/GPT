import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div
      className={`
        mb-5
        rounded-xl
        border border-slate-200
        bg-white
        p-3
        sm:p-4
        ${className}
      `}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        {children}
      </div>
    </div>
  );
}
