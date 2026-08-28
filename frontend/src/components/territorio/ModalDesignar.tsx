import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCheck, X, Loader2 } from "lucide-react";
import {
  designacaoSchema,
  type DesignacaoFormData,
} from "../../schemas/territorioSchema";
import type { Territorio, DesignacaoRequest } from "../../types/territorio";
import type { Publicador } from "../../types/publicador";

interface ModalDesignarProps {
  aberto: boolean;
  territorio: Territorio | null;
  publicadores: Publicador[];
  onFechar: () => void;
  onConfirmar: (territorioId: number, dto: DesignacaoRequest) => Promise<void>;
}

export const ModalDesignar: React.FC<ModalDesignarProps> = ({
  aberto,
  territorio,
  publicadores,
  onFechar,
  onConfirmar,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DesignacaoFormData>({
    resolver: zodResolver(designacaoSchema),
    defaultValues: {
      publicadorId: "",
      observacoes: "",
    },
  });

  if (!aberto || !territorio) return null;

  const onSubmit = async (data: DesignacaoFormData) => {
    await onConfirmar(territorio.id, {
      publicadorId: Number(data.publicadorId),
      observacoes: data.observacoes || undefined,
    });
    reset();
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Designar Território
              </h2>
              <p className="text-xs text-slate-400">
                Nº {territorio.numero} - {territorio.nome}
              </p>
            </div>
          </div>
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
              Selecione o Publicador
            </label>
            <select
              {...register("publicadorId")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Selecione um publicador...</option>
              {publicadores.map((pub) => (
                <option key={pub.id} value={pub.id}>
                  {pub.nome} ({pub.telefone || "Sem telefone"})
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Campanha especial, saída aos sábados, etc."
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
                "Confirmar Designação"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
