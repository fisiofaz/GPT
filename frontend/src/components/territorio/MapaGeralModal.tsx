import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  X,
  Layers,
  Printer,
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Territorio, StatusTerritorio } from "../../types/territorio";

interface MapaGeralModalProps {
  territorios: Territorio[];
  congregacaoNome?: string;
  onClose: () => void;
  onSelecionarTerritorio?: (territorio: Territorio) => void;
}

export const MapaGeralModal: React.FC<MapaGeralModalProps> = ({
  territorios,
  congregacaoNome,
  onClose,
  onSelecionarTerritorio,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonsMapRef = useRef<Map<number, L.Polygon>>(new Map());

  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");
  const [territorioAtivoId, setTerritorioAtivoId] = useState<number | null>(
    null,
  );

  const getStatusColor = (status: StatusTerritorio) => {
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
  };

  const getStatusIcon = (status: StatusTerritorio) => {
    switch (status) {
      case "DISPONIVEL":
        return (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        );
      case "EM_TRABALHO":
        return <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case "EM_ATRASO":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: StatusTerritorio) => {
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
  };

  const territoriosFiltrados = territorios.filter((t) => {
    const matchStatus = filtroStatus === "TODOS" || t.status === filtroStatus;
    const matchBusca =
      t.nome.toLowerCase().includes(busca.toLowerCase()) ||
      t.numero.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  // Inicializar o mapa e registrar os polígonos
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([-29.6842, -53.8069], 14);

    L.control.zoom({ position: "topright" }).addTo(map);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const layerGroup = L.featureGroup().addTo(map);
    const polyMap = new Map<number, L.Polygon>();

    territorios.forEach((t) => {
      if (!t.poligonoGeoJson) return;
      try {
        const coords: [number, number][] = JSON.parse(t.poligonoGeoJson);
        if (coords.length >= 3) {
          const cor = getStatusColor(t.status);

          const polygon = L.polygon(coords, {
            color: cor,
            weight: 3,
            fill: false,
          });

          const popupContent = `
            <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 2px;">
              <strong style="font-size: 14px; color: #0f172a;">Território Nº ${t.numero}</strong><br/>
              <span style="font-weight: 600;">${t.nome}</span><br/>
              <div style="margin-top: 6px; padding: 2px 6px; border-radius: 4px; display: inline-block; font-weight: bold; background: ${cor}20; color: ${cor};">
                ${getStatusLabel(t.status)}
              </div>
              ${t.descricao ? `<p style="margin-top: 4px; color: #64748b; font-size: 11px;">${t.descricao}</p>` : ""}
            </div>
          `;

          polygon.bindPopup(popupContent);
          polygon.bindTooltip(`Nº ${t.numero} - ${t.nome}`, { sticky: true });

          polygon.on("click", () => {
            setTerritorioAtivoId(t.id);
            if (onSelecionarTerritorio) onSelecionarTerritorio(t);
          });

          polygon.addTo(layerGroup);
          polyMap.set(t.id, polygon);
        }
      } catch (e) {
        console.error("Erro ao plotar:", e);
      }
    });

    polygonsMapRef.current = polyMap;

    if (layerGroup.getLayers().length > 0) {
      map.fitBounds(layerGroup.getBounds(), { padding: [40, 40] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [territorios]);

  // Função para focar suavemente no território selecionado na lista
  const focarTerritorio = (t: Territorio) => {
    setTerritorioAtivoId(t.id);
    const map = mapInstanceRef.current;
    const polygon = polygonsMapRef.current.get(t.id);

    if (map && polygon) {
      map.flyToBounds(polygon.getBounds(), {
        padding: [60, 60],
        duration: 1.2,
      });
      polygon.openPopup();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Top Header */}
        <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                Mapa Geral da Congregação
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {congregacaoNome
                  ? `Congregação: ${congregacaoNome}`
                  : "Visão territorial"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="py-2 px-2.5 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo Principal: Empilhado no Mobile (flex-col) e Lado a Lado no Desktop (lg:flex-row) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Sidebar Lateral / Superior de Territórios */}
          <aside className="w-full lg:w-80 bg-slate-950/90 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col z-10 print:hidden h-2/5 lg:h-full shrink-0">
            <div className="p-3 border-b border-slate-800 space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar mapa..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {["TODOS", "DISPONIVEL", "EM_TRABALHO", "EM_ATRASO"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setFiltroStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                        filtroStatus === st
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {st === "TODOS"
                        ? "Todos"
                        : st === "EM_TRABALHO"
                          ? "Em Uso"
                          : st.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {territoriosFiltrados.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Nenhum território encontrado.
                </div>
              ) : (
                territoriosFiltrados.map((t) => {
                  const temPoligono = Boolean(t.poligonoGeoJson);
                  const isAtivo = territorioAtivoId === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => temPoligono && focarTerritorio(t)}
                      disabled={!temPoligono}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        !temPoligono
                          ? "opacity-40 bg-slate-900/30 border-slate-900 cursor-not-allowed"
                          : isAtivo
                            ? "bg-indigo-600/15 border-indigo-500 shadow-md"
                            : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                          style={{
                            backgroundColor: `${getStatusColor(t.status)}15`,
                            color: getStatusColor(t.status),
                            border: `1px solid ${getStatusColor(t.status)}30`,
                          }}
                        >
                          {t.numero}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {t.nome}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            {getStatusIcon(t.status)}
                            {temPoligono
                              ? getStatusLabel(t.status)
                              : "Sem polígono"}
                          </span>
                        </div>
                      </div>

                      {temPoligono && (
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Área do Mapa */}
          <div className="flex-1 relative z-0 h-3/5 lg:h-full">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Legenda Flutuante */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-400 bg-slate-900/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-800 shadow-xl space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Status
              </span>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>Em Uso</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>Em Atraso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 print:hidden shrink-0">
          <span>
            Territórios mapeados:{" "}
            <strong className="text-white">
              {territorios.filter((t) => t.poligonoGeoJson).length}
            </strong>{" "}
            de <strong className="text-white">{territorios.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
