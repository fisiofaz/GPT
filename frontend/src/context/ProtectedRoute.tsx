// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Recupera o usuário salvo no localStorage (ajuste conforme o formato que você guarda no login)
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");

  // Supondo que o usuário tenha um array de roles ou uma string com a role principal
  // Ex: usuarioLogado.roles = ['ROLE_ADMIN_GERAL'] ou usuarioLogado.role = 'ROLE_ADMIN_GERAL'
  const userRoles: string[] =
    usuarioLogado.roles || (usuarioLogado.role ? [usuarioLogado.role] : []);

  // Verifica se o usuário tem pelo menos uma das roles permitidas
  const temPermissao = allowedRoles.some((role) => userRoles.includes(role));

  if (!temPermissao) {
    // Se não tiver permissão, redireciona para uma página padrão (ex: dashboard ou login)
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
