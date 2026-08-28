import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, X, Loader2 } from "lucide-react";
import {
  devolucaoSchema,
  type DevolucaoFormData,
} from "../../schemas/territorioSchema";
import type { Territorio, DevolucaoRequest } from "../../types/territorio";

interface ModalDevolverProps {
  aberto: boolean;
  territorio: Territorio | null;
  onFechar: () => void;
  onConfirmar: (territorioId: number, dto: DevolucaoRequest) => Promise<void>;
}

export const ModalDevolver: React.FC<ModalDevolverProps> = ({
  aberto,
  territorio,
  onFechar,
  onConfirmar,
}) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<DevolucaoFormData>({
    resolver: zodResolver(devolucaoSchema),
    defaultValues: { observacoes: "" },
  });

  if (!aberto || !territorio) return null;

  const onSubmit = async (data: DevolucaoFormData) => {
    await onConfirmar(territorio.id, {
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
            <RotateCcw className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Devolver Território
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

        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300">
          Designado atualmente para:{" "}
          <strong className="text-white font-semibold">
            {territorio.publicadorAtualNome || "Publicador"}
          </strong>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Notas de Conclusão / Observações (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Território 100% trabalhado, poucas casas não atendidas."
              {...register("observacoes")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
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
              className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirmar Devolução"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
