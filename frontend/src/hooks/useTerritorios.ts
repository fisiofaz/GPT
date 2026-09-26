import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { publicadorService } from "../services/publicadorService";
import { territorioService } from "../services/territorioService";
import type { Publicador } from "../types/publicador";
import type {
  DevolucaoRequest,
  DesignacaoRequest,
  HistoricoTerritorio,
  Territorio,
  TerritorioRequest,
} from "../types/territorio";

export function useTerritorios(congregacaoId?: number | null) {
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [historicoS13, setHistoricoS13] = useState<HistoricoTerritorio[]>([]);

  const [carregando, setCarregando] = useState(Boolean(congregacaoId));
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const buscarDados = useCallback(async () => {
    if (congregacaoId == null) {
      return null;
    }

    const [terData, pubData] = await Promise.all([
      territorioService.listarPorCongregacao(congregacaoId),
      publicadorService.listarPorCongregacao(congregacaoId),
    ]);

    return {
      territorios: terData,
      publicadores: pubData,
    };
  }, [congregacaoId]);

  useEffect(() => {
    if (congregacaoId == null) {
      return;
    }

    let ativo = true;

    const carregarInicial = async () => {
      try {
        const dados = await buscarDados();

        if (!ativo || !dados) {
          return;
        }

        setTerritorios(dados.territorios);
        setPublicadores(dados.publicadores.content);
      } catch {
        if (!ativo) {
          return;
        }

        setTerritorios([]);
        setPublicadores([]);
        toast.error("Erro ao carregar dados de territórios.");
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void carregarInicial();

    return () => {
      ativo = false;
    };
  }, [congregacaoId, buscarDados]);

  const recarregar = useCallback(async () => {
    if (congregacaoId == null) {
      return;
    }

    setCarregando(true);

    try {
      const dados = await buscarDados();

      if (!dados) {
        return;
      }

      setTerritorios(dados.territorios);
      setPublicadores(dados.publicadores.content);
    } catch {
      setTerritorios([]);
      setPublicadores([]);
      toast.error("Erro ao atualizar territórios.");
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId, buscarDados]);

  const salvarTerritorio = async (
    dto: TerritorioRequest,
    id?: number,
  ): Promise<void> => {
    try {
      if (id != null) {
        await territorioService.atualizar(id, dto);
        toast.success(`Território ${dto.numero} atualizado com sucesso!`);
      } else {
        await territorioService.criar(dto);
        toast.success(`Território ${dto.numero} cadastrado com sucesso!`);
      }

      await recarregar();
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error
          ? err.message
          : "Falha ao salvar território.";

      toast.error(mensagem);
      throw err;
    }
  };

  const excluirTerritorio = async (
    id: number,
    numero: string,
  ): Promise<void> => {
    try {
      await territorioService.deletar(id);
      toast.success(`Território ${numero} excluído com sucesso.`);

      await recarregar();
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error
          ? err.message
          : "Falha ao excluir território.";

      toast.error(mensagem);
    }
  };

  const designarTerritorio = async (
    territorioId: number,
    dto: DesignacaoRequest,
  ): Promise<void> => {
    try {
      await territorioService.retirar(territorioId, dto);
      toast.success("Território designado com sucesso!");

      await recarregar();
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error
          ? err.message
          : "Falha ao designar território.";

      toast.error(mensagem);
      throw err;
    }
  };

  const devolverTerritorio = async (
    territorioId: number,
    dto: DevolucaoRequest,
  ): Promise<void> => {
    try {
      await territorioService.devolver(territorioId, dto);
      toast.success("Território devolvido com sucesso!");

      await recarregar();
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error
          ? err.message
          : "Falha ao registrar devolução.";

      toast.error(mensagem);
      throw err;
    }
  };

  const carregarRelatorioS13 = async (): Promise<void> => {
    if (congregacaoId == null) {
      return;
    }

    setCarregandoHistorico(true);

    try {
      const dados = await territorioService.listarHistoricoGeral(
        congregacaoId,
      );

      setHistoricoS13(dados);
    } catch {
      setHistoricoS13([]);
      toast.error("Erro ao carregar relatório S-13.");
    } finally {
      setCarregandoHistorico(false);
    }
  };

  return {
    territorios,
    publicadores,
    historicoS13,
    carregando,
    carregandoHistorico,
    salvarTerritorio,
    excluirTerritorio,
    designarTerritorio,
    devolverTerritorio,
    carregarRelatorioS13,
    recarregar,
  };
}