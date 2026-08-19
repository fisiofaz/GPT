import { createContext } from "react";

export interface UsuarioLogado {
  nome: string;
  email: string;
  congregacaoId: number | null;
  roles: string[];
}

export interface AuthContextType {
  usuario: UsuarioLogado | null;
  token: string | null;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  temRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);
