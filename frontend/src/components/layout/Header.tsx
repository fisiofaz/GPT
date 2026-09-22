import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navigationGroups } from "./navigation";
import { useAuth } from "../../context/useAuth";

interface HeaderProps {
  onAbrirMenuMobile: () => void;
}

export function Header({ onAbrirMenuMobile }: HeaderProps) {
  const location = useLocation();
  const { usuario } = useAuth();

  const itemAtual = navigationGroups
    .flatMap((group) => group.items)
    .find((item) => item.path === location.pathname);

  const titulo = itemAtual?.label ?? "Gestão do Serviço";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenuMobile}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {titulo}
          </h1>

          <p className="hidden truncate text-xs text-slate-500 sm:block">
            Gestão do Serviço
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">{usuario?.nome}</p>

          <p className="text-xs text-slate-500">Usuário</p>
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
          title={usuario?.nome}
        >
          {usuario?.nome?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
