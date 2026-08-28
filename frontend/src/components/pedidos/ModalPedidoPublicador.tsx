import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCheck, X, Loader2, BookOpen } from "lucide-react";
import {
  pedidoPublicadorSchema,
  type PedidoPublicadorFormData,
} from "../../schemas/pedidoSchema";
import type { Publicador } from "../../types/publicador";
import type { CatalogoMestreItem } from "../../types/publicacao";

interface ModalPedidoPublicadorProps {
  aberto: boolean;
  congregacaoId: number;
  publicadores: Publicador[];
  catalogoMestre: CatalogoMestreItem[];
  onFechar: () => void;
  onSalvar: (dto: {
    publicadorId: number;
    publicacaoId: number;
    congregacaoId: number;
    quantidade: number;
    observacoes?: string;
  }) => Promise<void>;
}

export const ModalPedidoPublicador: React.FC<ModalPedidoPublicadorProps> = ({
  aberto,
  congregacaoId,
  publicadores,
  catalogoMestre,
  onFechar,
  onSalvar,
}) => {
  const [filtroBusca, setFiltroBusca] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PedidoPublicadorFormData>({
    resolver: zodResolver(pedidoPublicadorSchema),
    defaultValues: {
      publicadorId: "",
      publicacaoId: "",
      quantidade: 1,
      observacoes: "",
    },
  });

  if (!aberto) return null;

  // Busca diretamente sobre o Catálogo Geral
  const itensCatalogoFiltrados = catalogoMestre.filter(
    (item) =>
      item.titulo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      item.codigo.toLowerCase().includes(filtroBusca.toLowerCase()),
  );

  const onSubmit = async (data: PedidoPublicadorFormData) => {
    await onSalvar({
      publicadorId: Number(data.publicadorId),
      publicacaoId: Number(data.publicacaoId),
      congregacaoId,
      quantidade: data.quantidade,
      observacoes: data.observacoes?.trim() || undefined,
    });
    reset();
    setFiltroBusca("");
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Novo Pedido de Publicador
          </h2>
          <button
            onClick={onFechar}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Publicador
            </label>
            <select
              {...register("publicadorId")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Selecione o publicador...</option>
              {publicadores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            {errors.publicadorId && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.publicadorId.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Publicação (Catálogo Geral)</span>
              </label>
              <span className="text-[10px] text-indigo-400 font-mono">
                {catalogoMestre.length} títulos disponíveis
              </span>
            </div>

            <input
              type="text"
              placeholder="🔍 Filtrar título ou código no catálogo..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full mb-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <select
              {...register("publicacaoId")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Selecione o item do Catálogo Geral...</option>
              {itensCatalogoFiltrados.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.codigo}] {item.titulo} ({item.idioma}) -{" "}
                  {item.categoria}
                </option>
              ))}
            </select>
            {errors.publicacaoId && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.publicacaoId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Quantidade Solicitada
            </label>
            <input
              type="number"
              min="1"
              {...register("quantidade", { valueAsNumber: true })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
            {errors.quantidade && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.quantidade.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Capa especial, presente, etc."
              {...register("observacoes")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
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
                "Registrar Pedido"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
