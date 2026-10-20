import { useState } from "react";
import { PackageCheck, X, Loader2, CheckCircle2, Boxes } from "lucide-react";

import type {
  PedidoBetel,
  ConferirPedidoBetelRequest,
} from "../../types/pedido";

interface ModalConferirRecebimentoProps {
  aberto: boolean;
  pedido: PedidoBetel | null;
  onFechar: () => void;
  onConfirmar: (
    pedidoId: number,
    dto: ConferirPedidoBetelRequest,
  ) => Promise<void>;
}

export const ModalConferirRecebimento = ({
  aberto,
  pedido,
  onFechar,
  onConfirmar,
}: ModalConferirRecebimentoProps) => {
  if (!aberto || !pedido) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-conferencia-betel"
        className="my-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PackageCheck size={22} />
            </div>

            <div>
              <h2
                id="titulo-modal-conferencia-betel"
                className="text-base font-semibold text-slate-900"
              >
                Conferir recebimento Betel
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Referência: {pedido.mesAnoReferencia}
                {pedido.numeroPedido
                  ? ` · Pedido ${pedido.numeroPedido}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar conferência"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </header>

        <FormularioConferencia
          key={pedido.id}
          pedido={pedido}
          onFechar={onFechar}
          onConfirmar={onConfirmar}
        />
      </section>
    </div>
  );
};

interface FormularioConferenciaProps {
  pedido: PedidoBetel;
  onFechar: () => void;
  onConfirmar: (
    pedidoId: number,
    dto: ConferirPedidoBetelRequest,
  ) => Promise<void>;
}

const FormularioConferencia = ({
  pedido,
  onFechar,
  onConfirmar,
}: FormularioConferenciaProps) => {
  const [quantidades, setQuantidades] = useState<Record<number, string>>(
    () => {
      const inicial: Record<number, string> = {};

      pedido.itens.forEach((item) => {
        inicial[item.id] = String(item.quantidadeSolicitada);
      });

      return inicial;
    },
  );

  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const fecharFormulario = () => {
    if (!salvando) onFechar();
  };

  const handleSalvar = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (salvando) return;

    if (pedido.itens.length === 0) {
      setErro("Este pedido não possui itens para conferir.");
      return;
    }

    const itensRecebidos: ConferirPedidoBetelRequest["itensRecebidos"] = [];

    for (const item of pedido.itens) {
      const valor = quantidades[item.id]?.trim() ?? "";
      const quantidadeRecebida = Number(valor);

      if (
        valor === "" ||
        !Number.isSafeInteger(quantidadeRecebida) ||
        quantidadeRecebida < 0
      ) {
        setErro(
          "Informe uma quantidade inteira igual ou superior a zero para cada item.",
        );
        return;
      }

      itensRecebidos.push({
        itemId: item.id,
        quantidadeRecebida,
      });
    }

    setSalvando(true);
    setErro(null);

    try {
      await onConfirmar(pedido.id, {
        itensRecebidos,
        observacoes: observacoes.trim() || undefined,
      });

      onFechar();
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o recebimento. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form
      onSubmit={handleSalvar}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="space-y-4 overflow-y-auto p-5 sm:p-6">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <p className="text-sm font-medium text-slate-800">
              Conferência física da remessa
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Informe a quantidade que realmente chegou. Utilize zero
              para os itens ausentes. A entrada no estoque deve ser
              processada pelo backend após a confirmação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Itens na remessa</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {pedido.itens.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">
              Unidades solicitadas
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {pedido.itens.reduce(
                (total, item) => total + item.quantidadeSolicitada,
                0,
              )}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Itens para conferência
            </h3>

            <span className="text-xs text-slate-500">
              {pedido.itens.length}{" "}
              {pedido.itens.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="space-y-2">
            {pedido.itens.map((item) => {
              const titulo =
                item.publicacaoTitulo?.trim() ||
                `Item do catálogo #${item.catalogoMestreId ?? "não identificado"}`;

              const codigo = item.publicacaoCodigo?.trim() || "—";

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Boxes size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium text-slate-900">
                          {titulo}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Código: {codigo}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {item.catalogoMestreId != null && (
                            <span className="inline-flex rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
                              Catálogo Geral
                            </span>
                          )}

                          {item.publicacaoId != null && (
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                              Publicação cadastrada
                            </span>
                          )}

                          <span className="text-xs text-slate-500">
                            Solicitado:{" "}
                            <strong className="font-semibold text-slate-700">
                              {item.quantidadeSolicitada}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                      <label
                        htmlFor={`quantidade-recebida-${item.id}`}
                        className="text-sm font-medium text-slate-700"
                      >
                        Recebido
                      </label>

                      <input
                        id={`quantidade-recebida-${item.id}`}
                        type="number"
                        min={0}
                        step={1}
                        required
                        inputMode="numeric"
                        value={quantidades[item.id] ?? ""}
                        disabled={salvando}
                        onChange={(event) => {
                          setQuantidades((anterior) => ({
                            ...anterior,
                            [item.id]: event.target.value,
                          }));
                          setErro(null);
                        }}
                        className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-2 text-center font-mono text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="observacoes-recebimento-betel"
              className="text-sm font-medium text-slate-700"
            >
              Observações da remessa
            </label>

            <span className="text-xs text-slate-400">Opcional</span>
          </div>

          <textarea
            id="observacoes-recebimento-betel"
            rows={3}
            maxLength={255}
            placeholder="Ex.: item em falta, embalagem danificada..."
            value={observacoes}
            disabled={salvando}
            onChange={(event) => setObservacoes(event.target.value)}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
          />
        </div>

        {erro && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
          >
            {erro}
          </p>
        )}
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={fecharFormulario}
          disabled={salvando}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={salvando || pedido.itens.length === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <PackageCheck size={16} />
              Confirmar recebimento
            </>
          )}
        </button>
      </footer>
    </form>
  );
};