import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, X, Sparkles, Loader2 } from "lucide-react";
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

interface ModalPublicacaoFormProps {
  aberto: boolean;
  itemEmEdicao: Publicacao | null;
  catalogoMestre: CatalogoMestreItem[];
  congregacaoId: number;
  formatos: { valor: FormatoPublicacao; rotulo: string }[];
  idiomas: { valor: IdiomaPublicacao; rotulo: string }[];
  onFechar: () => void;
  onSalvar: (dto: PublicacaoRequest, id?: number) => Promise<void>;
}

const FormularioPublicacao: React.FC<{
  itemEmEdicao: Publicacao | null;
  catalogoMestre: CatalogoMestreItem[];
  congregacaoId: number;
  formatos: { valor: FormatoPublicacao; rotulo: string }[];
  idiomas: { valor: IdiomaPublicacao; rotulo: string }[];
  onFechar: () => void;
  onSalvar: (dto: PublicacaoRequest, id?: number) => Promise<void>;
}> = ({
  itemEmEdicao,
  catalogoMestre,
  congregacaoId,
  formatos,
  idiomas,
  onFechar,
  onSalvar,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PublicacaoFormData>({
    resolver: zodResolver(publicacaoSchema),
    defaultValues: itemEmEdicao
      ? {
          codigo: itemEmEdicao.codigo,
          titulo: itemEmEdicao.titulo,
          categoria: itemEmEdicao.categoria,
          formato: itemEmEdicao.formato,
          idioma: itemEmEdicao.idioma,
          quantidadeEstoque: itemEmEdicao.quantidadeEstoque,
          estoqueMinimo: itemEmEdicao.estoqueMinimo,
        }
      : {
          codigo: "",
          titulo: "",
          categoria: "LIVRO",
          formato: "NORMAL",
          idioma: "PORTUGUES",
          quantidadeEstoque: 0,
          estoqueMinimo: 5,
        },
  });

  const codigoAtual = watch("codigo");

  // Autopreenchimento ao digitar código conhecido
  useEffect(() => {
    if (!itemEmEdicao && codigoAtual) {
      const modelo = catalogoMestre.find(
        (m) => m.codigo.toLowerCase() === codigoAtual.trim().toLowerCase(),
      );
      if (modelo) {
        setValue("titulo", modelo.titulo);
        setValue("categoria", modelo.categoria);
        setValue("formato", modelo.formato);
        setValue("idioma", modelo.idioma);
      }
    }
  }, [codigoAtual, catalogoMestre, itemEmEdicao, setValue]);

  const handleSelecionarModelo = (item: CatalogoMestreItem) => {
    setValue("codigo", item.codigo);
    setValue("titulo", item.titulo);
    setValue("categoria", item.categoria);
    setValue("formato", item.formato);
    setValue("idioma", item.idioma);
  };

  const onSubmit = async (data: PublicacaoFormData) => {
    await onSalvar(
      {
        ...data,
        congregacaoId,
      },
      itemEmEdicao?.id,
    );
    onFechar();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          {itemEmEdicao ? (
            <>
              <Pencil className="w-4 h-4 text-indigo-400" />
              Editar Publicação: {itemEmEdicao.codigo}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-indigo-400" />
              Cadastrar Nova Publicação
            </>
          )}
        </h2>
        <button
          onClick={onFechar}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!itemEmEdicao && catalogoMestre.length > 0 && (
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modelos Prontos do Catálogo Oficial</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {catalogoMestre.map((item) => (
              <button
                key={item.codigo}
                type="button"
                onClick={() => handleSelecionarModelo(item)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[11px] font-mono text-slate-300 hover:text-indigo-200 transition-all cursor-pointer"
                title={item.titulo}
              >
                {item.codigo}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Código
            </label>
            <input
              type="text"
              disabled={Boolean(itemEmEdicao)}
              placeholder="Ex: nwt-normal"
              {...register("codigo")}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            {errors.codigo && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.codigo.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <select
              {...register("categoria")}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
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
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Título da Publicação
          </label>
          <input
            type="text"
            placeholder="Ex: Tradução do Novo Mundo das Escrituras Sagradas"
            {...register("titulo")}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          {errors.titulo && (
            <p className="text-[10px] text-rose-400 mt-1">
              {errors.titulo.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tipo / Formato
            </label>
            <select
              {...register("formato")}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {formatos.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Idioma
            </label>
            <select
              {...register("idioma")}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {idiomas.map((i) => (
                <option key={i.valor} value={i.valor}>
                  {i.rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!itemEmEdicao && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Qtd. Inicial
              </label>
              <input
                type="number"
                min="0"
                {...register("quantidadeEstoque", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              {errors.quantidadeEstoque && (
                <p className="text-[10px] text-rose-400 mt-1">
                  {errors.quantidadeEstoque.message}
                </p>
              )}
            </div>
          )}

          <div className={itemEmEdicao ? "col-span-2" : ""}>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Estoque Mínimo (Alerta)
            </label>
            <input
              type="number"
              min="0"
              {...register("estoqueMinimo", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {errors.estoqueMinimo && (
              <p className="text-[10px] text-rose-400 mt-1">
                {errors.estoqueMinimo.message}
              </p>
            )}
          </div>
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
            ) : itemEmEdicao ? (
              "Salvar Alterações"
            ) : (
              "Salvar Item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ModalPublicacaoForm: React.FC<ModalPublicacaoFormProps> = ({
  aberto,
  itemEmEdicao,
  ...props
}) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <FormularioPublicacao
        key={itemEmEdicao ? `edit-${itemEmEdicao.id}` : "novo-item"}
        itemEmEdicao={itemEmEdicao}
        {...props}
      />
    </div>
  );
};
