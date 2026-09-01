import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Territorios } from "./pages/Territorios";
import { Publicadores } from "./pages/Publicadores";
import { CartaoPublico } from "./pages/CartaoPublico";
import { Publicacoes } from "./pages/Publicacoes";
import { CatalogoPublicacoes } from "./pages/CatalogoPublicacoes";
import { Pedidos } from "./pages/Pedidos";
import AdminCongregacoesPage from "./pages/AdminCongregacoesPage";
import UsuariosCongregacaoPage from "./pages/UsuariosCongregacaoPage";
import UsuarioFormPage from "./components/usuario/UsuarioFormPage";

interface RotaPrivadaProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Lista opcional de papéis permitidos
}

const RotaPrivada: React.FC<RotaPrivadaProps> = ({
  children,
  allowedRoles,
}) => {
  const { autenticado, usuario } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Se foram exigidos papéis específicos, validamos usando 'roles' (no plural)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles: string[] = usuario?.roles || [];
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
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/mapa/:id" element={<CartaoPublico />} />

          {/* Rotas Privadas Padrão */}
          <Route
            path="/publicadores"
            element={
              <RotaPrivada>
                <Publicadores />
              </RotaPrivada>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RotaPrivada>
                <Dashboard />
              </RotaPrivada>
            }
          />

          <Route
            path="/territorios"
            element={
              <RotaPrivada>
                <Territorios />
              </RotaPrivada>
            }
          />

          <Route
            path="/publicacoes"
            element={
              <RotaPrivada>
                <Publicacoes />
              </RotaPrivada>
            }
          />

          <Route path="/catalogo" element={<CatalogoPublicacoes />} />

          <Route
            path="/pedidos"
            element={
              <RotaPrivada>
                <Pedidos />
              </RotaPrivada>
            }
          />

          {/* 🏢 Novas Rotas Multi-Tenant com Proteção por Papéis */}

          {/* Exclusivo para Admin Geral */}
          <Route
            path="/admin/congregacoes"
            element={
              <RotaPrivada allowedRoles={["ROLE_ADMIN_GERAL"]}>
                <AdminCongregacoesPage />
              </RotaPrivada>
            }
          />

          <Route path="/usuarios/novo" element={<UsuarioFormPage />} />
          <Route path="/usuarios/editar/:id" element={<UsuarioFormPage />} />

          {/* Para Superintendente de Serviço, Anciãos e Admin Geral */}
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
