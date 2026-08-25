import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Territorios } from "./pages/Territorios";
import { Publicadores } from "./pages/Publicadores";
import { CartaoPublico } from "./pages/CartaoPublico";

const RotaPrivada: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { autenticado } = useAuth();
  return autenticado ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/mapa/:id" element={<CartaoPublico />} />

          {/* Rotas Privadas */}
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
