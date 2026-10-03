import {
  MessageCircle,
  Edit3,
  Map,
  RotateCcw,
  UserCheck,
  Trash2, } from "lucide-react";

import { gerarLinkWhatsAppTerritorio } from "../../utils/whatsappTerritorio";

import type { StatusTerritorio, Territorio } from "../../types/territorio";

import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface CardTerritorioProps {
  territorio: Territorio;
  onDesignar: (territorio: Territorio) => void;
  onDevolver: (territorio: Territorio) => void;
  onVisualizarCartao: (territorio: Territorio) => void;
  onDesenharMapa: (territorio: Territorio) => void;
  onEditar: (territorio: Territorio) => void;
  onExcluir: (id: number, numero: string) => Promise<void>;
}

function getStatusBadgeVariant(
  status: StatusTerritorio,
): "success" | "warning" | "danger" {
  switch (status) {
    case "DISPONIVEL":
      return "success";

    case "EM_TRABALHO":
      return "warning";

    case "EM_ATRASO":
      return "danger";

    default:
      return "danger";
  }
}

function getStatusLabel(status: StatusTerritorio): string {
  switch (status) {
    case "DISPONIVEL":
      return "Disponível";
    case "EM_TRABALHO":
      return "Em Uso";
    case "EM_ATRASO":
      return "Em Atraso";
    default:
      return status;
  }
}

export function CardTerritorio({
  territorio,
  onDesignar,
  onDevolver,
  onVisualizarCartao,
  onDesenharMapa,
  onEditar,
  onExcluir,
}: CardTerritorioProps) {
  const temLinkWhatsApp = territorio.status === "EM_TRABALHO";

  const handleExcluir = async () => {
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir o território ${territorio.numero} - ${territorio.nome}?`,
    );
    if (!confirmado) {
      return;
    }
    await onExcluir(territorio.id, territorio.numero);
  };

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
            {territorio.numero}
          </div>

          <Badge variant={getStatusBadgeVariant(territorio.status)}>
            {getStatusLabel(territorio.status)}
          </Badge>
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">
            {territorio.nome}
          </h3>

          {territorio.descricao && (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
              {territorio.descricao}
            </p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onVisualizarCartao(territorio)}
            fullWidth
          >
            <Map size={15} aria-hidden="true" />
            Cartão
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onDesenharMapa(territorio)}
            fullWidth
          >
            <Edit3 size={15} aria-hidden="true" />
            Desenhar
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onEditar(territorio)}
            fullWidth
            className=""
          >
            <Edit3 size={15} aria-hidden="true" />
            Editar dados
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => void handleExcluir()}
            fullWidth
          >
            {" "}
            <Trash2 size={15} aria-hidden="true" /> Excluir{" "}
          </Button>

          {temLinkWhatsApp && (
            <a
              href={gerarLinkWhatsAppTerritorio(territorio)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enviar território ${territorio.numero} pelo WhatsApp`}
              title="Enviar no WhatsApp"
              className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none"
            >
              <MessageCircle size={15} aria-hidden="true" />
              Enviar pelo WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        {territorio.status === "DISPONIVEL" ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onDesignar(territorio)}
            fullWidth
          >
            <UserCheck size={16} aria-hidden="true" />
            Designar / Retirar
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onDevolver(territorio)}
            fullWidth
          >
            <RotateCcw size={16} aria-hidden="true" />
            Registrar devolução
          </Button>
        )}
      </div>
    </Card>
  );
}
