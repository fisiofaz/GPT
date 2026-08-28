import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { territorioService } from "../services/territorioService";
import { publicadorService } from "../services/publicadorService";
import type {
  Territorio,
  TerritorioRequest,
  DesignacaoRequest,
  DevolucaoRequest,
  HistoricoTerritorio,
} from "../types/territorio";
import type { Publicador } from "../types/publicador";

export function useTerritorios(congregacaoId?: number | null) {
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [historicoS13, setHistoricoS13] = useState<HistoricoTerritorio[]>([]);

  const [carregando, setCarregando] = useState<boolean>(Boolean(congregacaoId));
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const recarregar = useCallback(async () => {
    if (!congregacaoId) {
      setCarregando(false);
      return;
    }

    try {
      const id = Number(congregacaoId);
      const [terData, pubData] = await Promise.all([
        territorioService.listarPorCongregacao(id),
        publicadorService.listarPorCongregacao(id),
      ]);
      setTerritorios(terData);
      setPublicadores(pubData);
    } catch {
      setTerritorios([]);
      toast.error("Erro ao atualizar territórios.");
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId]);

  useEffect(() => {
    let ativo = true;
    if (!congregacaoId) return;

    const carregarInicial = async () => {
      try {
        const id = Number(congregacaoId);
        const [terData, pubData] = await Promise.all([
          territorioService.listarPorCongregacao(id),
          publicadorService.listarPorCongregacao(id),
        ]);
        if (ativo) {
          setTerritorios(terData);
          setPublicadores(pubData);
        }
      } catch {
        if (ativo) {
          setTerritorios([]);
          toast.error("Erro ao carregar dados de territórios.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregarInicial();

    return () => {
      ativo = false;
    };
  }, [congregacaoId]);

  const salvarTerritorio = async (dto: TerritorioRequest, id?: number) => {
    try {
      if (id) {
        await territorioService.atualizar(id, dto);
        toast.success(`Território ${dto.numero} atualizado com sucesso!`);
      } else {
        await territorioService.criar(dto);
        toast.success(`Território ${dto.numero} cadastrado com sucesso!`);
      }
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao salvar território.";
      toast.error(msg);
      throw err;
    }
  };

  const excluirTerritorio = async (id: number, numero: string) => {
    try {
      await territorioService.deletar(id);
      toast.success(`Território ${numero} excluído com sucesso.`);
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao excluir território.";
      toast.error(msg);
    }
  };

  const designarTerritorio = async (
    territorioId: number,
    dto: DesignacaoRequest,
  ) => {
    try {
      await territorioService.retirar(territorioId, dto);
      toast.success("Território designado com sucesso!");
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao designar território.";
      toast.error(msg);
      throw err;
    }
  };

  const devolverTerritorio = async (
    territorioId: number,
    dto: DevolucaoRequest,
  ) => {
    try {
      await territorioService.devolver(territorioId, dto);
      toast.success("Território devolvido com sucesso!");
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao registrar devolução.";
      toast.error(msg);
      throw err;
    }
  };

  const carregarRelatorioS13 = async () => {
    if (!congregacaoId) return;
    setCarregandoHistorico(true);
    try {
      const dados = await territorioService.listarHistoricoGeral(
        Number(congregacaoId),
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
