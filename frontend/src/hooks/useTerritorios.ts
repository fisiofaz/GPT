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

  // Paginação dos territórios
  const [paginaTerritorios, setPaginaTerritorios] = useState(0);
  const [tamanhoPaginaTerritorios, setTamanhoPaginaTerritorios] = useState(10);
  const [totalPaginasTerritorios, setTotalPaginasTerritorios] = useState(0);
  const [totalTerritorios, setTotalTerritorios] = useState(0);

  // Paginação do histórico / S-13
  const [paginaHistorico, setPaginaHistorico] = useState(0);
  const [tamanhoPaginaHistorico, setTamanhoPaginaHistorico] = useState(10);
  const [totalPaginasHistorico, setTotalPaginasHistorico] = useState(0);
  const [totalHistorico, setTotalHistorico] = useState(0);

  const buscarDados = useCallback(async () => {
    if (congregacaoId == null) {
      return null;
    }

    const [terData, pubData] = await Promise.all([
      territorioService.listarPorCongregacao(
        congregacaoId,
        paginaTerritorios,
        tamanhoPaginaTerritorios,
      ),
      publicadorService.listarPorCongregacao(congregacaoId),
    ]);

    return {
      territorios: terData,
      publicadores: pubData,
    };
  }, [congregacaoId, paginaTerritorios, tamanhoPaginaTerritorios]);

  useEffect(() => {
    if (congregacaoId == null) {
      return;
    }

    let ativo = true;

    const carregarInicial = async () => {
      try {
        setCarregando(true);

        const dados = await buscarDados();

        if (!ativo || !dados) {
          return;
        }

        setTerritorios(dados.territorios.content);
        setTotalPaginasTerritorios(dados.territorios.totalPages);
        setTotalTerritorios(dados.territorios.totalElements);
        setPublicadores(dados.publicadores.content);
      } catch {
        if (!ativo) {
          return;
        }

        setTerritorios([]);
        setPublicadores([]);
        setTotalPaginasTerritorios(0);
        setTotalTerritorios(0);

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
  }, [buscarDados, congregacaoId]);

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

      setTerritorios(dados.territorios.content);
      setTotalPaginasTerritorios(dados.territorios.totalPages);
      setTotalTerritorios(dados.territorios.totalElements);
      setPublicadores(dados.publicadores.content);
    } catch {
      setTerritorios([]);
      setPublicadores([]);
      setTotalPaginasTerritorios(0);
      setTotalTerritorios(0);

      toast.error("Erro ao atualizar territórios.");
    } finally {
      setCarregando(false);
    }
  }, [buscarDados, congregacaoId]);

  // ============================================================
  // Criar / salvar território
  // ============================================================

  const salvarTerritorio = async (
    dto: TerritorioRequest,
    id?: number,
  ): Promise<void> => {
    try {
      if (id != null) {
        await territorioService.atualizar(id, {
          numero: dto.numero,
          nome: dto.nome,
          descricao: dto.descricao,
        });

        toast.success(`Território ${dto.numero} atualizado com sucesso!`);
      } else {
        await territorioService.criar(dto);

        toast.success(`Território ${dto.numero} cadastrado com sucesso!`);
      }

      await recarregar();
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error ? err.message : "Falha ao salvar território.";

      toast.error(mensagem);
      throw err;
    }
  };

  // ============================================================
  // Atualizar território
  // ============================================================

  const atualizarTerritorio = async (
    id: number,
    dto: {
      numero: string;
      nome: string;
      descricao?: string;
    },
  ): Promise<void> => {
    try {
      await territorioService.atualizar(id, dto);

      toast.success(`Território ${dto.numero} atualizado com sucesso!`);

      await recarregar();
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error ? err.message : "Falha ao atualizar território.";

      toast.error(mensagem);
      throw err;
    }
  };

  // ============================================================
  // Excluir território
  // ============================================================

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
        err instanceof Error ? err.message : "Falha ao excluir território.";

      toast.error(mensagem);
    }
  };

  // ============================================================
  // Designar território
  // ============================================================

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
        err instanceof Error ? err.message : "Falha ao designar território.";

      toast.error(mensagem);
      throw err;
    }
  };

  // ============================================================
  // Devolver território
  // ============================================================

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
        err instanceof Error ? err.message : "Falha ao registrar devolução.";

      toast.error(mensagem);
      throw err;
    }
  };

  // ============================================================
  // Paginação dos territórios
  // ============================================================

  const paginaAnteriorTerritorios = () => {
    setPaginaTerritorios((pagina) => Math.max(0, pagina - 1));
  };

  const proximaPaginaTerritorios = () => {
    setPaginaTerritorios((pagina) =>
      Math.min(Math.max(totalPaginasTerritorios - 1, 0), pagina + 1),
    );
  };

  const alterarTamanhoPaginaTerritorios = (tamanho: number) => {
    setTamanhoPaginaTerritorios(tamanho);
    setPaginaTerritorios(0);
  };

  // ============================================================
  // Relatório S-13 / Histórico
  // ============================================================

  const carregarRelatorioS13 = async (
    pagina = paginaHistorico,
    tamanho = tamanhoPaginaHistorico,
  ): Promise<void> => {
    if (congregacaoId == null) {
      return;
    }

    setCarregandoHistorico(true);

    try {
      const dados = await territorioService.listarHistoricoGeral(
        congregacaoId,
        pagina,
        tamanho,
      );

      setHistoricoS13(dados.content);
      setPaginaHistorico(dados.page);
      setTamanhoPaginaHistorico(dados.size);
      setTotalPaginasHistorico(dados.totalPages);
      setTotalHistorico(dados.totalElements);
    } catch {
      setHistoricoS13([]);
      setTotalPaginasHistorico(0);
      setTotalHistorico(0);

      toast.error("Erro ao carregar relatório S-13.");
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const paginaAnteriorHistorico = () => {
    const novaPagina = Math.max(0, paginaHistorico - 1);

    setPaginaHistorico(novaPagina);

    void carregarRelatorioS13(novaPagina, tamanhoPaginaHistorico);
  };

  const proximaPaginaHistorico = () => {
    const novaPagina = Math.min(
      Math.max(totalPaginasHistorico - 1, 0),
      paginaHistorico + 1,
    );

    setPaginaHistorico(novaPagina);

    void carregarRelatorioS13(novaPagina, tamanhoPaginaHistorico);
  };

  const alterarTamanhoPaginaHistorico = (tamanho: number) => {
    setTamanhoPaginaHistorico(tamanho);
    setPaginaHistorico(0);

    void carregarRelatorioS13(0, tamanho);
  };

  return {
    // Dados
    territorios,
    publicadores,
    historicoS13,

    // Estados de carregamento
    carregando,
    carregandoHistorico,

    // Ações de território
    salvarTerritorio,
    atualizarTerritorio,
    excluirTerritorio,
    designarTerritorio,
    devolverTerritorio,
    recarregar,

    // Relatório S-13
    carregarRelatorioS13,

    // Paginação dos territórios
    paginaTerritorios,
    totalPaginasTerritorios,
    totalTerritorios,
    tamanhoPaginaTerritorios,
    paginaAnteriorTerritorios,
    proximaPaginaTerritorios,
    alterarTamanhoPaginaTerritorios,

    // Paginação do histórico / S-13
    paginaHistorico,
    totalPaginasHistorico,
    totalHistorico,
    tamanhoPaginaHistorico,
    paginaAnteriorHistorico,
    proximaPaginaHistorico,
    alterarTamanhoPaginaHistorico,
  };
}
