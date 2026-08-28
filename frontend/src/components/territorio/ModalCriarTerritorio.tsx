import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Loader2 } from "lucide-react";
import {
  territorioSchema,
  type TerritorioFormData,
} from "../../schemas/territorioSchema";
import type { TerritorioRequest } from "../../types/territorio";

interface ModalCriarTerritorioProps {
  aberto: boolean;
  congregacaoId: number;
  onFechar: () => void;
  onSalvar: (dto: TerritorioRequest) => Promise<void>;
}

export const ModalCriarTerritorio: React.FC<ModalCriarTerritorioProps> = ({
  aberto,
  congregacaoId,
  onFechar,
  onSalvar,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TerritorioFormData>({
    resolver: zodResolver(territorioSchema),
    defaultValues: {
      numero: "",
      nome: "",
      descricao: "",
    },
  });

  if (!aberto) return null;

  const onSubmit = async (data: TerritorioFormData) => {
    await onSalvar({
      numero: data.numero.trim(),
      nome: data.nome.trim(),
      descricao: data.descricao?.trim() || undefined,
      congregacaoId,
    });
    reset();
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Cadastrar Território
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
              Número
            </label>
            <input
              type="text"
              placeholder="Ex: 01"
              {...register("numero")}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
            {errors.numero && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.numero.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nome / Região
            </label>
            <input
              type="text"
              placeholder="Ex: Centro Comercial"
              {...register("nome")}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {errors.nome && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.nome.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Prédios com portaria, quadras de 1 a 5..."
              {...register("descricao")}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onFechar}
              className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
