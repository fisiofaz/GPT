import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  territorioSchema,
  type TerritorioFormData,
} from "../../schemas/territorioSchema";
import type { TerritorioRequest } from "../../types/territorio";
import { Button } from "../ui/Button";

interface ModalCriarTerritorioProps {
  aberto: boolean;
  congregacaoId: number;
  onFechar: () => void;
  onSalvar: (dto: TerritorioRequest) => Promise<void>;
}

export function ModalCriarTerritorio({
  aberto,
  congregacaoId,
  onFechar,
  onSalvar,
}: ModalCriarTerritorioProps) {
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

  if (!aberto) {
    return null;
  }

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
        aria-labelledby="criar-territorio-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Plus size={18} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="criar-territorio-title"
                className="text-base font-semibold text-slate-900"
              >
                Cadastrar território
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informe os dados básicos do novo território.
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
                htmlFor="territorio-numero"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Número
              </label>

              <input
                id="territorio-numero"
                type="text"
                placeholder="Ex.: 01"
                autoComplete="off"
                {...register("numero")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                aria-invalid={Boolean(errors.numero)}
                aria-describedby={
                  errors.numero ? "territorio-numero-error" : undefined
                }
              />

              {errors.numero && (
                <p
                  id="territorio-numero-error"
                  className="mt-1.5 text-sm text-rose-600"
                >
                  {errors.numero.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="territorio-nome"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Nome / Região
              </label>

              <input
                id="territorio-nome"
                type="text"
                placeholder="Ex.: Centro Comercial"
                autoComplete="off"
                {...register("nome")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                aria-invalid={Boolean(errors.nome)}
                aria-describedby={
                  errors.nome ? "territorio-nome-error" : undefined
                }
              />

              {errors.nome && (
                <p
                  id="territorio-nome-error"
                  className="mt-1.5 text-sm text-rose-600"
                >
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="territorio-descricao"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Descrição
                <span className="ml-1 font-normal text-slate-400">
                  (opcional)
                </span>
              </label>

              <textarea
                id="territorio-descricao"
                rows={3}
                placeholder="Ex.: Prédios com portaria, quadras de 1 a 5..."
                {...register("descricao")}
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
              Salvar território
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
