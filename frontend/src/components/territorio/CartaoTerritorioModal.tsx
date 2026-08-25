import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { X, Printer, ExternalLink, MapPin } from "lucide-react";
import type { Territorio } from "../../types/territorio";

interface CartaoTerritorioModalProps {
  territorio: Territorio;
  onClose: () => void;
}

export const CartaoTerritorioModal: React.FC<CartaoTerritorioModalProps> = ({
  territorio,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  let coordenadas: [number, number][] = [];
  if (territorio.poligonoGeojson) {
    try {
      coordenadas = JSON.parse(territorio.poligonoGeojson);
    } catch (e) {
      console.error("Erro ao fazer parse do polígono:", e);
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let center: [number, number] = [-29.6842, -53.8069];
    const zoom = 15;

    if (coordenadas.length > 0) {
      center = coordenadas[0];
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(center, zoom);

    L.control.zoom({ position: "topright" }).addTo(map);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (coordenadas.length >= 3) {
      const polygon = L.polygon(coordenadas, {
        color: "#2563eb",
        weight: 3,
        fillColor: "#ffffff00",
        fillOpacity: 0.35,
      }).addTo(map);

      map.fitBounds(polygon.getBounds(), { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [coordenadas]);

  const handleAbrirGoogleMaps = () => {
    if (coordenadas.length > 0) {
      const [lat, lng] = coordenadas[0];
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank",
      );
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Cabeçalho */}
        <div className="p-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
              {territorio.numero}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cartão de Território: {territorio.nome}
              </h2>
              <p className="text-xs text-slate-400">
                {territorio.congregacaoNome}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {coordenadas.length > 0 && (
              <button
                onClick={handleAbrirGoogleMaps}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                title="Abrir no Google Maps"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">GPS / Google Maps</span>
              </button>
            )}

            <button
              onClick={handleImprimir}
              className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cabeçalho exclusivo para impressão (S-12) */}
        <div className="hidden print:block p-4 border-b-2 border-black">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">
                Cartão de Território — Nº {territorio.numero}
              </h1>
              <p className="text-sm font-semibold text-gray-700">
                {territorio.nome}
              </p>
              <p className="text-xs text-gray-500">
                {territorio.congregacaoNome}
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              {territorio.descricao && <p>Obs: {territorio.descricao}</p>}
            </div>
          </div>
        </div>

        {/* Mapa do Território */}
        <div className="h-112.5 sm:h-125 w-full relative z-0">
          {coordenadas.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2 p-6 text-center">
              <MapPin className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-semibold text-white">
                Nenhum limite desenhado para este mapa
              </p>
              <p className="text-xs text-slate-500">
                Utilize a opção "Desenhar Limites" no card do território para
                traçar os limites geográficos.
              </p>
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}
        </div>

        {/* Rodapé */}
        {territorio.descricao && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 print:text-black print:bg-white print:border-black">
            <strong className="text-slate-300 print:text-black">
              Notas / Descrição:
            </strong>{" "}
            {territorio.descricao}
          </div>
        )}
      </div>
    </div>
  );
};
