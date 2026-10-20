import { RotateCcw, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  devolucaoSchema,
  type DevolucaoFormData,
} from "../../schemas/territorioSchema";
import type { Territorio, DevolucaoRequest } from "../../types/territorio";
import { Button } from "../ui/Button";

interface ModalDevolverProps {
  aberto: boolean;
  territorio: Territorio | null;
  onFechar: () => void;
  onConfirmar: (territorioId: number, dto: DevolucaoRequest) => Promise<void>;
}

export function ModalDevolver({
  aberto,
  territorio,
  onFechar,
  onConfirmar,
}: ModalDevolverProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<DevolucaoFormData>({
    resolver: zodResolver(devolucaoSchema),
    defaultValues: {
      observacoes: "",
    },
  });

  if (!aberto || !territorio) {
    return null;
  }

  const onSubmit = async (data: DevolucaoFormData) => {
    await onConfirmar(territorio.id, {
      observacoes: data.observacoes || undefined,
    });

    reset();
    onFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onFechar();
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="devolver-territorio-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <RotateCcw size={18} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="devolver-territorio-title"
                className="text-base font-semibold text-slate-900"
              >
                Devolver território
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Nº {territorio.numero} — {territorio.nome}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={isSubmitting}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 px-5 py-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span>Designado atualmente para: </span>
              <strong className="font-semibold text-slate-900">
                {territorio.publicadorAtualNome || "Publicador"}
              </strong>
            </div>

            <div>
              <label
                htmlFor="devolucao-observacoes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Notas de conclusão / observações
                <span className="ml-1 font-normal text-slate-400">
                  (opcional)
                </span>
              </label>

              <textarea
                id="devolucao-observacoes"
                rows={4}
                placeholder="Ex.: Território 100% trabalhado, poucas casas não atendidas."
                {...register("observacoes")}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onFechar}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button type="submit" variant="primary" loading={isSubmitting}>
              Confirmar devolução
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
