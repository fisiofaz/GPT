import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { publicacaoService } from "../services/publicacaoService";
import { publicadorService } from "../services/publicadorService";
import type {
  Publicacao,
  PublicacaoRequest,
  MovimentacaoEstoqueRequest,
  MovimentacaoResponse,
  CatalogoMestreItem,
} from "../types/publicacao";
import type { Publicador } from "../types/publicador";

export function usePublicacoes(congregacaoId?: number | null) {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [catalogoMestre, setCatalogoMestre] = useState<CatalogoMestreItem[]>(
    [],
  );
  const [historico, setHistorico] = useState<MovimentacaoResponse[]>([]);

  // Inicializa com true apenas se houver ID de congregação para buscar
  const [carregando, setCarregando] = useState<boolean>(Boolean(congregacaoId));
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Função manual para recarregar dados após mutações (POST, PUT, DELETE)
  const recarregar = useCallback(async () => {
    if (!congregacaoId) return;

    try {
      const [pubData, pubsPessoas, catalogoData] = await Promise.all([
        publicacaoService.listarPorCongregacao(congregacaoId),
        publicadorService.listarPorCongregacao(congregacaoId),
        publicacaoService.listarCatalogoMestre().catch(() => []),
      ]);
      setPublicacoes(pubData);
      setPublicadores(pubsPessoas);
      setCatalogoMestre(catalogoData);
    } catch {
      setPublicacoes([]);
      toast.error("Erro ao sincronizar dados de publicações.");
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId]);

  // Sincronização inicial com controle de desmontagem (isMounted)
  useEffect(() => {
    let ativo = true;

    if (!congregacaoId) return;

    const carregar = async () => {
      try {
        const [pubData, pubsPessoas, catalogoData] = await Promise.all([
          publicacaoService.listarPorCongregacao(congregacaoId),
          publicadorService.listarPorCongregacao(congregacaoId),
          publicacaoService.listarCatalogoMestre().catch(() => []),
        ]);
        if (ativo) {
          setPublicacoes(pubData);
          setPublicadores(pubsPessoas);
          setCatalogoMestre(catalogoData);
        }
      } catch {
        if (ativo) {
          setPublicacoes([]);
          toast.error("Erro ao sincronizar dados de publicações.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [congregacaoId]);

  const salvarPublicacao = async (dto: PublicacaoRequest, id?: number) => {
    try {
      if (id) {
        await publicacaoService.atualizar(id, dto);
        toast.success(`Publicação "${dto.titulo}" atualizada com sucesso!`);
      } else {
        await publicacaoService.cadastrar(dto);
        toast.success(`Publicação "${dto.titulo}" cadastrada com sucesso!`);
      }
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao salvar publicação.";
      toast.error(msg);
      throw err;
    }
  };

  const excluirPublicacao = async (id: number, titulo: string) => {
    try {
      await publicacaoService.deletar(id);
      toast.success(`"${titulo}" removido do estoque ativo.`);
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao excluir publicação.";
      toast.error(msg);
    }
  };

  const movimentarEstoque = async (
    publicacaoId: number,
    dto: MovimentacaoEstoqueRequest,
  ) => {
    try {
      await publicacaoService.movimentarEstoque(publicacaoId, dto);
      const acao =
        dto.tipo === "SAIDA"
          ? "Saída registrada"
          : dto.tipo === "ENTRADA"
            ? "Entrada registrada"
            : "Inventário ajustado";
      toast.success(`${acao} com sucesso!`);
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao movimentar estoque.";
      toast.error(msg);
      throw err;
    }
  };

  const carregarHistorico = async () => {
    if (!congregacaoId) return;
    setCarregandoHistorico(true);
    try {
      const dados = await publicacaoService.listarHistoricoGeral(congregacaoId);
      setHistorico(dados);
    } catch {
      setHistorico([]);
      toast.error("Erro ao carregar histórico de movimentações.");
    } finally {
      setCarregandoHistorico(false);
    }
  };

  return {
    publicacoes,
    publicadores,
    catalogoMestre,
    historico,
    carregando,
    carregandoHistorico,
    salvarPublicacao,
    excluirPublicacao,
    movimentarEstoque,
    carregarHistorico,
    recarregar,
  };
}
