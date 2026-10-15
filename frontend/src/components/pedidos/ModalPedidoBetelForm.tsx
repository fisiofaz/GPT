import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Boxes,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

import type {
  ItemPedidoBetelRequest,
  OrigemItemPedido,
  PedidoBetel,
  PedidoBetelCriarRequest,
  PedidoPublicador,
} from "../../types/pedido";

import type { CatalogoMestreItem } from "../../types/publicacao";

interface ModalPedidoBetelFormProps {
  aberto: boolean;
  congregacaoId: number;
  pedidoParaEditar: PedidoBetel | null;
  catalogoMestre: CatalogoMestreItem[];
  pedidosPublicadoresPendentes: PedidoPublicador[];
  onFechar: () => void;
  onSalvar: (
    dto: PedidoBetelCriarRequest,
    id?: number,
  ) => Promise<void>;
}

interface FormularioProps {
  congregacaoId: number;
  pedidoParaEditar: PedidoBetel | null;
  catalogoMestre: CatalogoMestreItem[];
  pedidosPublicadoresPendentes: PedidoPublicador[];
  onFechar: () => void;
  onSalvar: (
    dto: PedidoBetelCriarRequest,
    id?: number,
  ) => Promise<void>;
}

const obterMesAtual = (): string => {
  const agora = new Date();

  return `${agora.getFullYear()}-${String(
    agora.getMonth() + 1,
  ).padStart(2, "0")}`;
};

const validarMesReferencia = (valor: string): boolean => {
  const correspondencia = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(valor);

  return Boolean(correspondencia);
};

export const ModalPedidoBetelForm: React.FC<
  ModalPedidoBetelFormProps
> = ({
  aberto,
  congregacaoId,
  pedidoParaEditar,
  catalogoMestre,
  pedidosPublicadoresPendentes,
  onFechar,
  onSalvar,
}) => {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onFechar();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pedido-betel-titulo"
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700">
              <Boxes className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2
                id="pedido-betel-titulo"
                className="text-lg font-bold text-slate-900"
              >
                {pedidoParaEditar
                  ? "Editar pedido de Betel"
                  : "Novo pedido para Betel"}
              </h2>

              <p className="text-sm text-slate-500">
                Monte o pedido mensal e selecione os pedidos individuais
                que deseja vincular.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar formulário"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <FormularioPedidoBetel
            key={pedidoParaEditar?.id ?? "novo"}
            congregacaoId={congregacaoId}
            pedidoParaEditar={pedidoParaEditar}
            catalogoMestre={catalogoMestre}
            pedidosPublicadoresPendentes={pedidosPublicadoresPendentes}
            onFechar={onFechar}
            onSalvar={onSalvar}
          />
        </div>
      </section>
    </div>
  );
};

