import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";

import { AppLayout } from "./components/layout/AppLayout";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Territorios } from "./pages/Territorios";
import { Publicadores } from "./pages/Publicadores";
import { CartaoPublico } from "./pages/CartaoPublico";
import { Publicacoes } from "./pages/Publicacoes";
import { CatalogoPublicacoes } from "./pages/CatalogoPublicacoes";
import { Pedidos } from "./pages/Pedidos";
import HistoricoPublicadores  from "./pages/HistoricoPublicadores";

import AdminCongregacoesPage from "./pages/AdminCongregacoesPage";
import UsuariosCongregacaoPage from "./pages/UsuariosCongregacaoPage";
import UsuarioFormPage from "./components/usuario/UsuarioFormPage";

interface RotaPrivadaProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RotaPrivada: React.FC<RotaPrivadaProps> = ({
  children,
  allowedRoles,
}) => {
  const { autenticado, usuario } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = usuario?.roles ?? [];

    const temPermissao = allowedRoles.some((role) => userRoles.includes(role));

    if (!temPermissao) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors closeButton />

        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />

          <Route path="/mapa/:id" element={<CartaoPublico />} />

          <Route path="/catalogo" element={<CatalogoPublicacoes />} />

          {/* Área autenticada */}
          <Route
            element={
              <RotaPrivada>
                <AppLayout />
              </RotaPrivada>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/publicadores" element={<Publicadores />} />

            <Route path="/historico-publicadores" element={<HistoricoPublicadores />} />

            <Route path="/territorios" element={<Territorios />} />

            <Route path="/publicacoes" element={<Publicacoes />} />

            <Route path="/pedidos" element={<Pedidos />} />

            <Route path="/usuarios/novo" element={<UsuarioFormPage />} />

            <Route path="/usuarios/editar/:id" element={<UsuarioFormPage />} />

            <Route
              path="/admin/congregacoes"
              element={
                <RotaPrivada allowedRoles={["ROLE_ADMIN_GERAL"]}>
                  <AdminCongregacoesPage />
                </RotaPrivada>
              }
            />

            <Route
              path="/admin/usuarios-congregacao"
              element={
                <RotaPrivada
                  allowedRoles={[
                    "ROLE_ADMIN_GERAL",
                    "ROLE_SUPERINTENDENTE_SERVICO",
                    "ROLE_ANCIAO",
                  ]}
                >
                  <UsuariosCongregacaoPage />
                </RotaPrivada>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
