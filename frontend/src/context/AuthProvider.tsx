import React, { useState } from "react";
import { api } from "../services/api";
import { AuthContext, type UsuarioLogado } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("gpt_token");
  });

  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => {
    const usuarioArmazenado = localStorage.getItem("gpt_usuario");
    if (usuarioArmazenado) {
      try {
        return JSON.parse(usuarioArmazenado);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = async (email: string, senha: string) => {
    const resposta = await api.post("/auth/login", { email, senha });
    const { token: novoToken, nome, congregacaoId, roles } = resposta.data;

    const dadosUsuario: UsuarioLogado = { nome, email, congregacaoId, roles };

    localStorage.setItem("gpt_token", novoToken);
    localStorage.setItem("gpt_usuario", JSON.stringify(dadosUsuario));

    setToken(novoToken);
    setUsuario(dadosUsuario);
  };

  const logout = () => {
    localStorage.removeItem("gpt_token");
    localStorage.removeItem("gpt_usuario");
    setToken(null);
    setUsuario(null);
  };

  const temRole = (role: string) => {
    return usuario?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado: !!usuario && !!token,
        login,
        logout,
        temRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
