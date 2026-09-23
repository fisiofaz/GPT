import type { Territorio } from "../../types/territorio";
import { ConfirmModal } from "../ui/ConfirmModal";

interface ModalConfirmacaoExclusaoTerritorioProps {
  territorio: Territorio | null;
  onFechar: () => void;
  onConfirmar: () => void;
}

export function ModalConfirmacaoExclusaoTerritorio({
  territorio,
  onFechar,
  onConfirmar,
}: ModalConfirmacaoExclusaoTerritorioProps) {
  if (!territorio) {
    return null;
  }

  const handleConfirmar = () => {
    onConfirmar();
    onFechar();
  };

  return (
    <ConfirmModal
      aberto={Boolean(territorio)}
      titulo="Confirmar exclusão"
      mensagem={
        <>
          Tem certeza que deseja excluir o{" "}
          <strong className="font-semibold text-slate-900">
            Território {territorio.numero} ({territorio.nome})
          </strong>
          ? Esta ação removerá o mapa do acervo da congregação.
        </>
      }
      confirmLabel="Confirmar exclusão"
      cancelLabel="Cancelar"
      variant="danger"
      onCancelar={onFechar}
      onConfirmar={handleConfirmar}
    />
  );
}
