import { Building2, ChevronDown, Menu } from "lucide-react";

import { useLocation } from "react-router-dom";

import { navigationGroups } from "./navigation";

import { useAuth } from "../../context/useAuth";
import { useCongregacao } from "../../context/useCongregacao";

interface HeaderProps {
  onAbrirMenuMobile: () => void;
}

export function Header({ onAbrirMenuMobile }: HeaderProps) {
  const location = useLocation();

  const { usuario, temRole } = useAuth();

  const {
    congregacoes,
    congregacaoSelecionadaId,
    selecionarCongregacao,
    carregando: carregandoCongregacoes,
  } = useCongregacao();

  const itemAtual = navigationGroups
    .flatMap((group) => group.items)
    .find((item) => item.path === location.pathname);

  const titulo = itemAtual?.label ?? "Gestão do Serviço";

  const isAdminGeral = temRole("ROLE_ADMIN_GERAL");

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
        {isAdminGeral && (
          <div className="hidden items-center gap-2 md:flex">
            <Building2
              size={17}
              className="shrink-0 text-slate-500"
              aria-hidden="true"
            />

            <div className="relative">
              <select
                value={congregacaoSelecionadaId ?? ""}
                onChange={(event) => {
                  const valor = event.target.value;

                  selecionarCongregacao(valor === "" ? null : Number(valor));
                }}
                disabled={carregandoCongregacoes}
                aria-label="Selecionar congregação operacional"
                className="h-9 min-w-52 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {carregandoCongregacoes
                    ? "Carregando congregações..."
                    : "Selecione a congregação"}
                </option>

                {congregacoes.map((congregacao) => (
                  <option key={congregacao.id} value={congregacao.id}>
                    {congregacao.nome}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">{usuario?.nome}</p>

          <p className="text-xs text-slate-500">
            {isAdminGeral ? "Administrador geral" : "Usuário"}
          </p>
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
