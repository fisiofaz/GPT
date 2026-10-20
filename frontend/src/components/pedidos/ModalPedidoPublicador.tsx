import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  Search,
  UserCheck,
  X,
} from "lucide-react";

import {
  pedidoPublicadorSchema,
  type PedidoPublicadorFormData,
} from "../../schemas/pedidoSchema";

import type { Publicador } from "../../types/publicador";
import type { CatalogoMestreItem } from "../../types/publicacao";
import type { PedidoPublicadorCatalogoRequest } from "../../types/pedido";

interface ModalPedidoPublicadorProps {
  aberto: boolean;
  congregacaoId: number;
  publicadores: Publicador[];
  catalogoMestre: CatalogoMestreItem[];
  onFechar: () => void;
  onSalvar: (dto: PedidoPublicadorCatalogoRequest) => Promise<void>;
}

export const ModalPedidoPublicador = ({
  aberto,
  congregacaoId,
  publicadores,
  catalogoMestre,
  onFechar,
  onSalvar,
}: ModalPedidoPublicadorProps) => {
  const [filtroBusca, setFiltroBusca] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PedidoPublicadorFormData>({
    resolver: zodResolver(pedidoPublicadorSchema),
    defaultValues: {
      publicadorId: "",
      catalogoMestreId: "",
      quantidade: 1,
      observacoes: "",
    },
  });

  const publicacaoSelecionada = useWatch({
    control,
    name: "catalogoMestreId",
    defaultValue: "",
  });

  const itensCatalogoFiltrados = useMemo(() => {
    const termo = filtroBusca.trim().toLocaleLowerCase();

    return catalogoMestre.filter(
      (item) =>
        item.titulo.toLocaleLowerCase().includes(termo) ||
        item.codigo.toLocaleLowerCase().includes(termo),
    );
  }, [catalogoMestre, filtroBusca]);

  const itemSelecionado = useMemo(
    () =>
      catalogoMestre.find(
        (item) => String(item.id) === publicacaoSelecionada,
      ),
    [catalogoMestre, publicacaoSelecionada],
  );

  if (!aberto) return null;

  const fecharModal = () => {
    if (isSubmitting) return;
    reset();
    setFiltroBusca("");
    onFechar();
  };

  const onSubmit = async (data: PedidoPublicadorFormData) => {
    if (congregacaoId <= 0) {
      throw new Error("Não foi possível identificar a congregação.");
    }

    await onSalvar({
      publicadorId: Number(data.publicadorId),
      catalogoMestreId: Number(data.catalogoMestreId),
      congregacaoId,
      quantidade: data.quantidade,
      observacoes: data.observacoes?.trim() || undefined,
    });

    reset();
    setFiltroBusca("");
    onFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) fecharModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-pedido-publicador"
        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserCheck size={22} />
            </div>

            <div>
              <h2
                id="titulo-modal-pedido-publicador"
                className="text-base font-semibold text-slate-900"
              >
                Novo pedido de publicador
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Registre uma solicitação individual de publicação.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fecharModal}
            disabled={isSubmitting}
            aria-label="Fechar formulário"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 sm:p-6">
          <div>
            <label
              htmlFor="pedido-publicador"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Publicador *
            </label>

            <select
              id="pedido-publicador"
              {...register("publicadorId")}
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            >
              <option value="">Selecione o publicador</option>
              {publicadores.map((publicador) => (
                <option key={publicador.id} value={publicador.id}>
                  {publicador.nome}
                </option>
              ))}
            </select>

            {errors.publicadorId && (
              <p className="mt-1.5 text-xs text-rose-600">
                {errors.publicadorId.message}
              </p>
            )}

            {publicadores.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-700">
                Nenhum publicador disponível para seleção.
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="busca-catalogo-publicador"
                className="flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <BookOpen size={16} className="text-indigo-600" />
                Publicação do Catálogo Geral *
              </label>

              <span className="text-xs text-slate-500">
                {catalogoMestre.length} itens
              </span>
            </div>

            <div className="relative mb-2">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="busca-catalogo-publicador"
                type="search"
                value={filtroBusca}
                onChange={(event) => setFiltroBusca(event.target.value)}
                placeholder="Pesquisar por título ou código..."
                disabled={isSubmitting}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />
            </div>

            <select
              {...register("catalogoMestreId")}
              aria-label="Selecionar publicação do Catálogo Geral"
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            >
              <option value="">Selecione uma publicação</option>
              {itensCatalogoFiltrados.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.codigo}] {item.titulo} — {item.idioma}
                </option>
              ))}
            </select>

            {errors.catalogoMestreId && (
              <p className="mt-1.5 text-xs text-rose-600">
                {errors.catalogoMestreId.message}
              </p>
            )}

            {itensCatalogoFiltrados.length === 0 && (
              <p className="mt-1.5 text-xs text-slate-500">
                Nenhuma publicação corresponde à pesquisa.
              </p>
            )}

            {itemSelecionado && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-indigo-600"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {itemSelecionado.titulo}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Código: {itemSelecionado.codigo}
                    {" · "}
                    {itemSelecionado.categoria}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="quantidade-pedido-publicador"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Quantidade solicitada *
            </label>

            <input
              id="quantidade-pedido-publicador"
              type="number"
              min={1}
              step={1}
              {...register("quantidade", { valueAsNumber: true })}
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />

            {errors.quantidade && (
              <p className="mt-1.5 text-xs text-rose-600">
                {errors.quantidade.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="observacoes-pedido-publicador"
                className="text-sm font-medium text-slate-700"
              >
                Observações
              </label>
              <span className="text-xs text-slate-400">Opcional</span>
            </div>

            <textarea
              id="observacoes-pedido-publicador"
              rows={3}
              maxLength={255}
              placeholder="Informações adicionais sobre a solicitação..."
              {...register("observacoes")}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />

            {errors.observacoes && (
              <p className="mt-1.5 text-xs text-rose-600">
                {errors.observacoes.message}
              </p>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={fecharModal}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || publicadores.length === 0 || catalogoMestre.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Registrar pedido
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};