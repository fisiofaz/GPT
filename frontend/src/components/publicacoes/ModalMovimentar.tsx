import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import {
  movimentacaoSchema,
  type MovimentacaoFormData,
} from "../../schemas/publicacaoSchema";
import type {
  Publicacao,
  MovimentacaoEstoqueRequest,
  TipoMovimentacao,
} from "../../types/publicacao";
import type { Publicador } from "../../types/publicador";

interface ModalMovimentarProps {
  aberto: boolean;
  publicacao: Publicacao | null;
  tipoInicial: TipoMovimentacao;
  publicadores: Publicador[];
  onFechar: () => void;
  onConfirmar: (
    publicacaoId: number,
    dto: MovimentacaoEstoqueRequest,
  ) => Promise<void>;
}

export const ModalMovimentar: React.FC<ModalMovimentarProps> = ({
  aberto,
  publicacao,
  tipoInicial,
  publicadores,
  onFechar,
  onConfirmar,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovimentacaoFormData>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      tipo: tipoInicial,
      quantidade: 1,
      publicadorId: "",
      observacoes: "",
    },
  });

  const tipoSelecionado = watch("tipo");

  if (!aberto || !publicacao) return null;

  const onSubmit = async (data: MovimentacaoFormData) => {
    await onConfirmar(publicacao.id, {
      tipo: data.tipo,
      quantidade: Number(data.quantidade),
      publicadorId: data.publicadorId ? Number(data.publicadorId) : undefined,
      observacoes: data.observacoes || undefined,
    });
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
              {publicacao.codigo}
            </span>
            <h2 className="text-base font-bold text-white">
              Movimentar: {publicacao.titulo}
            </h2>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["SAIDA", "ENTRADA", "AJUSTE"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue("tipo", t)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  tipoSelecionado === t
                    ? t === "SAIDA"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : t === "ENTRADA"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                {t === "SAIDA"
                  ? "Saída"
                  : t === "ENTRADA"
                    ? "Entrada"
                    : "Inventário"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {tipoSelecionado === "AJUSTE"
                ? "Nova Quantidade Real em Estoque"
                : "Quantidade"}
            </label>
            <input
              type="number"
              min="1"
              {...register("quantidade", { valueAsNumber: true })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {errors.quantidade && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.quantidade.message}
              </p>
            )}
          </div>

          {tipoSelecionado === "SAIDA" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Publicador Destinatário (Opcional)
              </label>
              <select
                {...register("publicadorId")}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Balcão / Avulso</option>
                {publicadores.map((pub) => (
                  <option key={pub.id} value={pub.id}>
                    {pub.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Observação / Motivo
            </label>
            <input
              type="text"
              placeholder="Ex: Remessa Betel NF-1234, pioneiro regular, etc."
              {...register("observacoes")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
