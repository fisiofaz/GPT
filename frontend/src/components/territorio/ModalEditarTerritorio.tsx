import { useState } from "react";
import { Pencil, X } from "lucide-react";

import type { Territorio } from "../../types/territorio";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface ModalEditarTerritorioProps {
  territorio: Territorio | null;
  onFechar: () => void;
  onSalvar: (
    territorioId: number,
    dados: {
      numero: string;
      nome: string;
      descricao?: string;
    },
  ) => Promise<void>;
}

export function ModalEditarTerritorio({
  territorio,
  onFechar,
  onSalvar,
}: ModalEditarTerritorioProps) {
  const [numero, setNumero] = useState(territorio?.numero ?? "");
  const [nome, setNome] = useState(territorio?.nome ?? "");
  const [descricao, setDescricao] = useState(
    territorio?.descricao ?? "",
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  if (!territorio) {
    return null;
  }

  const handleSalvar = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const numeroNormalizado = numero.trim();
    const nomeNormalizado = nome.trim();
    const descricaoNormalizada = descricao.trim();

    if (!numeroNormalizado) {
      setErro("Informe o número do território.");
      return;
    }

    if (!nomeNormalizado) {
      setErro("Informe o nome ou bairro do território.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      await onSalvar(territorio.id, {
        numero: numeroNormalizado,
        nome: nomeNormalizado,
        descricao: descricaoNormalizada || undefined,
      });

      onFechar();
    } catch (error) {
      console.error("Erro ao atualizar território:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o território.",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-editar-territorio-titulo"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Pencil size={18} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="modal-editar-territorio-titulo"
                className="text-base font-semibold text-slate-900"
              >
                Editar território
              </h2>

              <p className="text-sm text-slate-500">
                Atualize os dados cadastrais do território.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSalvar}>
          <div className="space-y-5 px-5 py-5">
            {erro && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {erro}
              </div>
            )}

            <div>
              <label
                htmlFor="territorio-numero"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Número
              </label>

              <Input
                id="territorio-numero"
                value={numero}
                onChange={(event) => setNumero(event.target.value)}
                placeholder="Ex.: 001"
                maxLength={20}
                disabled={salvando}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="territorio-nome"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Nome / Bairro
              </label>

              <Input
                id="territorio-nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Centro"
                maxLength={150}
                disabled={salvando}
              />
            </div>

            <div>
              <label
                htmlFor="territorio-descricao"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Descrição
              </label>

              <textarea
                id="territorio-descricao"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Descrição ou observações do território"
                rows={4}
                disabled={salvando}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-xs leading-5 text-slate-500">
                A congregação, o status, a designação e os limites do mapa
                não são alterados por esta edição.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}