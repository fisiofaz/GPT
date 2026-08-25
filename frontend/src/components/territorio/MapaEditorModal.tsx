import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { X, Check, Trash2, Undo, MapPin, Loader2, Info } from "lucide-react";
import type { Territorio } from "../../types/territorio";
import { territorioService } from "../../services/territorioService";

// Correção dos ícones padrão do Leaflet no build Vite/Webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapaEditorModalProps {
  territorio: Territorio;
  onClose: () => void;
  onSalvo: () => void;
}

export const MapaEditorModal: React.FC<MapaEditorModalProps> = ({
  territorio,
  onClose,
  onSalvo,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [pontos, setPontos] = useState<[number, number][]>([]);
  const [salvando, setSalvando] = useState(false);

  // Inicializar o mapa e carregar polígono existente (se houver)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let initialCenter: [number, number] = [29.716099, -53.806924]; // Centro padrão
    let initialZoom = 15;
    let pontosIniciais: [number, number][] = [];

    if (territorio.poligonoGeojson) {
      try {
        const parsed = JSON.parse(territorio.poligonoGeojson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          pontosIniciais = parsed;
          initialCenter = parsed[0];
          initialZoom = 16;
        }
      } catch (e) {
        console.error("Erro ao ler GeoJSON existente:", e);
      }
    }

    const map = L.map(mapContainerRef.current).setView(
      initialCenter,
      initialZoom,
    );
    mapInstanceRef.current = map;

    // Adiciona camada do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Força o Leaflet a recalcular as dimensões para alinhar perfeitamente o clique
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Captura cliques no mapa para adicionar vértices
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setPontos((prev) => [...prev, [lat, lng]]);
    });

    if (pontosIniciais.length > 0) {
      setPontos(pontosIniciais);
      const bounds = L.latLngBounds(pontosIniciais);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [territorio]);

  // Atualizar o desenho do contorno e marcadores sempre que a lista de pontos mudar
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Limpar marcadores anteriores
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Remover polígono anterior
    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
      polygonLayerRef.current = null;
    }

    // Criar marcadores visuais para cada vértice clicado
    pontos.forEach((coord, idx) => {
      const circleMarker = L.circleMarker(coord, {
        radius: 5,
        color: "#1d4ed8",
        fillColor: "#3b82f6",
        fillOpacity: 1,
        weight: 2,
      }).bindTooltip(`Ponto ${idx + 1}`, { permanent: false });

      if (markersGroupRef.current) {
        circleMarker.addTo(markersGroupRef.current);
      }
    });

    // Desenhar apenas o contorno sem preenchimento azul (fill: false)
    if (pontos.length >= 3) {
      polygonLayerRef.current = L.polygon(pontos, {
        color: "#2563eb",
        weight: 4,
        fill: false,
      }).addTo(map);
    } else if (pontos.length === 2) {
      const linhaProvisoria = L.polyline(pontos, {
        color: "#2563eb",
        weight: 3,
        dashArray: "6, 6",
      }).addTo(map);
      polygonLayerRef.current = linhaProvisoria as unknown as L.Polygon;
    }
  }, [pontos]);

  const handleDesfazerUltimo = () => {
    setPontos((prev) => prev.slice(0, -1));
  };

  const handleLimparTudo = () => {
    setPontos([]);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const payload = pontos.length >= 3 ? JSON.stringify(pontos) : null;
      await territorioService.atualizarMapa(territorio.id, payload);
      onSalvo();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar os limites do mapa:", err);
      alert("Erro ao salvar os limites do mapa.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              {territorio.numero}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Delimitar Mapa: {territorio.nome}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                Clique nos cantos das ruas para traçar os limites da quadra.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mapa Interativo */}
        <div className="flex-1 relative z-0">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Barra Flutuante de Ações e Controles */}
          <div className="absolute top-4 right-4 z-1000 flex flex-col sm:flex-row gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onClick={handleDesfazerUltimo}
              disabled={pontos.length === 0}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Undo className="w-3.5 h-3.5" />
              <span>Desfazer Ponto</span>
            </button>

            <button
              onClick={handleLimparTudo}
              disabled={pontos.length === 0}
              className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Rodapé com Informações e Salvar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            {pontos.length < 3 ? (
              <span className="text-amber-400">
                Marque no mínimo 3 pontos no mapa para fechar a área do
                território. (Atuais: {pontos.length})
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                Polígono fechado com sucesso ({pontos.length} vértices). Pronto
                para salvar!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando || (pontos.length > 0 && pontos.length < 3)}
              className="w-1/2 sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {salvando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Mapa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
