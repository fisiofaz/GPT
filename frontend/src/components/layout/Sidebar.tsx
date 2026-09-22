import { LogOut, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigationGroups } from "./navigation";
import { useAuth } from "../../context/useAuth";

interface SidebarProps {
  aberta: boolean;
  mobileAberta: boolean;
  onAlternar: () => void;
  onFecharMobile: () => void;
}

export function Sidebar({
  aberta,
  mobileAberta,
  onAlternar,
  onFecharMobile,
}: SidebarProps) {
  const { usuario, logout } = useAuth();

  const temPermissao = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    return allowedRoles.some((role) => usuario?.roles?.includes(role));
  };

  const gruposVisiveis = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => temPermissao(item.allowedRoles)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {mobileAberta && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onFecharMobile}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-slate-200 bg-white
          transition-all duration-200
          lg:static lg:z-auto
          ${aberta ? "w-64" : "w-19"}
          ${
            mobileAberta
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo / marca */}
        <div
          className={`
            flex h-16 shrink-0 items-center border-b border-slate-200
            ${aberta ? "justify-between px-4" : "justify-center"}
          `}
        >
          {aberta ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                GT
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  Gestão do Serviço
                </p>
                <p className="text-xs text-slate-500">GTP</p>
              </div>
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              GT
            </div>
          )}

          <button
            type="button"
            onClick={onAlternar}
            className="hidden rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:block"
            aria-label={aberta ? "Recolher menu" : "Expandir menu"}
          >
            {aberta ? <X size={18} /> : <Menu size={18} />}
          </button>

          <button
            type="button"
            onClick={onFecharMobile}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {gruposVisiveis.map((group, groupIndex) => (
              <div key={group.label ?? `group-${groupIndex}`}>
                {aberta && group.label && (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </p>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onFecharMobile}
                        title={!aberta ? item.label : undefined}
                        className={({ isActive }) =>
                          `
                            group flex items-center rounded-lg
                            px-3 py-2.5 text-sm font-medium
                            transition-colors
                            ${
                              isActive
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }
                            ${aberta ? "gap-3" : "justify-center"}
                          `
                        }
                      >
                        <Icon size={19} strokeWidth={1.8} />

                        {aberta && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Rodapé */}
        <div className="shrink-0 border-t border-slate-200 p-3">
          {aberta && usuario && (
            <div className="mb-2 truncate px-2">
              <p className="truncate text-sm font-medium text-slate-800">
                {usuario.nome}
              </p>

              <p className="truncate text-xs text-slate-500">{usuario.email}</p>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            title={!aberta ? "Sair" : undefined}
            className={`
              flex w-full items-center rounded-lg px-3 py-2.5
              text-sm font-medium text-slate-600
              transition-colors
              hover:bg-red-50 hover:text-red-600
              ${aberta ? "gap-3" : "justify-center"}
            `}
          >
            <LogOut size={19} strokeWidth={1.8} />

            {aberta && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
