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
  const [carregando, setCarregando] = useState<boolean>(() =>
    Boolean(congregacaoId),
  );
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Função manual para recarregar dados após mutações (POST, PUT, DELETE)
  const recarregar = useCallback(async () => {
    if (!congregacaoId) { 
      setPublicacoes([]); 
      setPublicadores([]); 
      setHistorico([]); 
      setCarregando(false); 
      return; 
    }

    try {
      setCarregando(true);
      const [pubData, pubsPessoas, catalogoData] = await Promise.all([
        publicacaoService.listarPorCongregacao(congregacaoId),
        publicadorService.listarPorCongregacao(congregacaoId),
        publicacaoService.listarCatalogoMestre().catch(() => []),
      ]);
      setPublicacoes(pubData);
      setPublicadores(pubsPessoas.content);
      setCatalogoMestre(catalogoData);
    } catch (err) {
      console.error("[Publicações] Erro ao sincronizar dados:", err);

      setPublicacoes([]); 
      setPublicadores([]); 

      toast.error("Erro ao sincronizar dados de publicações.");
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId]);

  // Sincronização inicial com controle de desmontagem (isMounted)
  useEffect(() => {
    let ativo = true;

    const carregar = async () => { 
      if (!congregacaoId) { 
        return; 
      }

      setCarregando(true);

      try {
        const [pubData, pubsPessoas, catalogoData] = await Promise.all([
          publicacaoService.listarPorCongregacao(congregacaoId),
          publicadorService.listarPorCongregacao(congregacaoId),
          publicacaoService.listarCatalogoMestre().catch((err) => {
            console.error("[Publicações] Falha no catálogo:", err);
            return [];
          }),
        ]);

        if (!ativo) return;

        setPublicacoes(pubData); 
        setPublicadores(pubsPessoas.content);
        setCatalogoMestre(catalogoData);
      } catch (err) {
        console.error("[Publicações] Falha ao carregar dados:", err);

        if (ativo) { 
          setPublicacoes([]); 
          setPublicadores([]); 
          toast.error("Erro ao sincronizar dados de publicações."); 
        }
      } finally {
        if (ativo) { 
          setCarregando(false); 
        }
      }
    };

    void carregar();

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
    if (congregacaoId == null) {
      toast.error("Não foi possível identificar a congregação.");
      throw new Error("Congregação não identificada.");
    }

    try {
      await publicacaoService.deletar(id, congregacaoId);

      // Remove imediatamente da lista exibida.
      setPublicacoes((atuais) =>
        atuais.filter((publicacao) => publicacao.id !== id),
      );

      toast.success(`"${titulo}" removido do estoque ativo desta congregação.`);

      // Sincroniza a lista com o backend.
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Falha ao remover publicação do estoque ativo.";

      toast.error(msg);
      throw err;
    }
  };

  const movimentarEstoque = async (
    publicacaoId: number,
    dto: MovimentacaoEstoqueRequest,
  ) => {
    if (congregacaoId == null) {
      toast.error("Não foi possível identificar a congregação.");
      return;
    }

    try {
      await publicacaoService.movimentarEstoque(
        publicacaoId,
        congregacaoId,
        dto,
      );

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
        err instanceof Error
          ? err.message
          : "Falha ao movimentar estoque.";

      toast.error(msg);
      throw err;
    }
  };

 const carregarHistorico = useCallback(async () => {
    if (!congregacaoId) { 
      setHistorico([]); 
      return; 
    }
    setCarregandoHistorico(true);
    try {
      const dados = await publicacaoService.listarHistoricoGeral(congregacaoId);
      setHistorico(dados);
    } catch (err) {
      console.error("[Publicações] Erro ao carregar histórico:", err);
      setHistorico([]);
      toast.error("Erro ao carregar histórico de movimentações.");
    } finally {
      setCarregandoHistorico(false);
    }
  }, [congregacaoId]);

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
