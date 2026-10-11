import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import {
  publicacaoSchema,
  type PublicacaoFormData,
} from "../../schemas/publicacaoSchema";

import type {
  Publicacao,
  PublicacaoRequest,
  CatalogoMestreItem,
  FormatoPublicacao,
  IdiomaPublicacao,
} from "../../types/publicacao";

import { Button } from "../ui/Button";

interface ModalPublicacaoFormProps {
  aberto: boolean;
  itemEmEdicao: Publicacao | null;
  catalogoMestre: CatalogoMestreItem[];
  congregacaoId: number;
  formatos: { valor: FormatoPublicacao; rotulo: string }[];
  idiomas: { valor: IdiomaPublicacao; rotulo: string }[];
  onFechar: () => void;
  onSalvar: (
    dto: PublicacaoRequest,
    id?: number,
  ) => Promise<void>;
}

interface FormularioPublicacaoProps {
  itemEmEdicao: Publicacao | null;
  catalogoMestre: CatalogoMestreItem[];
  congregacaoId: number;
  formatos: { valor: FormatoPublicacao; rotulo: string }[];
  idiomas: { valor: IdiomaPublicacao; rotulo: string }[];
  onFechar: () => void;
  onSalvar: (
    dto: PublicacaoRequest,
    id?: number,
  ) => Promise<void>;
}

const valoresIniciais = (
  item: Publicacao | null,
): PublicacaoFormData => ({
  codigo: item?.codigo ?? "",
  titulo: item?.titulo ?? "",
  categoria: item?.categoria ?? "LIVRO",
  formato: item?.formato ?? "NORMAL",
  idioma: item?.idioma ?? "PORTUGUES",
  quantidadeEstoque: item?.quantidadeEstoque ?? 0,
  estoqueMinimo: item?.estoqueMinimo ?? 5,
});

