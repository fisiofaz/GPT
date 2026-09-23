import { UserCheck, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  designacaoSchema,
  type DesignacaoFormData,
} from "../../schemas/territorioSchema";
import type { Territorio, DesignacaoRequest } from "../../types/territorio";
import type { Publicador } from "../../types/publicador";
import { Button } from "../ui/Button";

interface ModalDesignarProps {
  aberto: boolean;
  territorio: Territorio | null;
  publicadores: Publicador[];
  onFechar: () => void;
  onConfirmar: (territorioId: number, dto: DesignacaoRequest) => Promise<void>;
}

export function ModalDesignar({
  aberto,
  territorio,
  publicadores,
  onFechar,
  onConfirmar,
}: ModalDesignarProps) {
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

  if (!aberto || !territorio) {
    return null;
  }

  const onSubmit = async (data: DesignacaoFormData) => {
    await onConfirmar(territorio.id, {
      publicadorId: Number(data.publicadorId),
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
        aria-labelledby="designar-territorio-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <UserCheck size={18} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="designar-territorio-title"
                className="text-base font-semibold text-slate-900"
              >
                Designar território
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
            <div>
              <label
                htmlFor="designacao-publicador"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Publicador
              </label>

              <select
                id="designacao-publicador"
                {...register("publicadorId")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                aria-invalid={Boolean(errors.publicadorId)}
                aria-describedby={
                  errors.publicadorId
                    ? "designacao-publicador-error"
                    : undefined
                }
              >
                <option value="">Selecione um publicador...</option>

                {publicadores.map((pub) => (
                  <option key={pub.id} value={pub.id}>
                    {pub.nome} ({pub.telefone || "Sem telefone"})
                  </option>
                ))}
              </select>

              {errors.publicadorId && (
                <p
                  id="designacao-publicador-error"
                  className="mt-1.5 text-sm text-rose-600"
                >
                  {errors.publicadorId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="designacao-observacoes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Observações
                <span className="ml-1 font-normal text-slate-400">
                  (opcional)
                </span>
              </label>

              <input
                id="designacao-observacoes"
                type="text"
                placeholder="Ex.: Campanha especial, saída aos sábados..."
                {...register("observacoes")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
              Confirmar designação
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
