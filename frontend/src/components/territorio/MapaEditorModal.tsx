import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Check, Info, Loader2, MapPin, Trash2, Undo, X } from "lucide-react";

import type { Territorio } from "../../types/territorio";
import { territorioService } from "../../services/territorioService";

import { Button } from "../ui/Button";

// Correção dos ícones padrão do Leaflet no build Vite.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

interface MapaEditorModalProps {
  territorio: Territorio;
  onClose: () => void;
  onSalvo: () => void;
}

const CENTRO_PADRAO: [number, number] = [-29.716099, -53.806924];

export function MapaEditorModal({
  territorio,
  onClose,
  onSalvo,
}: MapaEditorModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [pontos, setPontos] = useState<[number, number][]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let initialCenter: [number, number] = CENTRO_PADRAO;
    let initialZoom = 15;
    let pontosIniciais: [number, number][] = [];

    if (territorio.poligonoGeoJson) {
      try {
        const parsed = JSON.parse(territorio.poligonoGeoJson) as GeoJsonPolygon;

        if (
          parsed.type === "Polygon" &&
          Array.isArray(parsed.coordinates) &&
          parsed.coordinates.length > 0 &&
          parsed.coordinates[0].length >= 4
        ) {
          const coordenadasGeoJson = parsed.coordinates[0];

          pontosIniciais = coordenadasGeoJson.map(([longitude, latitude]) => [
            latitude,
            longitude,
          ]);

          if (pontosIniciais.length > 0) {
            initialCenter = pontosIniciais[0];
            initialZoom = 16;
          }
        }
      } catch (error) {
        console.error("Erro ao ler GeoJSON existente:", error);
      }
    }

    const map = L.map(mapContainerRef.current).setView(
      initialCenter,
      initialZoom,
    );

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const atualizarTamanhoMapa = () => {
      map.invalidateSize();
    };

    const timeout = window.setTimeout(atualizarTamanhoMapa, 200);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    map.on("click", (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;

      setErro(null);
      setPontos((prev) => [...prev, [lat, lng]]);
    });

    if (pontosIniciais.length > 0) {
      setPontos(pontosIniciais);

      const bounds = L.latLngBounds(pontosIniciais);
      map.fitBounds(bounds, {
        padding: [40, 40],
      });
    }

    return () => {
      window.clearTimeout(timeout);
      map.remove();
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
      polygonLayerRef.current = null;
    };
  }, [territorio]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map) return;

    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
      polygonLayerRef.current = null;
    }

    pontos.forEach((coord, index) => {
      const circleMarker = L.circleMarker(coord, {
        radius: 5,
        color: "#1d4ed8",
        fillColor: "#3b82f6",
        fillOpacity: 1,
        weight: 2,
      }).bindTooltip(`Ponto ${index + 1}`, {
        permanent: false,
      });

      markersGroupRef.current?.addLayer(circleMarker);
    });

    if (pontos.length >= 3) {
      polygonLayerRef.current = L.polygon(pontos, {
        color: "#2563eb",
        weight: 4,
        fill: false,
      }).addTo(map);
    } else if (pontos.length === 2) {
      polygonLayerRef.current = L.polyline(pontos, {
        color: "#2563eb",
        weight: 3,
        dashArray: "6, 6",
      }).addTo(map);
    }
  }, [pontos]);

  const handleDesfazerUltimo = () => {
    setErro(null);
    setPontos((prev) => prev.slice(0, -1));
  };

  const handleLimparTudo = () => {
    setErro(null);
    setPontos([]);
  };

  const handleSalvar = async () => {
    if (pontos.length < 3) {
      setErro("Marque pelo menos 3 pontos no mapa antes de salvar.");
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const primeiroPonto = pontos[0];

      const ultimoPonto = pontos[pontos.length - 1];

      const pontosFechados =
        ultimoPonto[0] === primeiroPonto[0] &&
        ultimoPonto[1] === primeiroPonto[1]
          ? pontos
          : [...pontos, primeiroPonto];

      const geoJson: GeoJsonPolygon = {
        type: "Polygon",
        coordinates: [
          pontosFechados.map(([latitude, longitude]) => [longitude, latitude]),
        ],
      };

      await territorioService.salvarPoligono(territorio.id, geoJson);

      onSalvo();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar os limites do mapa:", error);
      setErro("Não foi possível salvar os limites do mapa. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mapa-editor-titulo"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
              {territorio.numero}
            </div>

            <div className="min-w-0">
              <h2
                id="mapa-editor-titulo"
                className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg"
              >
                <MapPin
                  size={18}
                  className="shrink-0 text-slate-600"
                  aria-hidden="true"
                />
                <span className="truncate">
                  Delimitar mapa: {territorio.nome}
                </span>
              </h2>

              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <Info size={13} aria-hidden="true" />
                Clique nos cantos das ruas para traçar os limites.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Fechar editor do mapa"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="relative z-0 min-h-0 flex-1">
          <div ref={mapContainerRef} className="h-full w-full" />

          <div className="absolute right-4 top-4 z-1000 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDesfazerUltimo}
              disabled={pontos.length === 0 || salvando}
            >
              <Undo size={14} />
              Desfazer
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleLimparTudo}
              disabled={pontos.length === 0 || salvando}
            >
              <Trash2 size={14} />
              Limpar
            </Button>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          {erro && (
            <div
              className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {erro}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs sm:text-sm">
              {pontos.length < 3 ? (
                <span className="text-amber-600">
                  Marque no mínimo 3 pontos para fechar a área.{" "}
                  <strong>Atuais: {pontos.length}</strong>
                </span>
              ) : (
                <span className="font-medium text-emerald-600">
                  Polígono fechado com sucesso ({pontos.length} vértices).
                </span>
              )}
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={salvando}
                fullWidth
              >
                Cancelar
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSalvar}
                disabled={salvando || pontos.length < 3}
                fullWidth
              >
                {salvando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Salvar mapa
                  </>
                )}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
