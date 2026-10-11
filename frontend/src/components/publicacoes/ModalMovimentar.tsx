import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageMinus, PackagePlus, X } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "../ui/Button";

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

const TIPOS_MOVIMENTACAO: { valor: TipoMovimentacao; rotulo: string }[] = [
  { valor: "SAIDA", rotulo: "Saída" },
  { valor: "ENTRADA", rotulo: "Entrada" },
  { valor: "AJUSTE", rotulo: "Inventário" },
];

export const ModalMovimentar = ({
  aberto,
  publicacao,
  tipoInicial,
  publicadores,
  onFechar,
  onConfirmar,
}: ModalMovimentarProps) => {
  const {
    register,
    handleSubmit,
    reset,
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

  useEffect(() => {
    if (aberto && publicacao) {
      reset({
        tipo: tipoInicial,
        quantidade: 1,
        publicadorId: "",
        observacoes: "",
      });
    }
  }, [aberto, publicacao, tipoInicial, reset]);

  if (!aberto || !publicacao) return null;

  const fecharModal = () => {
    if (isSubmitting) return;
    onFechar();
  };

  const onSubmit = async (data: MovimentacaoFormData) => { 
    const dto: MovimentacaoEstoqueRequest = { 
      tipo: data.tipo, 
      quantidade: Number(data.quantidade), 
      publicadorId: 
        data.tipo === "SAIDA" && data.publicadorId 
          ? Number(data.publicadorId) 
          : undefined, 
      observacoes: data.observacoes?.trim() || undefined, 
    }; 
    
    try { 
      await onConfirmar(publicacao.id, dto); 
      onFechar(); 
    } catch (error: unknown) { 
      console.error("[Movimentação] Erro ao registrar:", error); 
      toast.error( 
        error instanceof Error 
        ? error.message 
        : "Não foi possível registrar a movimentação.", 
      ); 
    } 
  };

  const classeTipo = (tipo: TipoMovimentacao) => {
    const selecionado = tipoSelecionado === tipo;
    if (!selecionado) {
      return "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
    }
    switch (tipo) {
      case "SAIDA":
        return "border-rose-300 bg-rose-50 text-rose-700";
      case "ENTRADA":
        return "border-emerald-300 bg-emerald-50 text-emerald-700";
      case "AJUSTE":
        return "border-amber-300 bg-amber-50 text-amber-700";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) fecharModal();
      }}
    >
      
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-movimentacao"
        aria-describedby="descricao-modal-movimentacao"
        className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          
          <div className="min-w-0">
            
            <span className="font-mono text-xs font-semibold text-slate-500">
              
              {publicacao.codigo}
            </span>
            <h2
              id="titulo-modal-movimentacao"
              className="mt-1 text-base font-semibold text-slate-900"
            >
              
              Movimentar publicação
            </h2>
            <p
              id="descricao-modal-movimentacao"
              className="mt-1 text-sm text-slate-600"
            >

              {publicacao.titulo}
            </p>
          </div>
          <button
            type="button"
            onClick={fecharModal}
            disabled={isSubmitting}
            aria-label="Fechar movimentação"
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
          <fieldset disabled={isSubmitting} className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Tipo de movimentação
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_MOVIMENTACAO.map(({ valor, rotulo }) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={tipoSelecionado === valor}
                  onClick={() =>
                    setValue("tipo", valor, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={`min-h-10 rounded-lg border px-2 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${classeTipo(valor)}`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label
              htmlFor="quantidade-movimentacao"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {tipoSelecionado === "AJUSTE"
                ? "Quantidade real em estoque *"
                : "Quantidade *"}
            </label>
            <input
              id="quantidade-movimentacao"
              type="number"
              min={tipoSelecionado === "AJUSTE" ? 0 : 1}
              step={1}
              inputMode="numeric"
              aria-invalid={Boolean(errors.quantidade)}
              aria-describedby={
                errors.quantidade ? "erro-quantidade-movimentacao" : undefined
              }
              {...register("quantidade", { valueAsNumber: true })}
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            />
            {errors.quantidade && (
              <p
                id="erro-quantidade-movimentacao"
                role="alert"
                className="mt-1 text-xs text-rose-600"
              >
                {errors.quantidade.message}
              </p>
            )}
            {tipoSelecionado === "AJUSTE" && (
              <p className="mt-1 text-xs text-slate-500">
                Informe o total físico contado. O sistema ajustará o estoque
                para essa quantidade.
              </p>
            )}
          </div>
          {tipoSelecionado === "SAIDA" && (
            <div>
              <label
                htmlFor="publicador-destinatario"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Publicador destinatário
                <span className="ml-1 font-normal text-slate-500">
                  (opcional)
                </span>
              </label>
              <select
                id="publicador-destinatario"
                {...register("publicadorId")}
                disabled={isSubmitting}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              >
                <option value="">Balcão / Avulso</option>
                {publicadores.map((publicador) => (
                  <option key={publicador.id} value={publicador.id}>
                    {publicador.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label
              htmlFor="observacoes-movimentacao"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Observação / motivo
              <span className="ml-1 font-normal text-slate-500">
                (opcional)
              </span>
            </label>
            <textarea
              id="observacoes-movimentacao"
              rows={3}
              maxLength={1000}
              placeholder="Ex.: remessa Betel, inventário físico..."
              {...register("observacoes")}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            />
            {errors.observacoes && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {errors.observacoes.message}
              </p>
            )}
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={fecharModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando...
                </>
              ) : tipoSelecionado === "SAIDA" ? (
                <>
                  <PackageMinus size={16} /> Confirmar saída
                </>
              ) : tipoSelecionado === "ENTRADA" ? (
                <>
                  <PackagePlus size={16} /> Confirmar entrada
                </>
              ) : (
                "Confirmar inventário"
              )}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
};