const FormularioPedidoBetel: React.FC<FormularioProps> = ({
  congregacaoId,
  pedidoParaEditar,
  catalogoMestre,
  pedidosPublicadoresPendentes,
  onFechar,
  onSalvar,
}) => {
  const [mesAnoReferencia, setMesAnoReferencia] = useState(
    pedidoParaEditar?.mesAnoReferencia ?? obterMesAtual(),
  );

  const [numeroPedido, setNumeroPedido] = useState(
    pedidoParaEditar?.numeroPedido ?? "",
  );

  const [observacoes, setObservacoes] = useState(
    pedidoParaEditar?.observacoes ?? "",
  );

  const [filtroBusca, setFiltroBusca] = useState("");
  const [itemCatalogoId, setItemCatalogoId] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [salvando, setSalvando] = useState(false);

  const [itens, setItens] = useState<ItemPedidoBetelRequest[]>(() =>
    pedidoParaEditar
      ? pedidoParaEditar.itens.map((item) => ({
          publicacaoId: item.publicacaoId ?? undefined,
          catalogoMestreId: item.catalogoMestreId ?? undefined,
          quantidadeSolicitada: item.quantidadeSolicitada,
          origem: item.origem,
        }))
      : [],
  );

  
  const obterChaveItem = (item: ItemPedidoBetelRequest): string =>
    item.catalogoMestreId != null
      ? `catalogo-${item.catalogoMestreId}`
      : `publicacao-${item.publicacaoId}`;

  // Mantém os vínculos explicitamente selecionados nesta sessão.
  const [pedidosSelecionados, setPedidosSelecionados] = useState<number[]>(
    [],
  );

  const catalogoFiltrado = useMemo(() => {
    const termo = filtroBusca.trim().toLocaleLowerCase("pt-BR");

    return catalogoMestre.filter(
      (item) =>
        item.titulo.toLocaleLowerCase("pt-BR").includes(termo) ||
        item.codigo.toLocaleLowerCase("pt-BR").includes(termo),
    );
  }, [catalogoMestre, filtroBusca]);

  const pedidosDisponiveis = useMemo(
    () =>
      pedidosPublicadoresPendentes.filter(
        (pedido) =>
          pedido.status === "PENDENTE" &&
          !pedido.pedidoBetelId &&
          !pedidosSelecionados.includes(pedido.id),
      ),
    [pedidosPublicadoresPendentes, pedidosSelecionados],
  );

  const publicacaoSelecionada = catalogoMestre.find(
    (item) => item.id === Number(itemCatalogoId),
  );

  
  const adicionarItemCatalogo = () => {
    const catalogoMestreId = Number(itemCatalogoId);
    const qtd = Number(quantidade);

    if (
      !itemCatalogoId ||
      !Number.isSafeInteger(catalogoMestreId) ||
      !publicacaoSelecionada
    ) {
      toast.error("Selecione uma publicação válida do catálogo.");
      return;
    }

    if (!Number.isSafeInteger(qtd) || qtd < 1) {
      toast.error("Informe uma quantidade inteira maior que zero.");
      return;
    }

    setItens((atuais) => {
      const existente = atuais.find(
        (item) => item.catalogoMestreId === catalogoMestreId,
      );

      if (existente) {
        return atuais.map((item) =>
          item.catalogoMestreId === catalogoMestreId
            ? {
                ...item,
                quantidadeSolicitada: item.quantidadeSolicitada + qtd,
              }
            : item,
        );
      }

      return [
        ...atuais,
        {
          catalogoMestreId,
          quantidadeSolicitada: qtd,
          origem: "ESTOQUE",
        },
      ];
    });

    setItemCatalogoId("");
    setQuantidade("1");
  };

  const importarPedidoPublicador = (pedido: PedidoPublicador) => {
    if (pedido.status !== "PENDENTE" || pedido.pedidoBetelId) {
      toast.error("Este pedido não está disponível para inclusão.");
      return;
    }

    if (pedidosSelecionados.includes(pedido.id)) {
      toast.info("Este pedido já foi selecionado.");
      return;
    }

    setItens((atuais) => {
      const existente = atuais.find(
        (item) => item.publicacaoId === pedido.publicacaoId,
      );

      if (existente) {
        return atuais.map((item) =>
          item.publicacaoId === pedido.publicacaoId
            ? {
                ...item,
                quantidadeSolicitada:
                  item.quantidadeSolicitada + pedido.quantidade,
                origem: "ESPECIAL_PUBLICADOR",
              }
            : item,
        );
      }

      return [
        ...atuais,
        {
          publicacaoId: pedido.publicacaoId,
          quantidadeSolicitada: pedido.quantidade,
          origem: "ESPECIAL_PUBLICADOR",
        },
      ];
    });

    setPedidosSelecionados((atuais) => [...atuais, pedido.id]);
    toast.success("Pedido individual incluído no formulário.");
  };

  const importarTodosDisponiveis = () => {
    const selecionados = pedidosDisponiveis;

    if (selecionados.length === 0) {
      toast.info("Não há pedidos individuais pendentes disponíveis.");
      return;
    }

    setItens((atuais) => {
      const resultado = [...atuais];

      for (const pedido of selecionados) {
        const indice = resultado.findIndex(
          (item) => item.publicacaoId === pedido.publicacaoId,
        );

        if (indice >= 0) {
          resultado[indice] = {
            ...resultado[indice],
            quantidadeSolicitada:
              resultado[indice].quantidadeSolicitada +
              pedido.quantidade,
            origem: "ESPECIAL_PUBLICADOR",
          };
        } else {
          resultado.push({
            publicacaoId: pedido.publicacaoId,
            quantidadeSolicitada: pedido.quantidade,
            origem: "ESPECIAL_PUBLICADOR",
          });
        }
      }

      return resultado;
    });

    setPedidosSelecionados((atuais) => [
      ...atuais,
      ...selecionados.map((pedido) => pedido.id),
    ]);

    toast.success(
      `${selecionados.length} pedido(s) individual(is) incluído(s) no formulário.`,
    );
  };

  const alterarQuantidade = (chaveItem: string, valor: string) => {
    const qtd = Number(valor);

    if (!Number.isSafeInteger(qtd) || qtd < 1) {
      return;
    }

    setItens((atuais) =>
      atuais.map((item) =>
        obterChaveItem(item) === chaveItem
          ? { ...item, quantidadeSolicitada: qtd }
          : item,
      ),
    );
  };

  const removerItem = (chaveItem: string) => {
    setItens((atuais) =>
      atuais.filter((item) => obterChaveItem(item) !== chaveItem),
    );
  };

  const removerPedidoSelecionado = (pedidoId: number) => {
    const pedido = pedidosPublicadoresPendentes.find(
      (item) => item.id === pedidoId,
    );

    if (!pedido) {
      setPedidosSelecionados((atuais) =>
        atuais.filter((id) => id !== pedidoId),
      );
      return;
    }

    // Recalcula as quantidades vinculadas aos pedidos ainda selecionados.
    setItens((atuais) => {
      const outrosPedidos = pedidosPublicadoresPendentes.filter(
        (item) =>
          pedidosSelecionados.includes(item.id) &&
          item.id !== pedidoId,
      );

      return atuais.map((item) => {
        if (item.publicacaoId !== pedido.publicacaoId) {
          return item;
        }

        const quantidadeDosOutros = outrosPedidos
          .filter((outro) => outro.publicacaoId === item.publicacaoId)
          .reduce((total, outro) => total + outro.quantidade, 0);

        const quantidadeBase = Math.max(
          0,
          item.quantidadeSolicitada - pedido.quantidade,
        );

        const novaQuantidade = Math.max(
          quantidadeDosOutros,
          quantidadeBase,
        );

        return {
          ...item,
          quantidadeSolicitada: novaQuantidade,
          origem:
            quantidadeDosOutros > 0
              ? ("ESPECIAL_PUBLICADOR" as OrigemItemPedido) 
              : ("ESTOQUE" as OrigemItemPedido),
        };
      }).filter((item) => item.quantidadeSolicitada > 0);
    });

    setPedidosSelecionados((atuais) =>
      atuais.filter((id) => id !== pedidoId),
    );
  };

  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!validarMesReferencia(mesAnoReferencia)) {
      toast.error("Informe o mês de referência no formato AAAA-MM.");
      return;
    }

    if (itens.length === 0) {
      toast.error("Adicione pelo menos uma publicação ao pedido.");
      return;
    }

    const chavesItens = itens.map(obterChaveItem);

    if (new Set(chavesItens).size !== chavesItens.length) {
      toast.error("Existe um item duplicado no pedido.");
      return;
    }

    if (
      itens.some(
        (item) =>
          (item.publicacaoId == null) ===
          (item.catalogoMestreId == null),
      )
    ) {
      toast.error(
        "Cada item deve referenciar uma publicação operacional ou um item do catálogo.",
      );
      return;
    }

    if (
      itens.some(
        (item) =>
          !Number.isSafeInteger(item.quantidadeSolicitada) ||
          item.quantidadeSolicitada < 1,
      )
    ) {
      toast.error("Todas as quantidades devem ser inteiras e maiores que zero.");
      return;
    }

    setSalvando(true);

    try {
      const dto: PedidoBetelCriarRequest = {
        congregacaoId,
        mesAnoReferencia,
        numeroPedido:
          numeroPedido.trim() || `BETEL-${mesAnoReferencia}`,
        observacoes: observacoes.trim() || undefined,
        itens,
        pedidosPublicadoresIds: pedidoParaEditar
          ? []
          : pedidosSelecionados,
      };

      await onSalvar(dto, pedidoParaEditar?.id);
      onFechar();
    } catch {
      // Mantém o formulário aberto para que o usuário possa tentar novamente.
      toast.error("Não foi possível salvar o pedido. Verifique os dados e tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Mês de referência"
          type="month"
          required
          value={mesAnoReferencia}
          onChange={(evento) => setMesAnoReferencia(evento.target.value)}
        />

        <Input
          label="Número do pedido"
          value={numeroPedido}
          onChange={(evento) => setNumeroPedido(evento.target.value)}
          placeholder={`BETEL-${mesAnoReferencia}`}
          maxLength={60}
        />
      </div>

      {pedidosDisponiveis.length > 0 && (
        <Card
          padding="md"
          className="space-y-3 border-indigo-200 bg-indigo-50/60"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-700" />

              <div>
                <h3 className="font-semibold text-slate-900">
                  Pedidos individuais pendentes
                </h3>
                <p className="text-sm text-slate-600">
                  Selecione os pedidos que farão parte desta remessa.
                </p>
              </div>
            </div>

            <Badge variant="info">
              {pedidosDisponiveis.length} disponível(is)
            </Badge>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={importarTodosDisponiveis}
            disabled={salvando || pedidosDisponiveis.length === 0}
          >
            Incluir todos os disponíveis
          </Button>

          <div className="space-y-2">
            {pedidosDisponiveis.map((pedido) => (
              <div
                key={pedido.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {pedido.publicadorNome}
                  </p>
                  <p className="text-sm text-slate-600">
                    {pedido.publicacaoCodigo} — {pedido.publicacaoTitulo}
                  </p>
                  <p className="text-xs text-slate-500">
                    Quantidade solicitada: {pedido.quantidade}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => importarPedidoPublicador(pedido)}
                  disabled={salvando}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Incluir
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pedidosSelecionados.length > 0 && (
        <Card padding="md" className="space-y-3">
          <h3 className="font-semibold text-slate-900">
            Pedidos individuais selecionados
          </h3>

          <div className="flex flex-wrap gap-2">
            {pedidosSelecionados.map((id) => {
              const pedido = pedidosPublicadoresPendentes.find(
                (item) => item.id === id,
              );

              return (
                <Badge key={id} variant="info">
                  <span className="inline-flex items-center gap-1">
                    {pedido?.publicadorNome ?? `Pedido #${id}`}
                    <button
                      type="button"
                      aria-label={`Remover vínculo do pedido ${id}`}
                      onClick={() => removerPedidoSelecionado(id)}
                      disabled={salvando}
                      className="ml-1 rounded-full hover:text-rose-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </Badge>
              );
            })}
          </div>
        </Card>
      )}

      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-700" />
          <div>
            <h3 className="font-semibold text-slate-900">Catálogo geral</h3>
            <p className="text-sm text-slate-500">
              {catalogoMestre.length} título(s) disponível(is)
            </p>
          </div>
        </div>

        <Input
          label="Buscar publicação"
          value={filtroBusca}
          onChange={(evento) => setFiltroBusca(evento.target.value)}
          placeholder="Digite o título ou código..."
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_100px_auto]">
          <Select
            label="Publicação"
            value={itemCatalogoId}
            onChange={(evento) => setItemCatalogoId(evento.target.value)}
            required={false}
          >
            <option value="">Selecione uma publicação</option>
            {catalogoFiltrado.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.codigo}] {item.titulo} ({item.idioma})
              </option>
            ))}
          </Select>

          <Input
            label="Quantidade"
            type="number"
            min={1}
            step={1}
            value={quantidade}
            onChange={(evento) => setQuantidade(evento.target.value)}
          />

          <div className="flex items-end">
            <Button
              type="button"
              onClick={adicionarItemCatalogo}
              disabled={salvando}
              fullWidth
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">Itens do pedido</h3>
          <Badge>{itens.length} publicação(ões)</Badge>
        </div>

        {itens.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="font-medium text-slate-700">
              Nenhuma publicação adicionada
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Escolha uma publicação do catálogo ou inclua um pedido individual.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {itens.map((item) => {
              const chaveItem = obterChaveItem(item);

              const catalogo = catalogoMestre.find((publicacao) =>
                item.catalogoMestreId != null
                  ? publicacao.id === item.catalogoMestreId
                  : publicacao.codigo.toLowerCase() ===
                    item.publicacaoId?.toString().toLowerCase(),
              );

              const titulo =
                catalogo?.titulo ??
                `Publicação #${item.publicacaoId ?? item.catalogoMestreId}`;

              return (
                <div
                  key={chaveItem}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {titulo}
                    </p>

                    <p className="text-sm text-slate-500">
                      Código: {catalogo?.codigo ?? "—"}
                    </p>

                    <Badge
                      variant={
                        item.origem === "ESPECIAL_PUBLICADOR"
                          ? "info"
                          : "default"
                      }
                    >
                      {item.origem === "ESPECIAL_PUBLICADOR"
                        ? "Pedido individual"
                        : "Estoque / reposição"}
                    </Badge>
                  </div>

                  <div className="flex items-end gap-2">
                    <Input
                      label="Quantidade"
                      type="number"
                      min={1}
                      step={1}
                      value={String(item.quantidadeSolicitada)}
                      onChange={(event) =>
                        alterarQuantidade(chaveItem, event.target.value)
                      }
                      className="w-24"
                    />

                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removerItem(chaveItem)}
                      disabled={salvando}
                      aria-label={`Remover ${titulo}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Input
        label="Observações"
        value={observacoes}
        onChange={(evento) => setObservacoes(evento.target.value)}
        placeholder="Observações gerais para a remessa..."
        maxLength={1000}
      />

      <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onFechar}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button type="submit" loading={salvando} disabled={salvando}>
          {pedidoParaEditar ? "Salvar alterações" : "Salvar pedido"}
        </Button>
      </footer>
    </form>
  );
};