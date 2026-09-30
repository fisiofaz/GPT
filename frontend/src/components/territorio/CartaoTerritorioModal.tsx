import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { ExternalLink, MapPin, Printer, X } from "lucide-react";

import type { Territorio } from "../../types/territorio";
import { Button } from "../ui/Button";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

interface CartaoTerritorioModalProps {
  territorio: Territorio;
  onClose: () => void;
}

const CENTRO_PADRAO: [number, number] = [-29.716099, -53.806924];

export function CartaoTerritorioModal({
  territorio,
  onClose,
}: CartaoTerritorioModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const coordenadas = useMemo<[number, number][]>(() => {
    if (!territorio.poligonoGeojson) {
      return [];
    }

    try {
      const parsed = JSON.parse(territorio.poligonoGeojson) as GeoJsonPolygon;

      if (
        parsed.type !== "Polygon" ||
        !Array.isArray(parsed.coordinates) ||
        parsed.coordinates.length === 0 ||
        !Array.isArray(parsed.coordinates[0]) ||
        parsed.coordinates[0].length < 4
      ) {
        return [];
      }

      return parsed.coordinates[0].map(
        ([longitude, latitude]) => [latitude, longitude] as [number, number],
      );
    } catch (error) {
      console.error("Erro ao fazer parse do polígono:", error);
      return [];
    }
  }, [territorio.poligonoGeojson]);

  useEffect(() => {
    if (!mapContainerRef.current || coordenadas.length === 0) {
      return;
    }

    const center = coordenadas[0] ?? CENTRO_PADRAO;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(center, 15);

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

    const polygon = L.polygon(coordenadas, {
      color: "#2563eb",
      weight: 3,
      fillColor: "#2563eb",
      fillOpacity: 0.06,
    }).addTo(map);

    map.fitBounds(polygon.getBounds(), {
      padding: [30, 30],
    });

    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      window.clearTimeout(timeout);
      map.remove();
    };
  }, [coordenadas]);

  const handleAbrirGoogleMaps = () => {
    if (coordenadas.length === 0) {
      return;
    }

    const [latitude, longitude] = coordenadas[0];

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6 print:static print:bg-white print:p-0">
      <div
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl print:max-w-none print:rounded-none print:border-none print:shadow-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartao-territorio-titulo"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
              {territorio.numero}
            </div>

            <div className="min-w-0">
              <h2
                id="cartao-territorio-titulo"
                className="truncate text-base font-semibold text-slate-900 sm:text-lg"
              >
                Cartão de território
              </h2>

              <p className="truncate text-xs text-slate-500">
                {territorio.nome}
                {territorio.congregacaoNome
                  ? ` · ${territorio.congregacaoNome}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {coordenadas.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAbrirGoogleMaps}
                title="Abrir localização no Google Maps"
              >
                <ExternalLink size={15} aria-hidden="true" />
                <span className="hidden sm:inline">Google Maps</span>
              </Button>
            )}

            <Button type="button" size="sm" onClick={handleImprimir}>
              <Printer size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Fechar cartão de território"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="hidden border-b-2 border-black p-4 print:block">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">
                Cartão de Território — Nº {territorio.numero}
              </h1>

              <p className="text-sm font-semibold text-gray-700">
                {territorio.nome}
              </p>

              {territorio.congregacaoNome && (
                <p className="text-xs text-gray-500">
                  {territorio.congregacaoNome}
                </p>
              )}
            </div>

            {territorio.descricao && (
              <div className="max-w-sm text-right text-xs text-gray-500">
                <p>Obs: {territorio.descricao}</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-0 h-[55vh] min-h-80 w-full sm:h-125 print:h-105">
          {coordenadas.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <MapPin size={24} aria-hidden="true" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Nenhum limite desenhado para este território
                </p>

                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Utilize a opção "Desenhar Limites" no cartão do território
                  para traçar os limites geográficos.
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              className="h-full w-full"
              aria-label={`Mapa do território ${territorio.numero}`}
            />
          )}
        </div>

        {territorio.descricao && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:px-6 print:border-black print:bg-white print:text-black">
            <strong className="font-semibold text-slate-800 print:text-black">
              Notas / Descrição:
            </strong>{" "}
            {territorio.descricao}
          </div>
        )}

        <footer className="flex justify-end border-t border-slate-200 bg-white px-4 py-3 print:hidden sm:px-6">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </footer>
      </div>
    </div>
  );
}
