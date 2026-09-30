import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Printer,
  X,
} from "lucide-react";

import type { StatusTerritorio, Territorio } from "../../types/territorio";
import { Button } from "../ui/Button";
import { SearchInput } from "../ui/SearchInput";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

interface MapaGeralModalProps {
  territorios: Territorio[];
  congregacaoNome?: string;
  onClose: () => void;
  onSelecionarTerritorio?: (territorio: Territorio) => void;
}

const CENTRO_PADRAO: [number, number] = [-29.716099, -53.806924];

const STATUS_FILTROS: Array<{
  valor: "TODOS" | StatusTerritorio;
  label: string;
}> = [
  { valor: "TODOS", label: "Todos" },
  { valor: "DISPONIVEL", label: "Disponível" },
  { valor: "EM_TRABALHO", label: "Em Uso" },
  { valor: "EM_ATRASO", label: "Em Atraso" },
];

function getStatusColor(status: StatusTerritorio): string {
  switch (status) {
    case "DISPONIVEL":
      return "#10b981";
    case "EM_TRABALHO":
      return "#f59e0b";
    case "EM_ATRASO":
      return "#f43f5e";
    default:
      return "#64748b";
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

function StatusIcon({ status }: { status: StatusTerritorio }) {
  switch (status) {
    case "DISPONIVEL":
      return (
        <CheckCircle2
          size={14}
          className="shrink-0 text-emerald-600"
          aria-hidden="true"
        />
      );

    case "EM_TRABALHO":
      return (
        <Clock
          size={14}
          className="shrink-0 text-amber-600"
          aria-hidden="true"
        />
      );

    case "EM_ATRASO":
      return (
        <AlertCircle
          size={14}
          className="shrink-0 text-rose-600"
          aria-hidden="true"
        />
      );

    default:
      return null;
  }
}

export function MapaGeralModal({
  territorios,
  congregacaoNome,
  onClose,
  onSelecionarTerritorio,
}: MapaGeralModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonsMapRef = useRef<Map<number, L.Polygon>>(new Map());

  const [filtroStatus, setFiltroStatus] = useState<"TODOS" | StatusTerritorio>(
    "TODOS",
  );
  const [busca, setBusca] = useState("");
  const [territorioAtivoId, setTerritorioAtivoId] = useState<number | null>(
    null,
  );

  const territoriosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return territorios.filter((territorio) => {
      const matchStatus =
        filtroStatus === "TODOS" || territorio.status === filtroStatus;

      const matchBusca =
        !termo ||
        territorio.nome.toLowerCase().includes(termo) ||
        territorio.numero.toLowerCase().includes(termo);

      return matchStatus && matchBusca;
    });
  }, [territorios, filtroStatus, busca]);

  const territoriosMapeados = useMemo(
    () =>
      territorios.filter((territorio) => Boolean(territorio.poligonoGeojson)),
    [territorios],
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(CENTRO_PADRAO, 14);

    mapInstanceRef.current = map;

    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.featureGroup().addTo(map);
    const polyMap = new Map<number, L.Polygon>();

    territorios.forEach((territorio) => {
      if (!territorio.poligonoGeojson) return;

      try {
        const parsed = JSON.parse(territorio.poligonoGeojson) as GeoJsonPolygon;

        if (
          parsed.type !== "Polygon" ||
          !Array.isArray(parsed.coordinates) ||
          parsed.coordinates.length === 0 ||
          !Array.isArray(parsed.coordinates[0]) ||
          parsed.coordinates[0].length < 4
        ) {
          return;
        }

        const coords = parsed.coordinates[0].map(
          ([longitude, latitude]) => [latitude, longitude] as [number, number],
        );

        const cor = getStatusColor(territorio.status);

        const polygon = L.polygon(coords, {
          color: cor,
          weight: 3,
          fillColor: cor,
          fillOpacity: 0.08,
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; color: #334155; min-width: 160px;">
            <strong style="font-size: 14px; color: #0f172a;">
              Território Nº ${territorio.numero}
            </strong>
            <br />
            <span style="font-weight: 600;">
              ${territorio.nome}
            </span>

            <div
              style="
                margin-top: 8px;
                padding: 3px 7px;
                border-radius: 6px;
                display: inline-block;
                font-weight: 600;
                background: ${cor}18;
                color: ${cor};
              "
            >
              ${getStatusLabel(territorio.status)}
            </div>

            ${
              territorio.descricao
                ? `
                  <p style="margin: 7px 0 0; color: #64748b; font-size: 11px;">
                    ${territorio.descricao}
                  </p>
                `
                : ""
            }
          </div>
        `;

        polygon.bindPopup(popupContent);

        polygon.bindTooltip(`Nº ${territorio.numero} - ${territorio.nome}`, {
          sticky: true,
        });

        polygon.on("click", () => {
          setTerritorioAtivoId(territorio.id);
          onSelecionarTerritorio?.(territorio);
        });

        polygon.addTo(layerGroup);
        polyMap.set(territorio.id, polygon);
      } catch (error) {
        console.error(`Erro ao plotar território ${territorio.id}:`, error);
      }
    });

    polygonsMapRef.current = polyMap;

    if (layerGroup.getLayers().length > 0) {
      map.fitBounds(layerGroup.getBounds(), {
        padding: [40, 40],
      });
    }

    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      window.clearTimeout(timeout);
      map.remove();
      mapInstanceRef.current = null;
      polygonsMapRef.current = new Map();
    };
  }, [territorios, onSelecionarTerritorio]);

  const focarTerritorio = (territorio: Territorio) => {
    setTerritorioAtivoId(territorio.id);

    const map = mapInstanceRef.current;
    const polygon = polygonsMapRef.current.get(territorio.id);

    if (!map || !polygon) return;

    map.flyToBounds(polygon.getBounds(), {
      padding: [60, 60],
      duration: 1.2,
    });

    polygon.openPopup();
    onSelecionarTerritorio?.(territorio);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6 print:static print:bg-white print:p-0">
      <div
        className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl print:h-auto print:max-w-none print:rounded-none print:border-none print:shadow-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mapa-geral-titulo"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Layers size={20} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2
                id="mapa-geral-titulo"
                className="truncate text-base font-semibold text-slate-900 sm:text-lg"
              >
                Mapa geral da congregação
              </h2>

              <p className="truncate text-xs text-slate-500">
                {congregacaoNome
                  ? `Congregação: ${congregacaoNome}`
                  : "Visão territorial"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleImprimir}
            >
              <Printer size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Fechar mapa geral"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <aside className="z-10 flex h-[42%] w-full shrink-0 flex-col border-b border-slate-200 bg-slate-50 lg:h-full lg:w-80 lg:border-b-0 lg:border-r print:hidden">
            <div className="space-y-3 border-b border-slate-200 bg-white p-3">
              <SearchInput
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar território..."
                onClear={() => setBusca("")}
              />

              <div
                className="flex gap-1.5 overflow-x-auto pb-1"
                role="group"
                aria-label="Filtrar por status"
              >
                {STATUS_FILTROS.map((filtro) => {
                  const ativo = filtroStatus === filtro.valor;

                  return (
                    <button
                      key={filtro.valor}
                      type="button"
                      onClick={() => setFiltroStatus(filtro.valor)}
                      aria-pressed={ativo}
                      className={`whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        ativo
                          ? "border-slate-700 bg-slate-800 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {filtro.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
              {territoriosFiltrados.length === 0 ? (
                <div className="flex h-full min-h-32 items-center justify-center px-4 text-center text-sm text-slate-500">
                  Nenhum território encontrado.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {territoriosFiltrados.map((territorio) => {
                    const temPoligono = Boolean(territorio.poligonoGeojson);
                    const ativo = territorioAtivoId === territorio.id;
                    const cor = getStatusColor(territorio.status);

                    return (
                      <button
                        key={territorio.id}
                        type="button"
                        onClick={() =>
                          temPoligono && focarTerritorio(territorio)
                        }
                        disabled={!temPoligono}
                        aria-label={
                          temPoligono
                            ? `Focar território ${territorio.numero}, ${territorio.nome}`
                            : `Território ${territorio.numero}, sem mapa`
                        }
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                          !temPoligono
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                            : ativo
                              ? "border-slate-300 bg-white shadow-sm"
                              : "border-transparent bg-white hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                            style={{
                              backgroundColor: `${cor}12`,
                              color: cor,
                              border: `1px solid ${cor}30`,
                            }}
                          >
                            {territorio.numero}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {territorio.nome}
                            </p>

                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              {temPoligono ? (
                                <>
                                  <StatusIcon status={territorio.status} />
                                  {getStatusLabel(territorio.status)}
                                </>
                              ) : (
                                "Sem mapa"
                              )}
                            </span>
                          </div>
                        </div>

                        {temPoligono && (
                          <ChevronRight
                            size={16}
                            className="shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <div className="relative min-h-0 flex-1">
            <div
              ref={mapContainerRef}
              className="h-full min-h-0 w-full"
              aria-label="Mapa geral dos territórios"
            />

            <div className="absolute bottom-4 right-4 z-1000 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm print:hidden">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  Disponível
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                  Em Uso
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                  Em Atraso
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:px-6 print:hidden">
          <span>
            Territórios mapeados:{" "}
            <strong className="font-semibold text-slate-800">
              {territoriosMapeados.length}
            </strong>{" "}
            de{" "}
            <strong className="font-semibold text-slate-800">
              {territorios.length}
            </strong>
          </span>

          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </footer>
      </div>
    </div>
  );
}
