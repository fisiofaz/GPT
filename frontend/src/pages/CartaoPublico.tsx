import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import {
  Navigation,
  ExternalLink,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { territorioService } from "../services/territorioService";
import type { Territorio } from "../types/territorio";

export const CartaoPublico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const [territorio, setTerritorio] = useState<Territorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [localizando, setLocalizando] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        setCarregando(true);
        const dados = await territorioService.buscarPublico(Number(id));
        setTerritorio(dados);
      } catch {
        setErro("Não foi possível carregar o mapa do território.");
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [id]);

  useEffect(() => {
    if (!territorio || !mapContainerRef.current) return;

    let coordenadas: [number, number][] = [];
    if (territorio.poligonoGeojson) {
      try {
        coordenadas = JSON.parse(territorio.poligonoGeojson);
      } catch (e) {
        console.error("Erro ao ler polígono:", e);
      }
    }

    const center: [number, number] =
      coordenadas.length > 0 ? coordenadas[0] : [-29.6842, -53.8069];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(center, 16);

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

    if (coordenadas.length >= 3) {
      const polygon = L.polygon(coordenadas, {
        color: "#2563eb",
        weight: 4,
        fill: false,
      }).addTo(map);

      map.fitBounds(polygon.getBounds(), { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [territorio]);

  // Função para ativar o GPS do celular
  const handleMinhaLocalizacao = () => {
    const map = mapInstanceRef.current;
    if (!map || !navigator.geolocation) {
      alert("Geolocalização não suportada pelo seu navegador.");
      return;
    }

    setLocalizando(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalizando(false);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([userLat, userLng]);
        } else {
          userMarkerRef.current = L.circleMarker([userLat, userLng], {
            radius: 8,
            color: "#ffffff",
            fillColor: "#0284c7",
            fillOpacity: 1,
            weight: 3,
          })
            .bindPopup("📍 Você está aqui")
            .addTo(map);
        }

        map.flyTo([userLat, userLng], 17, { duration: 1.2 });
        userMarkerRef.current.openPopup();
      },
      () => {
        setLocalizando(false);
        alert("Não foi possível obter a sua localização GPS.");
      },
      { enableHighAccuracy: true },
    );
  };

  const handleAbrirGoogleMaps = () => {
    if (!territorio?.poligonoGeojson) return;
    try {
      const coords: [number, number][] = JSON.parse(territorio.poligonoGeojson);
      if (coords.length > 0) {
        const [lat, lng] = coords[0];
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          "_blank",
        );
      }
    } catch {
      // ignore
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm">Carregando mapa do território...</p>
      </div>
    );
  }

  if (erro || !territorio) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-3">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-lg font-bold text-white">Cartão não encontrado</h2>
        <p className="text-xs text-slate-500">{erro}</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans overflow-hidden">
      {/* Top Header Mobile */}
      <header className="px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-sm">
            {territorio.numero}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {territorio.nome}
            </h1>
            <p className="text-[11px] text-slate-400">
              {territorio.congregacaoNome}
            </p>
          </div>
        </div>

        <button
          onClick={handleAbrirGoogleMaps}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl border border-slate-700 transition-all flex items-center gap-1 text-xs"
          title="Abrir no Google Maps"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">GPS</span>
        </button>
      </header>

      {/* Mapa */}
      <div className="flex-1 relative z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Botão Flutuante Minha Localização (GPS) */}
        <button
          onClick={handleMinhaLocalizacao}
          disabled={localizando}
          className="absolute bottom-6 right-4 z-1000 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl shadow-indigo-600/40 border border-indigo-400/30 flex items-center gap-2 text-xs font-semibold active:scale-95 transition-all"
        >
          {localizando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>Onde estou?</span>
        </button>
      </div>

      {/* Rodapé com Observações (se houver) */}
      {territorio.descricao && (
        <footer className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-2 z-10 shrink-0">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>{territorio.descricao}</p>
        </footer>
      )}
    </div>
  );
};