const FormularioPublicacao = ({
  itemEmEdicao,
  catalogoMestre,
  congregacaoId,
  formatos,
  idiomas,
  onFechar,
  onSalvar,
}: FormularioPublicacaoProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PublicacaoFormData>({
    resolver: zodResolver(publicacaoSchema),
    defaultValues: valoresIniciais(itemEmEdicao),
  });

  const codigoAtual = watch("codigo");

  useEffect(() => {
    reset(valoresIniciais(itemEmEdicao));
  }, [itemEmEdicao, reset]);

  useEffect(() => {
    if (itemEmEdicao || !codigoAtual.trim()) return;

    const modelo = catalogoMestre.find(
      (item) =>
        item.codigo.trim().toLowerCase() ===
        codigoAtual.trim().toLowerCase(),
    );

    if (!modelo) return;

    setValue("titulo", modelo.titulo, {
      shouldValidate: true,
    });
    setValue("categoria", modelo.categoria, {
      shouldValidate: true,
    });
    setValue("formato", modelo.formato, {
      shouldValidate: true,
    });
    setValue("idioma", modelo.idioma, {
      shouldValidate: true,
    });
  }, [codigoAtual, catalogoMestre, itemEmEdicao, setValue]);

  const selecionarModelo = (item: CatalogoMestreItem) => {
    setValue("codigo", item.codigo, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("titulo", item.titulo, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("categoria", item.categoria, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("formato", item.formato, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("idioma", item.idioma, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const fecharFormulario = () => {
    if (isSubmitting) return;
    onFechar();
  };

  const onSubmit = async (data: PublicacaoFormData) => {
    const dto: PublicacaoRequest = {
      ...data,
      codigo: data.codigo.trim(),
      titulo: data.titulo.trim(),
      congregacaoId,
    };

    try {
      await onSalvar(dto, itemEmEdicao?.id);
      onFechar();
    } catch (error: unknown) {
      console.error("[Publicação] Erro ao salvar:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a publicação.",
      );
    }
  };

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-publicacao"
      className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl"
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {itemEmEdicao ? <Pencil size={19} /> : <Plus size={19} />}
          </div>

          <div className="min-w-0">
            <h2
              id="titulo-modal-publicacao"
              className="text-base font-semibold text-slate-900"
            >
              {itemEmEdicao
                ? `Editar publicação: ${itemEmEdicao.codigo}`
                : "Cadastrar publicação"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Cadastro de publicação no estoque da congregação
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fecharFormulario}
          disabled={isSubmitting}
          aria-label="Fechar formulário"
          className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
        {!itemEmEdicao && catalogoMestre.length > 0 && (
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-slate-600" />

              <h3 className="text-sm font-semibold text-slate-800">
                Modelos do Catálogo Mestre
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Selecione um modelo para preencher os dados automaticamente,
              ou digite seu código no campo abaixo.
            </p>

            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {catalogoMestre.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => selecionarModelo(item)}
                  title={item.titulo}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
                >
                  <span className="block font-mono text-xs font-semibold text-slate-800">
                    {item.codigo}
                  </span>
                  <span className="mt-0.5 block max-w-48 truncate text-xs text-slate-500">
                    {item.titulo}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="codigo-publicacao"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Código *
            </label>

            <input
              id="codigo-publicacao"
              type="text"
              autoComplete="off"
              maxLength={100}
              placeholder="Ex.: nwt-normal"
              disabled={Boolean(itemEmEdicao) || isSubmitting}
              aria-invalid={Boolean(errors.codigo)}
              {...register("codigo")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
            />

            {errors.codigo && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {errors.codigo.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="categoria-publicacao"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Categoria *
            </label>

            <select
              id="categoria-publicacao"
              {...register("categoria")}
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            >
              <option value="BIBLIA">Bíblia</option>
              <option value="LIVRO">Livro</option>
              <option value="BROCHURA">Brochura</option>
              <option value="REVISTA">Revista</option>
              <option value="FOLHETO">Folheto</option>
              <option value="TRATADO">Tratado</option>
              <option value="CARTAO">Cartão</option>
              <option value="CONVITE">Convite</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="titulo-publicacao"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Título da publicação *
          </label>

          <input
            id="titulo-publicacao"
            type="text"
            maxLength={255}
            placeholder="Informe o título oficial"
            aria-invalid={Boolean(errors.titulo)}
            {...register("titulo")}
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
          />

          {errors.titulo && (
            <p role="alert" className="mt-1 text-xs text-rose-600">
              {errors.titulo.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="formato-publicacao"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Tipo / formato *
            </label>

            <select
              id="formato-publicacao"
              {...register("formato")}
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            >
              {formatos.map((formato) => (
                <option key={formato.valor} value={formato.valor}>
                  {formato.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="idioma-publicacao"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Idioma *
            </label>

            <select
              id="idioma-publicacao"
              {...register("idioma")}
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            >
              {idiomas.map((idioma) => (
                <option key={idioma.valor} value={idioma.valor}>
                  {idioma.rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!itemEmEdicao && (
            <div>
              <label
                htmlFor="quantidade-inicial"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Quantidade inicial
              </label>

              <input
                id="quantidade-inicial"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                {...register("quantidadeEstoque", {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              />

              {errors.quantidadeEstoque && (
                <p role="alert" className="mt-1 text-xs text-rose-600">
                  {errors.quantidadeEstoque.message}
                </p>
              )}

              <p className="mt-1 text-xs text-slate-500">
                Usada somente na criação da publicação.
              </p>
            </div>
          )}

          <div className={itemEmEdicao ? "" : ""}>
            <label
              htmlFor="estoque-minimo"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Estoque mínimo (alerta) *
            </label>

            <input
              id="estoque-minimo"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              {...register("estoqueMinimo", {
                valueAsNumber: true,
              })}
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            />

            {errors.estoqueMinimo && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {errors.estoqueMinimo.message}
              </p>
            )}
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={fecharFormulario}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : itemEmEdicao ? (
              "Salvar alterações"
            ) : (
              "Cadastrar publicação"
            )}
          </Button>
        </footer>
      </form>
    </section>
  );
};

export const ModalPublicacaoForm = ({
  aberto,
  itemEmEdicao,
  ...props
}: ModalPublicacaoFormProps) => {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          // O próprio formulário bloqueia o fechamento durante o envio.
          // O backdrop não fecha automaticamente para evitar perda de dados.
        }
      }}
    >
      <FormularioPublicacao
        key={itemEmEdicao ? `edit-${itemEmEdicao.id}` : "nova-publicacao"}
        itemEmEdicao={itemEmEdicao}
        {...props}
      />
    </div>
  );
};