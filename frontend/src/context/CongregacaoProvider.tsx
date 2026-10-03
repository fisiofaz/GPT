import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "./useAuth";
import { CongregacaoContext } from "./CongregacaoContext";
import { congregacaoService } from "../services/congregacaoService";
import type { Congregacao } from "../types/congregacao";

const STORAGE_KEY = "gpt_congregacao_selecionada";

export const CongregacaoProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { usuario, temRole } = useAuth();

  const isAdminGeral = temRole("ROLE_ADMIN_GERAL");

  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);

  const [congregacaoSelecionadaAdminId, setCongregacaoSelecionadaAdminId] =
    useState<number | null>(() => {
      const armazenada = localStorage.getItem(STORAGE_KEY);

      if (!armazenada) {
        return null;
      }

      const id = Number(armazenada);

      return Number.isInteger(id) && id > 0 ? id : null;
    });

  const [carregando, setCarregando] = useState(false);

  const recarregarCongregacoes = useCallback(async () => {
    if (!isAdminGeral) {
      return;
    }

    try {
      setCarregando(true);

      const dados = await congregacaoService.listar();

      setCongregacoes(dados);
    } finally {
      setCarregando(false);
    }
  }, [isAdminGeral]);

  useEffect(() => {
    if (!isAdminGeral) {
      return;
    }

    void recarregarCongregacoes();
  }, [isAdminGeral, recarregarCongregacoes]);

  const congregacaoSelecionadaId = useMemo(() => {
    if (!usuario) {
      return null;
    }

    if (isAdminGeral) {
      return congregacaoSelecionadaAdminId;
    }

    return usuario.congregacaoId ?? null;
  }, [usuario, isAdminGeral, congregacaoSelecionadaAdminId]);

  const congregacaoSelecionada = useMemo(() => {
    if (congregacaoSelecionadaId === null) {
      return null;
    }

    return (
      congregacoes.find(
        (congregacao) => congregacao.id === congregacaoSelecionadaId,
      ) ?? null
    );
  }, [congregacoes, congregacaoSelecionadaId]);

  const selecionarCongregacao = useCallback(
    (congregacaoId: number | null) => {
      if (!isAdminGeral) {
        return;
      }

      setCongregacaoSelecionadaAdminId(congregacaoId);

      if (congregacaoId === null) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      localStorage.setItem(STORAGE_KEY, String(congregacaoId));
    },
    [isAdminGeral],
  );

  const valor = useMemo(
    () => ({
      congregacoes,
      congregacaoSelecionada,
      congregacaoSelecionadaId,
      carregando,
      selecionarCongregacao,
      recarregarCongregacoes,
    }),
    [
      congregacoes,
      congregacaoSelecionada,
      congregacaoSelecionadaId,
      carregando,
      selecionarCongregacao,
      recarregarCongregacoes,
    ],
  );

  return (
    <CongregacaoContext.Provider value={valor}>
      {children}
    </CongregacaoContext.Provider>
  );
};
