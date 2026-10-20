import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        aberta={sidebarAberta}
        mobileAberta={menuMobileAberto}
        onAlternar={() => setSidebarAberta((valor) => !valor)}
        onFecharMobile={() => setMenuMobileAberto(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onAbrirMenuMobile={() => setMenuMobileAberto(true)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
